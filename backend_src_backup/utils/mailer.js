import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const REQUEST_TIMEOUT_MS = 15000;

/** True when there is enough configuration to actually send an e-mail. */
export const isMailConfigured = () => {
  const { brevoApiKey, smtpUser, smtpPass, fromEmail } = env.mail;
  return Boolean(fromEmail && (brevoApiKey || (smtpUser && smtpPass)));
};

// ---- Option 1: Brevo REST API (BREVO_API_KEY) ----
async function sendWithBrevoApi({ to, toName, subject, html, text, attachments }) {
  const payload = {
    sender: { name: env.mail.fromName, email: env.mail.fromEmail },
    to: [{ email: to, ...(toName ? { name: toName.slice(0, 100) } : {}) }],
    subject,
    htmlContent: html,
    ...(text ? { textContent: text } : {}),
    ...(attachments.length
      ? { attachment: attachments.map((file) => ({ name: file.filename, content: file.content.toString('base64') })) }
      : {}),
  };

  let response;
  try {
    response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: { 'api-key': env.mail.brevoApiKey, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    throw new Error(`Brevo API request failed: ${error.message}`);
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Brevo API ${response.status}: ${body.slice(0, 300)}`);
  }
}

// ---- Option 2: Brevo SMTP relay (SMTP_USER / SMTP_PASS) ----
let transporter;
const getTransporter = () => {
  transporter ??= nodemailer.createTransport({
    host: env.mail.smtpHost,
    port: env.mail.smtpPort,
    secure: env.mail.smtpPort === 465,
    auth: { user: env.mail.smtpUser, pass: env.mail.smtpPass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: REQUEST_TIMEOUT_MS,
  });
  return transporter;
};

async function sendWithSmtp({ to, toName, subject, html, text, attachments }) {
  await getTransporter().sendMail({
    from: { name: env.mail.fromName, address: env.mail.fromEmail },
    to: toName ? { name: toName, address: to } : to,
    subject,
    html,
    text,
    attachments,
  });
}

/** Sends one transactional e-mail through Brevo. attachments: [{ filename, content: Buffer }] */
export async function sendMail({ to, toName, subject, html, text, attachments = [] }) {
  if (!isMailConfigured()) {
    throw new Error('E-mail is not configured. Set MAIL_FROM and SMTP_USER/SMTP_PASS (or BREVO_API_KEY) in backend/.env');
  }
  const message = { to, toName, subject, html, text, attachments };
  return env.mail.brevoApiKey ? sendWithBrevoApi(message) : sendWithSmtp(message);
}
