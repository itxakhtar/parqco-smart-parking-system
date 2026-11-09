import mongoose from 'mongoose';

// One document per named counter, e.g. "challan-20261025". Incremented atomically.
const counterSchema = new mongoose.Schema({
  _id: { type: String },
  seq: { type: Number, default: 0 },
});

export default mongoose.models.Counter || mongoose.model('Counter', counterSchema);
