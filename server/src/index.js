import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import routes from './routes.js';
import { Project, BlogPost } from './models/index.js';

for (const k of ['MONGO_URI', 'JWT_SECRET', 'CLIENT_URL']) if (!process.env[k]) { console.error(`Missing env var ${k}`); process.exit(1); }
const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL.split(','), credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.get('/health', (q, s) => s.json({ ok: true }));
app.use('/api', routes);
app.get('/sitemap.xml', async (req, res, next) => {
  try {
    const base = process.env.CLIENT_URL.split(',')[0];
    const [p, b] = await Promise.all([Project.find({ published: true }).select('slug'), BlogPost.find({ published: true }).select('slug')]);
    const urls = ['', '/blog', ...p.map((x) => `/projects/${x.slug}`), ...b.map((x) => `/blog/${x.slug}`)];
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${base}${u}</loc></url>`).join('')}</urlset>`);
  } catch (e) { next(e); }
});
app.use('/api', (req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((e, req, res, next) => { // eslint-disable-line
  const status = e.name === 'ValidationError' ? 400 : e.status || 500;
  if (status >= 500) console.error(e);
  res.status(status).json({ message: status >= 500 ? 'Server error' : e.message });
});
await mongoose.connect(process.env.MONGO_URI);
app.listen(process.env.PORT || 5000, () => console.log('API running'));
