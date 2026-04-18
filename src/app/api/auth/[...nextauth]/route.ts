import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import EmailProvider from 'next-auth/providers/email';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/mongodbClient';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

// Custom email sender using Resend HTTP API (more reliable than SMTP in serverless)
async function sendVerificationRequest({ identifier: email, url }: { identifier: string; url: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is missing');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: email,
      subject: '🔑 Tu enlace de acceso a EOLCAIMFIT',
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #fff; background: #0a0a0a; padding: 24px; border-radius: 16px; text-align: center;">
            EOLCAIM<span style="color: #DFFF00;">FIT</span>
          </h1>
          <p style="font-size: 16px; color: #333;">Haz clic en el siguiente botón para acceder a tu cuenta:</p>
          <a href="${url}" style="display: block; background: #DFFF00; color: #000; text-align: center; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 18px; margin: 24px 0;">
            ENTRAR A LA APP
          </a>
          <p style="font-size: 13px; color: #888;">Si no solicitaste este enlace, puedes ignorar este correo.</p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Resend error: ${JSON.stringify(error)}`);
  }
}

const handler = NextAuth({
  adapter: MongoDBAdapter(clientPromise as any),
  providers: [
    EmailProvider({
      sendVerificationRequest,
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        await connectToDatabase();

        const user = await User.findOne({ email: credentials.email });

        if (!user || (!user.passwordHash && !user.password)) {
          throw new Error('No user found with those credentials');
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash || user.password);

        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/',
    verifyRequest: '/verify-request',
  },
  secret: process.env.NEXTAUTH_SECRET || "eolcaimfit_super_secret_jwt_key_2026_dev",
});

export { handler as GET, handler as POST };
