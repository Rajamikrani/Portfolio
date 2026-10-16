import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: String, // Kaggle, Hackathon, Scholarship, Research...
    description: String,
    date: String,
    url: String,
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Achievement', achievementSchema);
