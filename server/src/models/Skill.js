import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true }, // e.g. "Generative AI"
    level: { type: Number, min: 0, max: 100, default: 0 },  // proficiency %
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);
skillSchema.index({ category: 1, order: 1 });

export default mongoose.model('Skill', skillSchema);
