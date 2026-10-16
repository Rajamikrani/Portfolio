import { Router } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import * as M from './models/index.js';

const r = Router();
const prod = process.env.NODE_ENV === 'production';
const err = (status, message) => Object.assign(new Error(message), { status });
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const cookieOpts = { httpOnly: true, secure: prod, sameSite: prod ? 'none' : 'lax', maxAge: 7 * 864e5 };
const clean = ({ _id, __v, createdAt, updatedAt, ...rest }) => rest;

// attach admin from cookie (if any), then guard
r.use((req, res, next) => { try { if (req.cookies?.token) req.admin = jwt.verify(req.cookies.token, process.env.JWT_SECRET); } catch { /* invalid token = visitor */ } next(); });
const admin = (req, res, next) => (req.admin?.role === 'admin' ? next() : next(err(req.admin ? 403 : 401, req.admin ? 'Forbidden' : 'Unauthorized')));

// ---- auth
r.post('/auth/login', rateLimit({ windowMs: 15 * 60e3, limit: 20 }), wrap(async (req, res) => {
  const { email, password } = req.body;
  const u = await M.User.findOne({ email: String(email || '').toLowerCase() }).select('+password');
  if (!u || !(await bcrypt.compare(String(password || ''), u.password))) throw err(401, 'Invalid email or password');
  const token = jwt.sign({ id: u.id, role: u.role, email: u.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, cookieOpts).json({ email: u.email, role: u.role });
}));
r.post('/auth/logout', (req, res) => res.clearCookie('token', cookieOpts).json({ ok: true }));
r.get('/auth/me', admin, (req, res) => res.json({ email: req.admin.email, role: req.admin.role }));

// ---- singletons
const single = (path, Model) => {
  r.get(path, wrap(async (req, res) => res.json((await Model.findOne()) || new Model())));
  r.put(path, admin, wrap(async (req, res) => { const d = (await Model.findOne()) || new Model(); d.set(clean(req.body)); await d.save(); res.json(d); }));
};
single('/profile', M.Profile);
single('/settings', M.SiteSettings);

// ---- generic CRUD
const crud = (path, Model, { pub = {}, sort = { order: 1, createdAt: -1 } } = {}) => {
  r.get(path, wrap(async (req, res) => {
    const f = req.admin ? {} : { ...pub };
    if (req.query.category) f.category = String(req.query.category);
    if (req.query.q) { const rx = new RegExp(String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); f.$or = [{ title: rx }, { tags: rx }, { excerpt: rx }]; }
    res.json(await Model.find(f).sort(sort).limit(Math.min(+req.query.limit || 200, 200)));
  }));
  r.put(`${path}/reorder`, admin, wrap(async (req, res) => { await Promise.all((req.body.ids || []).map((id, i) => Model.updateOne({ _id: id }, { order: i }))); res.json({ ok: true }); }));
  r.get(`${path}/:id`, wrap(async (req, res) => {
    const { id } = req.params;
    const d = await Model.findOne(mongoose.isValidObjectId(id) ? { _id: id } : { slug: id });
    if (!d || (!req.admin && Object.entries(pub).some(([k, v]) => d[k] !== v))) throw err(404, 'Not found');
    res.json(d);
  }));
  r.post(path, admin, wrap(async (req, res) => res.status(201).json(await Model.create(clean(req.body)))));
  r.put(`${path}/:id`, admin, wrap(async (req, res) => { const d = await Model.findById(req.params.id); if (!d) throw err(404, 'Not found'); d.set(clean(req.body)); await d.save(); res.json(d); }));
  r.delete(`${path}/:id`, admin, wrap(async (req, res) => { await Model.findByIdAndDelete(req.params.id); res.json({ ok: true }); }));
};
crud('/skills', M.Skill);
crud('/projects', M.Project, { pub: { published: true } });
crud('/experience', M.Experience);
crud('/education', M.Education);
crud('/certifications', M.Certification);
crud('/achievements', M.Achievement);
crud('/blog', M.BlogPost, { pub: { published: true }, sort: { publishedAt: -1 } });
crud('/social', M.SocialLink);

// ---- contact
r.post('/contact', rateLimit({ windowMs: 60 * 60e3, limit: 5, message: { message: 'Too many messages, try later.' } }), wrap(async (req, res) => {
  const { name, email, subject, message } = req.body;
  const ok = [name, subject, message].every((v) => typeof v === 'string' && v.trim()) && /^\S+@\S+\.\S+$/.test(email || '') && message.length <= 5000;
  if (!ok) throw err(400, 'Please complete all fields with a valid email.');
  await M.ContactMessage.create({ name: name.trim(), email, subject: subject.trim(), message: message.trim() });
  res.status(201).json({ ok: true });
}));
r.get('/contact', admin, wrap(async (req, res) => res.json(await M.ContactMessage.find().sort({ createdAt: -1 }))));
r.patch('/contact/:id/read', admin, wrap(async (req, res) => res.json(await M.ContactMessage.findByIdAndUpdate(req.params.id, { read: req.body.read !== false }, { new: true }))));
r.delete('/contact/:id', admin, wrap(async (req, res) => { await M.ContactMessage.findByIdAndDelete(req.params.id); res.json({ ok: true }); }));

// ---- upload (Cloudinary)
const up = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5e6 }, fileFilter: (q, f, cb) => cb(/^image\/|application\/pdf/.test(f.mimetype) ? null : err(400, 'Images or PDF only'), true) });
r.post('/upload', admin, up.single('file'), wrap(async (req, res) => {
  if (!req.file) throw err(400, 'No file');
  const { CLOUDINARY_CLOUD_NAME: cloud_name, CLOUDINARY_API_KEY: api_key, CLOUDINARY_API_SECRET: api_secret } = process.env;
  if (!cloud_name || !api_key || !api_secret) throw err(503, 'Cloudinary is not configured on the server');
  cloudinary.config({ cloud_name, api_key, api_secret });
  const out = await new Promise((ok, no) => cloudinary.uploader.upload_stream({ folder: 'portfolio', resource_type: 'auto' }, (e, x) => (e ? no(e) : ok(x))).end(req.file.buffer));
  res.json({ url: out.secure_url, publicId: out.public_id });
}));

