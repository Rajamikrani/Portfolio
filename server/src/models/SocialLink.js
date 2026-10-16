import mongoose from 'mongoose';

const socialLinkSchema = new mongoose.Schema(
  {
    platform: { type: String, required: true, trim: true }, // GitHub, LinkedIn, Kaggle, Email...
    url: { type: String, default: '' }, // URL or email address; empty = hidden on the site
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('SocialLink', socialLinkSchema);
