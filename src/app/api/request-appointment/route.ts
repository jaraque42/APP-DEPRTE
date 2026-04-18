import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userName, userEmail, date, time, reason } = body;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Servicio de email no configurado' }, { status: 500 });
    }

    // Send email to admin/professional via Resend HTTP API
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || 'onboarding@resend.dev',
        subject: `🗓️ Nueva Solicitud de Cita - ${userName}`,
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 20px;">
            <div style="background: #0a0a0a; border-radius: 16px; padding: 32px; color: #fff;">
              <h1 style="margin: 0 0 8px; font-size: 24px;">
                EOLCAIM<span style="color: #DFFF00;">FIT</span>
              </h1>
              <h2 style="color: #DFFF00; margin: 0 0 24px; font-size: 18px;">Nueva Solicitud de Cita</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); color: #888; width: 120px;">Atleta</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); font-weight: 600;">${userName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); color: #888;">Email</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <a href="mailto:${userEmail}" style="color: #DFFF00; text-decoration: none;">${userEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); color: #888;">Fecha</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); font-weight: 600;">${date}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); color: #888;">Hora</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); font-weight: 600;">${time}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #888; vertical-align: top;">Motivo</td>
                  <td style="padding: 12px 0;">${reason || 'No especificado'}</td>
                </tr>
              </table>

              <a href="mailto:${userEmail}?subject=Confirmación de cita EOLCAIMFIT" 
                 style="display: block; background: #DFFF00; color: #000; text-align: center; padding: 14px; border-radius: 12px; text-decoration: none; font-weight: 900; margin-top: 24px;">
                RESPONDER AL ATLETA
              </a>
            </div>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json({ error: `Error enviando email: ${JSON.stringify(error)}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Solicitud enviada correctamente' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
