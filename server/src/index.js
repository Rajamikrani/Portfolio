// import 'dotenv/config';
// import express from 'express';
// import mongoose from 'mongoose';
// import helmet from 'helmet';
// import cors from 'cors';
// import cookieParser from 'cookie-parser';
// import mongoSanitize from 'express-mongo-sanitize';
// import routes from './routes.js';
// import { Project, BlogPost } from './models/index.js';

// for (const k of ['MONGO_URI', 'JWT_SECRET', 'CLIENT_URL']) if (!process.env[k]) { console.error(`Missing env var ${k}`); process.exit(1); }
// const app = express();
// app.set('trust proxy', 1);
// app.use(helmet());
// app.use(cors({ origin: process.env.CLIENT_URL.split(','), credentials: true }));
// app.use(express.json({ limit: '1mb' }));
// app.use(cookieParser());
// app.use(mongoSanitize());
// app.get('/health', (q, s) => s.json({ ok: true }));
// app.use('/api', routes);
// app.get('/sitemap.xml', async (req, res, next) => {
//   try {
//     const base = process.env.CLIENT_URL.split(',')[0];
//     const [p, b] = await Promise.all([Project.find({ published: true }).select('slug'), BlogPost.find({ published: true }).select('slug')]);
//     const urls = ['', '/blog', ...p.map((x) => `/projects/${x.slug}`), ...b.map((x) => `/blog/${x.slug}`)];
//     res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${base}${u}</loc></url>`).join('')}</urlset>`);
//   } catch (e) { next(e); }
// });
// app.use('/api', (req, res) => res.status(404).json({ message: 'Route not found' }));
// app.use((e, req, res, next) => { // eslint-disable-line
//   const status = e.name === 'ValidationError' ? 400 : e.status || 500;
//   if (status >= 500) console.error(e);
//   res.status(status).json({ message: status >= 500 ? 'Server error' : e.message });
// });
// await mongoose.connect(process.env.MONGO_URI);
// app.listen(process.env.PORT || 5000, () => console.log('API running'));




import 'dotenv/config';

import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';

import routes from './routes.js';
import { Project, BlogPost } from './models/index.js';

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'CLIENT_URL'];

for (const key of requiredEnvVars) {
  if (!process.env[key]?.trim()) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

// Configure allowed frontend origins
const allowedOrigins = process.env.CLIENT_URL
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

if (allowedOrigins.length === 0) {
  console.error('CLIENT_URL must contain at least one valid origin');
  process.exit(1);
}

const app = express();

app.set('trust proxy', 1);

app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an Origin header, such as health checks.
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/+$/, '');

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(mongoSanitize());

// Health check: confirms the API process is responding.
app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    service: 'portfolio-api',
    database: mongoose.connection.readyState === 1
      ? 'connected'
      : 'disconnected',
  });
});

// Existing API routes
app.use('/api', routes);

// Sitemap for published projects and blog posts
app.get('/sitemap.xml', async (req, res, next) => {
  try {
    const baseUrl = allowedOrigins[0];

    const [projects, blogPosts] = await Promise.all([
      Project.find({ published: true }).select('slug'),
      BlogPost.find({ published: true }).select('slug'),
    ]);

    const paths = [
      '',
      '/blog',
      ...projects.map((project) => `/projects/${project.slug}`),
      ...blogPosts.map((post) => `/blog/${post.slug}`),
    ];

    const escapeXml = (value) =>
      String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

    const urls = paths
      .map(
        (path) =>
          `<url><loc>${escapeXml(`${baseUrl}${path}`)}</loc></url>`
      )
      .join('');

    res
      .status(200)
      .type('application/xml')
      .send(
        `<?xml version="1.0" encoding="UTF-8"?>` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
        `${urls}</urlset>`
      );
  } catch (error) {
    next(error);
  }
});

// Return JSON for unknown API endpoints
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Centralized error handler
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const status =
    error.name === 'ValidationError'
      ? 400
      : Number.isInteger(error.status) &&
          error.status >= 400 &&
          error.status < 600
        ? error.status
        : 500;

  if (status >= 500) {
    console.error('Request failed:', error);
  }

  res.status(status).json({
    message:
      status >= 500
        ? 'Server error'
        : error.message || 'Request failed',
  });
});

// Connect to MongoDB before accepting API traffic
const startServer = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log('MongoDB connected successfully');

    const PORT = Number(process.env.PORT) || 5000;

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`API running on port ${PORT}`);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      console.log(`${signal} received. Shutting down...`);

      server.close(async () => {
        try {
          await mongoose.disconnect();
          console.log('MongoDB disconnected');
          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
    };

    process.once('SIGTERM', () => shutdown('SIGTERM'));
    process.once('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start the API:', error.message);

    if (error.cause) {
      console.error('Underlying error:', error.cause.message);
    }

    process.exit(1);
  }
};

startServer();

