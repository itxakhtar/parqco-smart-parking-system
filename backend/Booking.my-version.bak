import mongoose from 'mongoose';

/**
 * Booking lifecycle
 *   pending   -> slot is held for HOLD_MINUTES, waiting for payment
 *   paid      -> payment received, waiting for admin/system verification
 *   confirmed -> verified, challan number issued, driver can enter
 *   expired   -> hold ran out before payment (slot is free again)
 *   cancelled -> cancelled by user/admin
 */
export const BOOKING_STATUS = Object.freeze({
  PENDING: 'pending',
  PAID: 'paid',
  CONFIRMED: 'confirmed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
});

/** Filter for bookings that currently block a slot. Reused by booking + assistant code. */
export const blockingFilter = (now = new Date()) => ({
  $or: [
    { status: { $in: [BOOKING_STATUS.PAID, BOOKING_STATUS.CONFIRMED] } },
    { status: BOOKING_STATUS.PENDING, holdExpiresAt: { $gt: now } },
  ],
});

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    slot: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true },
    driverName: { type: String, required: true, trim: true },
    vehicleRegNo: { type: String, required: true, trim: true, uppercase: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
      index: true,
    },
    holdExpiresAt: { type: Date },

    payment: {
      method: { type: String, enum: ['card', 'wallet', 'cash'] },
      transactionId: { type: String, trim: true },
      paidAt: { type: Date },
    },

    challanNo: { type: String, unique: true, sparse: true },
    confirmedAt: { type: Date },
  },
  { timestamps: true }
);

// Fast overlap lookups: "is this slot busy between A and B?"
bookingSchema.index({ slot: 1, startTime: 1, endTime: 1 });

export default mongoose.model('Booking', bookingSchema);
