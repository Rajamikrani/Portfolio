import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    title: { type: String, trim: true },
    roles: [String],
    heroHeadline: String,
    heroDescription: String,
    heroPath: [String],
    location: String,
    status: String,
    objective: String,
    bio: String,
    image: String,    // Cloudinary URL
    imageId: String,  // Cloudinary public ID
    resumeUrl: String,
    contactEmail: { type: String, trim: true },
    phone: String,
  },
  { timestamps: true }
);

export default mongoose.model('Profile', profileSchema);
