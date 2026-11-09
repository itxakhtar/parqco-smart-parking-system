// Central place for configuration. Every other file imports from here,
// so there is exactly one place that reads process.env.
import dotenv from 'dotenv';
dotenv.config();

const text = (name, fallback = '') => (process.env[name] ?? '').trim() || fallback;
const flag = (name) => text(name).toLowerCase() === 'true';
const number = (name, fallback) => {
  const value = Number(text(name));
  return text(name) !== '' && Number.isFinite(value) ? value : fallback;
};

const isProduction = text('NODE_ENV') === 'production';

if (isProduction && !text('JWT_SECRET')) {
  throw new Error('JWT_SECRET must be set when NODE_ENV=production');
}

export const env = {
  isProduction,
  port: number('PORT', 5000),
  clientUrl: text('CLIENT_URL', 'http://localhost:5173'),
  mongoUri: text('MONGODB_URI', 'mongodb://127.0.0.1:27017/parqco'),
  useMemoryDb: flag('USE_MEMORY_DB'),
  jwtSecret: text('JWT_SECRET', 'dev-secret-change-me'),
  jwtExpiresIn: text('JWT_EXPIRES_IN', '7d'),
  deviceApiKey: text('DEVICE_API_KEY', 'parqco-esp32-secret'),
  timezone: text('TIMEZONE', 'Asia/Karachi'),
  currency: text('SLIP_CURRENCY', 'PKR'),

  // One-time passwords for registration and password reset
  otp: {
    ttlMinutes: number('OTP_TTL_MINUTES', 10),
    maxAttempts: number('OTP_MAX_ATTEMPTS', 5),
    resendSeconds: number('OTP_RESEND_SECONDS', 60),
    // Prints the code in the backend terminal instead of e-mailing it. Never active in production.
    devMode: flag('OTP_DEV_MODE') && !isProduction,
    secret: text('OTP_SECRET') || text('JWT_SECRET', 'dev-secret-change-me'),
  },

  // Outgoing e-mail through Brevo.
  //  - Easiest: Brevo SMTP relay (SMTP_USER + SMTP_PASS from Brevo -> SMTP & API -> SMTP).
  //  - Or: Brevo REST API (BREVO_API_KEY). When both are set, the API key wins.
  mail: {
    brevoApiKey: text('BREVO_API_KEY'),
    smtpHost: text('SMTP_HOST', 'smtp-relay.brevo.com'),
    smtpPort: number('SMTP_PORT', 587),
    smtpUser: text('SMTP_USER'),
    smtpPass: text('SMTP_PASS'),
    // Must be a sender you have verified inside Brevo, otherwise Brevo rejects the message.
    fromEmail: text('MAIL_FROM'),
    fromName: text('MAIL_FROM_NAME', 'PARQCO Smart Parking'),
  },
};

// Make Date logic ("today", "this hour") follow the parking lot's timezone, not the laptop's.
process.env.TZ = env.timezone;
