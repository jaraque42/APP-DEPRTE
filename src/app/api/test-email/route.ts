import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const testEmail = searchParams.get('email');

  if (!testEmail) {
    return NextResponse.json({ error: 'Añade ?email=tu@correo.com a la URL' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY no está configurada en las variables de entorno' });
  }

  try {
    const transport = nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: apiKey,
      },
    });

    // Verificar conexión SMTP
    await transport.verify();

    // Enviar email de prueba
    const result = await transport.sendMail({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: testEmail,
      subject: '✅ EOLCAIMFIT - Test de conexión SMTP',
      html: '<h1>¡Funciona!</h1><p>Si ves este correo, el servidor SMTP de Resend está correctamente configurado.</p>',
    });

    return NextResponse.json({ 
      success: true, 
      message: `Email enviado a ${testEmail}`,
      messageId: result.messageId,
      apiKeyPrefix: apiKey.substring(0, 10) + '...',
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      code: error.code,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'MISSING',
    }, { status: 500 });
  }
}
