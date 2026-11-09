import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Payment, { PAYMENT_STATUS } from '../models/Payment.js';

const METHODS = ['card', 'wallet', 'cash'];

export class PaymentError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

async function loadBooking(bookingId, user) {
  if (!mongoose.isValidObjectId(bookingId)) throw new PaymentError('Invalid booking id');
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new PaymentError('Booking not found', 404);
  const isOwner = String(booking.user) === String(user._id);
  if (!isOwner && user.role !== 'admin') throw new PaymentError('This is not your booking', 403);
  return booking;
}

/** A booking with no payment record yet is "pending". */
export async function getPayment(bookingId, user) {
  const booking = await loadBooking(bookingId, user);
  const payment = await Payment.findOne({ booking: booking._id }).lean();
  return payment ?? { booking: booking._id, status: PAYMENT_STATUS.PENDING, amount: booking.amount ?? 0 };
}

/**
 * pending -> paid. In production the payment gateway webhook should call this
 * after verifying its signature. The update is atomic, so paying twice fails.
 */
export async function pay(bookingId, user, { method, transactionId } = {}) {
  const booking = await loadBooking(bookingId, user);
  if (!METHODS.includes(method)) throw new PaymentError(`Payment method must be one of: ${METHODS.join(', ')}`);
  if (['cancelled', 'completed'].includes(booking.status)) {
    throw new PaymentError(`A ${booking.status} booking cannot be paid`, 409);
  }

  try {
    return await Payment.findOneAndUpdate(
      { booking: booking._id, status: PAYMENT_STATUS.PENDING },
      {
        $set: {
          user: booking.user,
          amount: booking.amount ?? 0,
          status: PAYMENT_STATUS.PAID,
          method,
          transactionId: transactionId || `TXN-${Date.now().toString(36).toUpperCase()}`,
          paidAt: new Date(),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  } catch (err) {
    if (err.code === 11000) throw new PaymentError('This booking is already paid', 409);
    throw err;
  }
}

/** paid -> confirmed (admin only). */
export async function confirm(bookingId, admin) {
  if (!mongoose.isValidObjectId(bookingId)) throw new PaymentError('Invalid booking id');
  const payment = await Payment.findOneAndUpdate(
    { booking: bookingId, status: PAYMENT_STATUS.PAID },
    { $set: { status: PAYMENT_STATUS.CONFIRMED, confirmedAt: new Date(), confirmedBy: admin._id } },
    { new: true }
  );
  if (!payment) throw new PaymentError('Only paid bookings can be confirmed', 409);
  return payment;
}

export async function listPayments(status) {
  const filter = Object.values(PAYMENT_STATUS).includes(status) ? { status } : {};
  return Payment.find(filter)
    .sort('-createdAt')
    .limit(200)
    .populate('booking', 'slotId vehiclePlate driverName startTime endTime challanNumber')
    .lean();
}