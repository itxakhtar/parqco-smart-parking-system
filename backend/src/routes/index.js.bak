import { Router } from 'express';
import { protect, restrictTo, deviceAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginLimiter, otpLimiter } from '../middleware/rateLimit.js';
import * as auth from '../controllers/authController.js';
import * as slots from '../controllers/slotController.js';
import * as bookings from '../controllers/bookingController.js';
import * as sensors from '../controllers/sensorController.js';
import * as predictions from '../controllers/predictionController.js';
import * as admin from '../controllers/adminController.js';

const router = Router();
const adminOnly = [protect, restrictTo('admin')];

router.get('/health', (_req, res) => res.json({ success: true, service: 'PARQCO API', time: new Date() }));

// Authentication (registration and password reset are confirmed with an e-mailed code)
router.post('/auth/register', otpLimiter, validate(auth.registerSchema), auth.register);
router.post('/auth/verify-otp', otpLimiter, validate(auth.verifyOtpSchema), auth.verifyRegistration);
router.post('/auth/resend-otp', otpLimiter, validate(auth.resendOtpSchema), auth.resendOtp);
router.post('/auth/forgot-password', otpLimiter, validate(auth.forgotPasswordSchema), auth.forgotPassword);
router.post('/auth/reset-password', otpLimiter, validate(auth.resetPasswordSchema), auth.resetPassword);
router.post('/auth/login', loginLimiter, validate(auth.loginSchema), auth.login);
router.get('/auth/me', protect, auth.me);

// Parking slots
router.get('/slots/summary', slots.getSummary); // public (landing page)
router.get('/slots/availability', protect, slots.checkAvailability);
router.get('/slots', protect, slots.listSlots);
router.post('/slots', ...adminOnly, validate(slots.slotSchema), slots.createSlot);
router.put('/slots/:id', ...adminOnly, validate(slots.slotSchema.partial()), slots.updateSlot);
router.delete('/slots/:id', ...adminOnly, slots.deleteSlot);

// Bookings (a booking returns a challan; its PDF slip is at /bookings/:id/slip)
router.post('/bookings', protect, validate(bookings.bookingSchema), bookings.createBooking);
router.get('/bookings/my', protect, bookings.myBookings);
router.get('/bookings', ...adminOnly, bookings.allBookings);
router.get('/bookings/:id/slip', protect, bookings.getSlip);
router.delete('/bookings/:id', protect, bookings.cancelBooking);

// IoT sensors
router.post('/sensor-data', deviceAuth, validate(sensors.sensorReadingSchema), sensors.ingestReading);
router.get('/sensors', ...adminOnly, sensors.sensorOverview);

// ML predictions
router.get('/predictions/today', protect, predictions.todayForecast);
router.get('/predictions/weekly', protect, predictions.weeklyPeaks);

// Admin
router.get('/admin/stats', ...adminOnly, admin.getStats);
router.get('/admin/users', ...adminOnly, admin.listUsers);

export default router;
