import mongoose from 'mongoose';
import slugPlugin from '../utils/slugPlugin.js';

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    summary: String,
    image: String,
    imageId: String,
    tech: [String],
    features: [String],
    problem: String,
    solution: String,
    architecture: String,
    challenges: String,
    results: String,
    screenshots: [String],
    github: String,
    demo: String,
    future: String,
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);
projectSchema.plugin(slugPlugin);
projectSchema.index({ published: 1, order: 1 });

export default mongoose.model('Project', projectSchema);
