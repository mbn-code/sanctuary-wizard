import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const resend = new Resend(resendApiKey);
    const { email, url, recipient, sender } = await req.json();

    if (!email || !url || !recipient) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const senderEmail = process.env.SENDER_EMAIL || 'onboarding@resend.dev';

    const { data, error } = await resend.emails.send({
      from: `Sanctuary <${senderEmail}>`,
      to: [email],
      subject: `Your Sanctuary for ${recipient} is ready!`,
      html: `
        <div style="font-family: serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #FDFCFB; color: #1F2937; border-radius: 40px; border: 1px solid rgba(0,0,0,0.05);">
          <h1 style="color: #D63447; font-size: 32px;">Your Sanctuary is Ready ✨</h1>
          <p style="font-style: italic; font-size: 18px; color: #6B7280;">Built with love by ${sender} for ${recipient}.</p>
          <hr style="border: none; border-top: 1px solid rgba(0,0,0,0.05); margin: 30px 0;" />
          <p style="font-size: 16px; line-height: 1.6;">Your digital gift has been encrypted and is ready to be shared. You can access it anytime using the link below:</p>
          <div style="padding: 20px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid rgba(0,0,0,0.05); word-break: break-all; margin: 20px 0;">
            <a href="${url}" style="color: #D63447; text-decoration: none; font-weight: bold; font-family: monospace; font-size: 14px;">${url}</a>
          </div>
          <p style="font-size: 14px; color: #6B7280;">Keep this link safe. Since we don't use a database, this link is the only way to access your gift.</p>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(0,0,0,0.05); text-align: center;">
            <p style="font-size: 12px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 2px;">Powered by Sanctuary Wizard</p>
          </div>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
