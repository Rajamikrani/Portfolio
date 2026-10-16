const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Adds an auto-generated, unique `slug` (from `title`) when none is provided. */
export default function slugPlugin(schema) {
  schema.add({ slug: { type: String, unique: true, sparse: true, lowercase: true, trim: true } });
  schema.pre('validate', async function () {
    if (this.slug || !this.title) return;
    const base = slugify(this.title) || 'item';
    let candidate = base, i = 1;
    while (await this.constructor.exists({ slug: candidate })) candidate = `${base}-${++i}`;
    this.slug = candidate;
  });
}
