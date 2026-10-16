import mongoose from 'mongoose';

const certificationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    issuer: String,
    date: String,
    credentialId: String,
    url: String,
    image: String,
    imageId: String,
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Certification', certificationSchema);
