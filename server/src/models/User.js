import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^\S+@\S+\.\S+$/ },
    password: { type: String, required: true, select: false }, // bcrypt hash only
    role: { type: String, enum: ['admin', 'editor'], default: 'admin' },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
