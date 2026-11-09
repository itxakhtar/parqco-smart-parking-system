import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 10;

/** "+92 312-3456789" or "0312 3456789" -> "03123456789" */
const normalizePhone = (value) => {
  if (typeof value !== 'string') return value;
  const digits = value.replace(/[\s-]/g, '');
  return digits.startsWith('+92') ? `0${digits.slice(3)}` : digits;
};

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // select:false keeps the hash out of every query unless explicitly requested
    password: { type: String, required: true, minlength: 6, select: false },
    // Saved at registration and printed on the parking slip
    phone: {
      type: String,
      trim: true,
      set: normalizePhone,
      match: [/^03\d{9}$/, 'Enter a valid mobile number like 03123456789'],
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

// Hash the password automatically whenever it changes.
// Set `user.$locals.skipHash = true` when the value is already a hash (e-mail verified sign-up).
userSchema.pre('save', async function () {
  if (this.$locals.skipHash || !this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, BCRYPT_ROUNDS);
});

userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

userSchema.statics.hashPassword = (plainPassword) => bcrypt.hash(plainPassword, BCRYPT_ROUNDS);

export default mongoose.models.User || mongoose.model('User', userSchema);