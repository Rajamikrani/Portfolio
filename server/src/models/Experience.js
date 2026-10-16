import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema(
  {
    organization: { type: String, required: true, trim: true },
    position: String,
    type: String, // Internship, Freelance, Research, Volunteer...
    location: String,
    start: String,
    end: String,
    description: String,
    tech: [String],
    achievements: [String],
    certificateUrl: String,
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Experience', experienceSchema);
