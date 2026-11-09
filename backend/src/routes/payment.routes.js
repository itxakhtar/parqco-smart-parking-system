import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import { getPayment, pay, confirm, listPayments } from '../services/payment.service.js';

const router = Router();

const handle = (fn) => async (req, res) => {
  try {
    res.json({ success: true, payment: await fn(req) });
  } catch (err) {
    if (!err.status) console.error('[payment]', err);
    res.status(err.status || 500).json({ success: false, message: err.status ? err.message : 'Server error' });
  }
};

// Admin: all payments, optional ?status=paid
router.get('/', protect, restrictTo('admin'), handle((req) => listPayments(req.query.status)));

// Driver/admin: payment status of one booking
router.get('/:bookingId', protect, handle((req) => getPayment(req.params.bookingId, req.user)));

// Driver: pay -> "paid"
router.post('/:bookingId/pay', protect, handle((req) => pay(req.params.bookingId, req.user, req.body || {})));

// Admin: verify -> "confirmed"
router.patch('/:bookingId/confirm', protect, restrictTo('admin'), handle((req) => confirm(req.params.bookingId, req.user)));

export default router;