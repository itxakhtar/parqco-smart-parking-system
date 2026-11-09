import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema(
  {
    slotId: { type: String, required: true, unique: true, trim: true }, // e.g. "A-101"
    zone: { type: String, required: true, trim: true }, // e.g. "Zone A"
    floor: { type: Number, required: true, min: 0 },
    // Physical state, written by the IoT sensor. "reserved" is computed from bookings, not stored.
    status: { type: String, enum: ['available', 'occupied', 'maintenance'], default: 'available' },
    sensorId: { type: String, required: true, unique: true, trim: true }, // e.g. "SENSOR_A101"
    hourlyRate: { type: Number, default: 100, min: 0 }, // PKR per hour
  },
  { timestamps: true }
);

export default mongoose.model('Slot', slotSchema);
