import mongoose from 'mongoose';

/** Payment lifecycle: pending -> paid (driver pays) -> confirmed (admin verifies). */
export const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  PAID: 'paid',
  CONFIRMED: 'confirmed',
});

const paymentSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.PENDING, index: true },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ['card', 'wallet', 'cash'] },
    transactionId: { type: String, trim: true },
    paidAt: { type: Date },
    confirmedAt: { type: Date },
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);