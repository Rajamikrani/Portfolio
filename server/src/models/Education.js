import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema(
  {
    institution: String,
    degree: { type: String, required: true, trim: true },
    field: String,
    status: String,
    country: String,
    start: String,
    end: String,
    gpa: String,
    description: String,
    coursework: [String],
    certificateUrl: String,
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Education', educationSchema);
