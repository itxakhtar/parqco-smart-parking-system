import rateLimit from 'express-rate-limit';

const limiter = (limit, message) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
  });

/** Registration, resend, forgot and reset: every call can send an e-mail or test a code. */
export const otpLimiter = limiter(30, 'Too many requests. Please try again in a few minutes.');

/** Slows down password guessing on the sign-in form. */
export const loginLimiter = limiter(20, 'Too many sign-in attempts. Please try again in a few minutes.');