// ---- public aggregate, stats, analytics
r.get('/site', wrap(async (req, res) => {
  const s = (a) => a.sort({ order: 1, createdAt: -1 });
  const [profile, settings, skills, projects, experience, education, certifications, achievements, socials, posts] = await Promise.all([
    M.Profile.findOne(), M.SiteSettings.findOne(), s(M.Skill.find()), s(M.Project.find({ published: true })), s(M.Experience.find()), s(M.Education.find()),
    s(M.Certification.find()), s(M.Achievement.find()), s(M.SocialLink.find()), M.BlogPost.find({ published: true }).sort({ publishedAt: -1 }).limit(3).select('-content'),
  ]);
  res.json({ profile: profile || new M.Profile(), settings: settings || new M.SiteSettings(), skills, projects, experience, education, certifications, achievements, socials, posts });
}));
r.get('/stats', admin, wrap(async (req, res) => {
  const c = (m, f = {}) => m.countDocuments(f);
  const [projects, skills, posts, certifications, messages, unread, experiences] = await Promise.all([c(M.Project), c(M.Skill), c(M.BlogPost), c(M.Certification), c(M.ContactMessage), c(M.ContactMessage, { read: false }), c(M.Experience)]);
  const events = await M.Analytics.aggregate([{ $group: { _id: '$event', n: { $sum: 1 } } }]);
  res.json({ projects, skills, posts, certifications, messages, unread, experiences, analytics: Object.fromEntries(events.map((e) => [e._id, e.n])) });
}));
r.post('/analytics', wrap(async (req, res) => {
  const s = await M.SiteSettings.findOne();
  if (!s?.analyticsEnabled) return res.json({ ok: false });
  if (!['page_view', 'project_view', 'resume_click'].includes(req.body.event)) throw err(400, 'Bad event');
  await M.Analytics.create({ event: req.body.event, ref: String(req.body.ref || '').slice(0, 200) });
  res.json({ ok: true });
}));
export default r;
