import mongoose from 'mongoose';

// One pending code per (email, purpose). For "register" it also holds the sign-up details
// until the e-mail address is verified, so no user exists before that.
const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    purpose: { type: String, enum: ['register', 'reset'], required: true },
    otpHash: { type: String, required: true },
    payload: { name: String, phone: String, passwordHash: String },
    attempts: { type: Number, default: 0 },
    lastSentAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

otpSchema.index({ email: 1, purpose: 1 }, { unique: true });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // MongoDB removes expired codes by itself

export default mongoose.models.Otp || mongoose.model('Otp', otpSchema);
