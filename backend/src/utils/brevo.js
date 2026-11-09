const API_URL = 'https://api.brevo.com/v3/smtp/email';

const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/**
 * Send a transactional email through Brevo's REST API (no SDK needed, Node 18+).
 * attachments: [{ name: 'slip.pdf', content: '<base64>' }]
 */
async function sendEmail({ to, toName, subject, html, text: plainText, attachments }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!apiKey) throw new Error('BREVO_API_KEY is not set');
  if (!senderEmail) throw new Error('BREVO_SENDER_EMAIL is not set');
  if (typeof fetch !== 'function') throw new Error('Node 18+ is required (global fetch missing)');

  const payload = {
    sender: { name: process.env.BREVO_SENDER_NAME || 'PARQCO Smart Parking', email: senderEmail },
    to: [{ email: to, ...(toName ? { name: String(toName).slice(0, 100) } : {}) }],
    subject,
    htmlContent: html,
  };
  if (plainText) payload.textContent = plainText;
  if (attachments && attachments.length) payload.attachment = attachments;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  let res;
  try {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
  } catch (e) {
    throw new Error(e.name === 'AbortError' ? 'Brevo request timed out' : `Brevo network error: ${e.message}`);
  } finally {
    clearTimeout(timer);
  }

  const text = await res.text();
  let body = {};
  try { body = text ? JSON.parse(text) : {}; } catch (_) { /* non-JSON body */ }
  if (!res.ok) {
    const err = new Error(`Brevo ${res.status}: ${body.message || text || 'request failed'}`);
    err.status = res.status;
    throw err;
  }
  return body; // { messageId }
}

function otpEmailHtml({ name, code, purpose, minutes }) {
  const title = purpose === 'register' ? 'Verify your email' : 'Reset your password';
  const line = purpose === 'register'
    ? 'Welcome to PARQCO! Use this code to finish creating your account.'
    : 'We received a request to reset your PARQCO password. Use this code to continue.';
  return `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
  <div style="background:#1e40af;color:#fff;padding:16px 24px;font-size:20px;font-weight:bold">PARQCO Smart Parking</div>
  <div style="padding:24px;color:#111827">
    <h2 style="margin:0 0 12px">${title}</h2>
    <p>Hello ${escapeHtml(name || 'there')},</p>
    <p>${line}</p>
    <p style="font-size:32px;letter-spacing:8px;font-weight:bold;text-align:center;background:#f3f4f6;padding:16px;border-radius:6px;margin:20px 0">${escapeHtml(code)}</p>
    <p>This code expires in ${Number(minutes)} minutes. Never share it with anyone.</p>
    <p style="color:#6b7280;font-size:12px">If you did not request this, you can safely ignore this email.</p>
  </div></div>`;
}

export { sendEmail, otpEmailHtml, escapeHtml };
