import nodemailer from 'nodemailer';

export function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: !!process.env.SMTP_SECURE, // '1' voor true
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendInviteEmail({ to, link }) {
  const from = process.env.MAIL_FROM || 'noreply@vos-crm.nl';
  const transport = createTransport();
  const html = `
    <p>Je bent uitgenodigd om een account aan te maken.</p>
    <p>Klik op de link om je wachtwoord in te stellen:</p>
    <p><a href="${link}">${link}</a></p>
    <p>Deze link verloopt over 7 dagen.</p>
  `;
  await transport.sendMail({
    from,
    to,
    subject: 'Uitnodiging VOS CRM',
    html,
  });
}
