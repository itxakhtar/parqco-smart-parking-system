import mongoose from 'mongoose';

// Cached hourly forecast so the dashboard can show history of what the model predicted.
const predictionSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // "2026-10-24"
    hour: { type: Number, required: true, min: 0, max: 23 },
    predictedOccupancy: { type: Number, required: true }, // percent 0-100
    confidence: { type: Number, required: true }, // percent 0-100
    modelVersion: { type: String, default: 'seasonal-trend-v1' },
  },
  { timestamps: true }
);

predictionSchema.index({ date: 1, hour: 1 }, { unique: true });

export default mongoose.model('Prediction', predictionSchema);
