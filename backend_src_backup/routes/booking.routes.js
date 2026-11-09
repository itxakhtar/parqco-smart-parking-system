import { Router } from 'express';
import Booking from '../models/Booking.js';
import { createBooking, markPaid, confirmBooking } from '../services/booking.service.js';
// Adjust these two names to match your existing auth middleware file.
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

const handle = (fn) => async (req, res) => {
  try {
    res.json(await fn(req));
  } catch (err) {
    if (!err.status) console.error('[booking]', err);
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
};

// Driver: create booking -> status "pending"
router.post('/', requireAuth, handle((req) => createBooking(req.user.id, req.body)));

// Driver: my bookings (with payment status)
router.get(
  '/mine',
  requireAuth,
  handle((req) => Booking.find({ user: req.user.id }).sort('-createdAt').populate('slot', 'label')),
);

// Driver: pay -> "paid" (in production: gateway webhook calls markPaid)
router.post(
  '/:id/pay',
  requireAuth,
  handle((req) => markPaid(req.params.id, req.user.id, req.body)),
);

// Admin: verify payment -> "confirmed" + challan number
router.patch('/:id/confirm', requireAuth, requireAdmin, handle((req) => confirmBooking(req.params.id)));

// Admin: all bookings, optional ?status=paid
router.get(
  '/',
  requireAuth,
  requireAdmin,
  handle((req) => {
    const filter = req.query.status ? { status: req.query.status } : {};
    return Booking.find(filter).sort('-createdAt').populate('slot', 'label').populate('user', 'name email');
  }),
);

export default router;
