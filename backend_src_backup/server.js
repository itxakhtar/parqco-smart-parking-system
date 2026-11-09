import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { initSocket } from './sockets/io.js';
import { seedDatabase } from './utils/seed.js';
import { isMailConfigured } from './utils/mailer.js';

async function start() {
  const usedMemoryDb = await connectDB();
  if (usedMemoryDb) await seedDatabase({ quiet: false });

  const server = http.createServer(app);
  initSocket(server);

  server.listen(env.port, () => {
    console.log(`🚗 PARQCO API running on http://localhost:${env.port}/api`);
    if (env.otp.devMode) {
      console.log('✉  OTP_DEV_MODE is on: verification codes are printed here instead of e-mailed.');
    } else if (!isMailConfigured()) {
      console.warn('⚠  E-mail is not configured, so sign-up and password-reset codes cannot be sent.');
      console.warn('   Set MAIL_FROM + SMTP_USER + SMTP_PASS (Brevo) in backend/.env, or OTP_DEV_MODE=true for local testing.');
    }
  });
}

start().catch((error) => {
  console.error('✖ PARQCO failed to start:', error);
  process.exit(1);
});
