import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import EmailProvider from 'next-auth/providers/email';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/mongodbClient';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

const handler = NextAuth({
  adapter: MongoDBAdapter(clientPromise as any),
  providers: [
    EmailProvider({
      server: {
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        auth: {
          user: 'resend',
          pass: process.env.RESEND_API_KEY,
        },
      },
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
    verifyRequest: '/verify-request', // new page we will create
  },
  secret: process.env.NEXTAUTH_SECRET || "eolcaimfit_super_secret_jwt_key_2026_dev",
});

export { handler as GET, handler as POST };

