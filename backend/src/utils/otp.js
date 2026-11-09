import crypto from 'crypto';
import { env } from '../config/env.js';

export const OTP_LENGTH = 6;

/** Cryptographically secure 6-digit code, e.g. "042917". */
export const generateOtp = () => crypto.randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, '0');

/** Codes are stored only as a keyed hash, so a database leak does not reveal them. */
export const hashOtp = (email, purpose, otp) =>
  crypto.createHmac('sha256', env.otp.secret).update(`${email}:${purpose}:${otp}`).digest('hex');

export const safeEqual = (a, b) => {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};
