import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.fastmail.com',
  port: 587,
  secure: false, // false for port 587, true for port 465
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

export default async function sendEmail(
  recipients: string[],
  subject: string,
  body: string,
  html?: string
) {
  await transporter.sendMail({
    from: `"Affordable Driving Traffic School" <${process.env.SMTP_USER}>`,
    to: recipients,
    subject,
    text: body,
    ...(html ? { html } : {}),
  });
} 