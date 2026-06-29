import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export async function sendSOSAlert(opts: {
  to: string[];
  userName: string;
  location: { latitude: number; longitude: number; address?: string };
}) {
  if (!env.SMTP_USER) return; // skip if not configured

  const mapsLink = `https://www.google.com/maps?q=${opts.location.latitude},${opts.location.longitude}`;
  const address = opts.location.address || `${opts.location.latitude}, ${opts.location.longitude}`;

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: opts.to.join(', '),
    subject: `🚨 SOS Alert from ${opts.userName}`,
    html: `
      <h2 style="color:#ef3b3b">Emergency Alert</h2>
      <p><strong>${opts.userName}</strong> has triggered an SOS alert.</p>
      <p><strong>Location:</strong> ${address}</p>
      <p><a href="${mapsLink}" style="background:#ef3b3b;color:white;padding:10px 20px;border-radius:6px;text-decoration:none">
        View on Map
      </a></p>
      <p style="color:#6c7484;font-size:12px">Sent via SafeTrack</p>
    `,
  });
}

export async function sendJourneyStartNotification(opts: {
  to: string[];
  userName: string;
  destination: string;
  eta?: string;
}) {
  if (!env.SMTP_USER) return;

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: opts.to.join(', '),
    subject: `${opts.userName} has started a journey`,
    html: `
      <h2 style="color:#3b5bff">Journey Started</h2>
      <p><strong>${opts.userName}</strong> has started a journey to <strong>${opts.destination}</strong>.</p>
      ${opts.eta ? `<p><strong>ETA:</strong> ${opts.eta}</p>` : ''}
      <p style="color:#6c7484;font-size:12px">Sent via SafeTrack</p>
    `,
  });
}
