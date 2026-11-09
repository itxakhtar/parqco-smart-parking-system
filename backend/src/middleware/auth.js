import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** Requires a valid "Authorization: Bearer <token>" header and attaches req.user. */
export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new ApiError(401, 'Please sign in to continue.');

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new ApiError(401, 'Your session has expired. Please sign in again.');
  }

  const user = await User.findById(payload.id);
  if (!user) throw new ApiError(401, 'This account no longer exists.');

  req.user = user;
  next();
});

/** Restricts a route to certain roles, e.g. restrictTo('admin'). Use after protect. */
export const restrictTo =
  (...roles) =>
  (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to do this.'));
    }
    next();
  };

/** Guards the IoT endpoint: the ESP32 must send the shared secret in "x-device-key". */
export const deviceAuth = (req, _res, next) => {
  if (req.headers['x-device-key'] !== env.deviceApiKey) {
    return next(new ApiError(401, 'Invalid device key.'));
  }
  next();
};
