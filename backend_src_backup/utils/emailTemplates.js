// HTML for every e-mail PARQCO sends. Kept separate from the sending code.

export const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

const wrap = (title, body) => `
<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
  <div style="background:#16191f;color:#f2b705;padding:16px 24px;font-size:20px;font-weight:bold">PARQCO Smart Parking</div>
  <div style="padding:24px;color:#111827">
    <h2 style="margin:0 0 12px">${title}</h2>
    ${body}
  </div>
</div>`;

const OTP_COPY = {
  register: {
    subject: 'Verify your PARQCO account',
    title: 'Verify your email',
    intro: 'Welcome to PARQCO! Use this code to finish creating your account.',
  },
  reset: {
    subject: 'Your PARQCO password reset code',
    title: 'Reset your password',
    intro: 'We received a request to reset your PARQCO password. Use this code to continue.',
  },
};

export const otpSubject = (purpose) => OTP_COPY[purpose].subject;

export const otpText = ({ code, purpose, minutes }) =>
  `${OTP_COPY[purpose].intro} Your code is ${code}. It expires in ${minutes} minutes. If you did not request it, ignore this email.`;

export function otpEmailHtml({ name, code, purpose, minutes }) {
  const copy = OTP_COPY[purpose];
  return wrap(
    copy.title,
    `<p>Hello ${escapeHtml(name || 'there')},</p>
    <p>${copy.intro}</p>
    <p style="font-size:32px;letter-spacing:8px;font-weight:bold;text-align:center;background:#f3f4f6;padding:16px;border-radius:6px;margin:20px 0">${escapeHtml(code)}</p>
    <p>This code expires in ${Number(minutes)} minutes. Never share it with anyone.</p>
    <p style="color:#6b7280;font-size:12px">If you did not request this, you can safely ignore this email.</p>`
  );
}

export function slipEmailHtml(slip) {
  const row = (label, value) =>
    `<tr><td style="padding:6px 10px;color:#6b7280">${label}</td><td style="padding:6px 10px;font-weight:bold">${escapeHtml(value)}</td></tr>`;
  return wrap(
    'Booking confirmed',
    `<p>Hello ${escapeHtml(slip.driverName)}, your parking is booked. Your slip is attached as a PDF.</p>
    <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:6px">
      ${row('Challan No.', slip.challanNumber)}
      ${row('Driver', slip.driverName)}
      ${row('Vehicle No.', slip.vehicleNumber)}
      ${row('Slot', `${slip.slotId} (Floor ${slip.floor})`)}
      ${row('Start', slip.start)}
      ${row('End', slip.end)}
      ${row('Amount', slip.amount)}
    </table>`
  );
}
