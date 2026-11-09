import crypto from 'node:crypto';
import Booking, { BOOKING_STATUS, blockingFilter } from '../models/Booking.js';
import Slot from '../models/Slot.js';

const HOLD_MINUTES = Number(process.env.BOOKING_HOLD_MINUTES || 10);
const RATE_PER_HOUR = Number(process.env.PARKING_RATE_PER_HOUR || 100);

export class BookingError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

const generateChallanNo = () => {
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `CH-${day}-${rand}`;
};

/** 1. Driver books a slot -> status "pending", slot is held for a few minutes. */
export async function createBooking(userId, { slotId, driverName, vehicleRegNo, startTime, endTime }) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    throw new BookingError('Invalid start or end time');
  }
  if (start < new Date(Date.now() - 60_000)) {
    throw new BookingError('Start time is in the past');
  }

  const slot = await Slot.findById(slotId);
  if (!slot || slot.isActive === false) throw new BookingError('Slot not available', 404);

  const clash = await Booking.exists({
    slot: slotId,
    startTime: { $lt: end },
    endTime: { $gt: start },
    ...blockingFilter(),
  });
  if (clash) throw new BookingError('Slot is already booked for this time', 409);

  const hours = Math.ceil((end - start) / 3_600_000);
  return Booking.create({
    user: userId,
    slot: slotId,
    driverName,
    vehicleRegNo,
    startTime: start,
    endTime: end,
    amount: hours * RATE_PER_HOUR,
    holdExpiresAt: new Date(Date.now() + HOLD_MINUTES * 60_000),
  });
}

/**
 * 2. Payment received -> "paid".
 * In production this is called from the payment gateway webhook (after verifying
 * its signature), not from the browser. Atomic update = no double payment.
 */
export async function markPaid(bookingId, userId, { method, transactionId }) {
  const booking = await Booking.findOneAndUpdate(
    {
      _id: bookingId,
      user: userId,
      status: BOOKING_STATUS.PENDING,
      holdExpiresAt: { $gt: new Date() },
    },
    {
      $set: {
        status: BOOKING_STATUS.PAID,
        'payment.method': method,
        'payment.transactionId': transactionId,
        'payment.paidAt': new Date(),
      },
    },
    { new: true }
  );
  if (!booking) throw new BookingError('Booking is not pending or the hold has expired', 409);
  return booking;
}

/** 3. Admin verifies payment -> "confirmed" and a challan number is issued. */
export async function confirmBooking(bookingId) {
  const booking = await Booking.findOneAndUpdate(
    { _id: bookingId, status: BOOKING_STATUS.PAID },
    {
      $set: {
        status: BOOKING_STATUS.CONFIRMED,
        confirmedAt: new Date(),
        challanNo: generateChallanNo(),
      },
    },
    { new: true }
  );
  if (!booking) throw new BookingError('Only paid bookings can be confirmed', 409);
  return booking;
}

/** Unpaid holds that ran out free their slot again. */
export async function expireStaleHolds() {
  const { modifiedCount } = await Booking.updateMany(
    { status: BOOKING_STATUS.PENDING, holdExpiresAt: { $lte: new Date() } },
    { $set: { status: BOOKING_STATUS.EXPIRED } }
  );
  return modifiedCount;
}

/** Call once after the DB connects (server.js). */
export function startExpiryJob(intervalMs = 60_000) {
  const timer = setInterval(() => {
    expireStaleHolds().catch((err) => console.error('[expiry-job]', err.message));
  }, intervalMs);
  timer.unref();
}
