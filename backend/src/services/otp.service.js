import Otp from '../models/Otp.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { generateOtp, hashOtp, safeEqual } from '../utils/otp.js';
import { sendMail } from '../utils/mailer.js';
import { otpEmailHtml, otpSubject, otpText } from '../utils/emailTemplates.js';

/** The sign-up details waiting for e-mail verification (or null). */
export const findPendingOtp = (email, purpose) => Otp.findOne({ email, purpose });

/** A code is single-use: call this once it has been accepted. */
export const consumeOtp = (record) => Otp.deleteOne({ _id: record._id });

/**
 * Creates a fresh code for (email, purpose) and e-mails it.
 *  - 429 ApiError (with .retryAfter) when a code was sent less than OTP_RESEND_SECONDS ago.
 *  - 502 ApiError when the e-mail could not be delivered; the user may retry immediately.
 * `payload` (sign-up details) is stored with the code; omit it to keep the existing one.
 */
export async function issueOtp({ email, name, purpose, payload }) {
  const { ttlMinutes, resendSeconds, devMode } = env.otp;

  const existing = await Otp.findOne({ email, purpose }).select('lastSentAt');
  if (existing) {
    const waitSeconds = Math.ceil((existing.lastSentAt.getTime() + resendSeconds * 1000 - Date.now()) / 1000);
    if (waitSeconds > 0) {
      const error = new ApiError(429, `Please wait ${waitSeconds}s before requesting another code.`);
      error.retryAfter = waitSeconds;
      throw error;
    }
  }

  const code = generateOtp();
  const now = Date.now();
  try {
    await Otp.findOneAndUpdate(
      { email, purpose },
      {
        $set: {
          otpHash: hashOtp(email, purpose, code),
          attempts: 0,
          lastSentAt: new Date(now),
          expiresAt: new Date(now + ttlMinutes * 60 * 1000),
          ...(payload ? { payload } : {}),
        },
      },
      { upsert: true }
    );
  } catch (error) {
    // Two requests created the record at the same instant (unique index).
    if (error.code === 11000) throw new ApiError(429, 'A code was just sent. Please wait a moment and try again.');
    throw error;
  }

  if (devMode) {
    console.log(`\n[DEV] ${purpose} code for ${email}: ${code}\n`);
    return;
  }

  try {
    await sendMail({
      to: email,
      toName: name,
      subject: otpSubject(purpose),
      html: otpEmailHtml({ name, code, purpose, minutes: ttlMinutes }),
      text: otpText({ code, purpose, minutes: ttlMinutes }),
    });
  } catch (error) {
    console.error('[OTP] could not send e-mail:', error.message);
    await Otp.updateOne({ email, purpose }, { $set: { lastSentAt: new Date(0) } }); // allow an immediate retry
    throw new ApiError(502, env.isProduction ? 'We could not send the verification email. Please try again in a moment.' : 'Email failed: ' + error.message);
  }
}

/**
 * Checks a code. Returns the stored record on success (the caller then calls consumeOtp).
 * Attempts are counted atomically, so many parallel guesses cannot bypass the limit.
 */
export async function verifyOtp({ email, purpose, code }) {
  const { maxAttempts } = env.otp;
  const clean = String(code ?? '').trim();
  if (!/^\d{6}$/.test(clean)) throw new ApiError(400, 'Enter the 6-digit code.');

  const record = await Otp.findOneAndUpdate({ email, purpose }, { $inc: { attempts: 1 } }, { new: true });
  if (!record) throw new ApiError(400, 'This code has expired or was never requested. Please request a new one.');

  if (record.expiresAt.getTime() <= Date.now()) {
    await consumeOtp(record);
    throw new ApiError(400, 'This code has expired. Please request a new one.');
  }
  if (record.attempts > maxAttempts) {
    await consumeOtp(record);
    throw new ApiError(429, 'Too many wrong attempts. Please request a new code.');
  }
  if (!safeEqual(record.otpHash, hashOtp(email, purpose, clean))) {
    const left = Math.max(maxAttempts - record.attempts, 0);
    throw new ApiError(400, `Incorrect code. ${left} ${left === 1 ? 'attempt' : 'attempts'} left.`);
  }
  return record;
}

