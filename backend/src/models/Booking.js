import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    slot: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true },
    slotId: { type: String, required: true }, // copied from the slot for fast lookups
    vehiclePlate: { type: String, trim: true, uppercase: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ['confirmed', 'completed', 'cancelled'], default: 'confirmed' },
    amount: { type: Number, required: true, min: 0 },
    challanNumber: { type: String, unique: true, sparse: true, trim: true },
  },
  { timestamps: true }
);

// Speeds up the "is this slot free between X and Y?" query
bookingSchema.index({ slotId: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ vehiclePlate: 1, startTime: 1, endTime: 1 });

export default mongoose.model('Booking', bookingSchema);
