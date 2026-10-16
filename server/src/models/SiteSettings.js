import mongoose from 'mongoose';

export const SECTION_KEYS = ['hero', 'about', 'skills', 'projects', 'experience', 'education', 'certifications', 'achievements', 'blog', 'contact'];

const siteSettingsSchema = new mongoose.Schema(
  {
    siteTitle: { type: String, default: 'Raja Mikrani | AI / ML Engineer' },
    siteDescription: { type: String, default: 'Portfolio of Raja Mikrani, AI / Machine Learning Engineer from Nepal.' },
    noExperienceText: { type: String, default: 'Currently seeking opportunities to apply my AI/ML skills in real-world projects.' },
    analyticsEnabled: { type: Boolean, default: false },
    // Array order = display order; `visible` toggles the section.
    sections: {
      type: [{ _id: false, key: { type: String, enum: SECTION_KEYS }, visible: { type: Boolean, default: true } }],
      default: () => SECTION_KEYS.map((key) => ({ key, visible: true })),
    },
  },
  { timestamps: true }
);

export default mongoose.model('SiteSettings', siteSettingsSchema);
