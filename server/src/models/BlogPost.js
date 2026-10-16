import mongoose from 'mongoose';
import slugPlugin from '../utils/slugPlugin.js';

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    excerpt: String,
    content: String, // Markdown
    image: String,
    imageId: String,
    tags: [String],
    category: { type: String, trim: true },
    published: { type: Boolean, default: false },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
blogPostSchema.plugin(slugPlugin);
blogPostSchema.index({ published: 1, publishedAt: -1 });
blogPostSchema.index({ title: 'text', tags: 'text', excerpt: 'text' });

export default mongoose.model('BlogPost', blogPostSchema);
