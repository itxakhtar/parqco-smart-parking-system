import { z } from 'zod';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { consumeOtp, findPendingOtp, issueOtp, verifyOtp } from '../services/otp.service.js';

// ---- validation schemas (used by the routes) ----
const email = z.string().trim().toLowerCase().email('Please enter a valid email address');
const newPassword = z.string().min(8, 'Password must be at least 8 characters').max(72, 'Password is too long');
const otpCode = z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code');

// "+92 312-3456789" or "0312 3456789" -> "03123456789"
const phone = z
  .string({ required_error: 'Please enter your mobile number' })
  .trim()
  .transform((value) => {
    const digits = value.replace(/[\s-]/g, '');
    if (digits.startsWith('+92')) return `0${digits.slice(3)}`;
    if (digits.startsWith('92') && digits.length === 12) return `0${digits.slice(2)}`;
    return digits;
  })
  .refine((value) => /^03\d{9}$/.test(value), 'Enter a valid mobile number like 03123456789');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name').max(80),
  email,
  password: newPassword,
  phone,
});
export const verifyOtpSchema = z.object({ email, otp: otpCode });
export const resendOtpSchema = z.object({ email, purpose: z.enum(['register', 'reset']) });
export const forgotPasswordSchema = z.object({ email });
export const resetPasswordSchema = z.object({ email, otp: otpCode, newPassword });
export const loginSchema = z.object({ email, password: z.string().min(1, 'Please enter your password') });

// ---- helpers ----
const signToken = (userId) => jwt.sign({ id: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role });

const isCooldown = (error) => error instanceof ApiError && error.statusCode === 429;

// ---- registration: details -> e-mail code -> account ----
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (await User.exists({ email })) {
    throw new ApiError(409, 'An account with this email already exists. Please sign in instead.');
  }

  // The account is created only after the e-mail address is verified; until then the details wait with the code.
  const passwordHash = await User.hashPassword(password);
  await issueOtp({ email, name, purpose: 'register', payload: { name, phone, passwordHash } });

  res.json({ success: true, message: 'Verification code sent to your email.', email, resendAfter: env.otp.resendSeconds });
});

export const verifyRegistration = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const record = await verifyOtp({ email, purpose: 'register', code: otp });

  const { name, phone, passwordHash } = record.payload ?? {};
  if (!name || !passwordHash) throw new ApiError(400, 'Please start registration again.');
  if (await User.exists({ email })) {
    await consumeOtp(record);
    throw new ApiError(409, 'An account with this email already exists. Please sign in instead.');
  }

  const user = new User({ name, email, phone, password: passwordHash, role: 'user' });
  user.$locals.skipHash = true; // already hashed, the model hook must not hash it a second time
  await user.save();
  await consumeOtp(record);

  res.status(201).json({ success: true, message: 'Account created.', token: signToken(user._id), user: publicUser(user) });
});

export const resendOtp = asyncHandler(async (req, res) => {
  const { email, purpose } = req.body;

  if (purpose === 'register') {
    const pending = await findPendingOtp(email, 'register');
    if (!pending) throw new ApiError(400, 'Please start registration again.');
    await issueOtp({ email, name: pending.payload?.name, purpose });
  } else {
    // Same answer whether or not the account exists, so e-mail addresses cannot be probed.
    const user = await User.findOne({ email }).select('name');
    if (user) await issueOtp({ email, name: user.name, purpose }).catch((error) => { if (!isCooldown(error)) throw error; });
  }
  res.json({ success: true, message: 'A new code has been sent.', resendAfter: env.otp.resendSeconds });
});

// ---- forgot password: e-mail -> code -> new password ----
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).select('name');
  if (user) await issueOtp({ email, name: user.name, purpose: 'reset' }).catch((error) => { if (!isCooldown(error)) throw error; });

  res.json({ success: true, message: 'If that email is registered, a reset code has been sent.', resendAfter: env.otp.resendSeconds });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const record = await verifyOtp({ email, purpose: 'reset', code: otp });

  const user = await User.findOne({ email });
  if (!user) {
    await consumeOtp(record);
    throw new ApiError(400, 'This code has expired or was never requested. Please request a new one.');
  }

  user.password = newPassword; // the model's pre-save hook hashes it
  await user.save();
  await consumeOtp(record);

  res.json({ success: true, message: 'Password updated. You can now sign in.' });
});

// ---- sign in ----
export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  const passwordMatches = user && (await user.comparePassword(req.body.password));
  if (!passwordMatches) throw new ApiError(401, 'Email or password is incorrect.');

  res.json({ success: true, token: signToken(user._id), user: publicUser(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
});