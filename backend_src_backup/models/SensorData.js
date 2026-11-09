import mongoose from 'mongoose';

// One document per sensor reading. This collection is the training data for the ML forecast.
const sensorDataSchema = new mongoose.Schema({
  sensorId: { type: String, required: true },
  slotId: { type: String, required: true },
  occupied: { type: Number, enum: [0, 1], required: true }, // 0 = empty, 1 = occupied
  battery: { type: Number, min: 0, max: 100 },
  timestamp: { type: Date, default: Date.now },
});

sensorDataSchema.index({ slotId: 1, timestamp: -1 });
sensorDataSchema.index({ timestamp: -1 });

export default mongoose.model('SensorData', sensorDataSchema);
