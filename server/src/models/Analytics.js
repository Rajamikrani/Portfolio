import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
  {
    event: { type: String, enum: ['page_view', 'project_view', 'resume_click'], required: true },
    ref: { type: String, maxlength: 200 },
  },
  { timestamps: true }
);

export default mongoose.model('Analytics', analyticsSchema);
