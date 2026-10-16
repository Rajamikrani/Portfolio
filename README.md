# AI Engineer Portfolio + Admin CMS (MERN)

A public AI/ML portfolio powered entirely by MongoDB, with a secure `/admin` CMS. Every text, image, link, project, skill, blog post and section toggle/order is editable without touching code.

## Stack
React 18 + Vite + React Router + Tailwind + Axios + Lucide · Express 4 · MongoDB/Mongoose · JWT (HTTP-only cookie) + bcrypt · Cloudinary (Multer) · Helmet, CORS, rate limiting, mongo-sanitize.

## Architecture
- `server/src/models.js` – 12 Mongoose collections (User, Profile, Skill, Project, Experience, Education, Certification, Achievement, BlogPost, ContactMessage, SocialLink, SiteSettings, Analytics), all with timestamps.
- `server/src/routes.js` – auth, a generic CRUD factory (reorder, publish filter, slug lookup), contact, upload, `/api/site` aggregate, stats, analytics.
- `client/src/admin/config.js` – the admin UI is config-driven: add a field there and it appears in the CMS form.

## Setup
```bash
cd server && cp .env.example .env   # fill MONGO_URI, JWT_SECRET (long random), CLIENT_URL, ADMIN_EMAIL, ADMIN_PASSWORD, Cloudinary keys
npm install && npm run seed && npm run dev
cd ../client && cp .env.example .env && npm install && npm run dev
```
Open http://localhost:5173 and http://localhost:5173/admin/login (credentials from your `.env`). `npm run seed` **wipes content collections** and recreates your profile, skills, 6 projects, education, social link placeholders (empty URLs) and settings. Run it once only.

## Using the CMS
Add social URLs (Social Links), upload a PDF in Resume, set project GitHub/demo links and thumbnails (Projects), toggle/reorder sections (Website Settings). Uploads require Cloudinary env vars.

## Deployment
1. **MongoDB Atlas**: create a cluster, allow your host's IPs, copy the URI.
2. **Backend (Render/Railway)**: root `server`, build `npm install`, start `npm start`. Set `NODE_ENV=production`, all env vars, and `CLIENT_URL=https://your-frontend`. Run `npm run seed` once from a shell.
3. **Frontend (Vercel/Netlify)**: root `client`, build `npm run build`, output `dist`, env `VITE_API_URL=https://your-api`. `vercel.json` / `_redirects` handle SPA routing.
4. Add `Sitemap: https://your-api/sitemap.xml` to `client/public/robots.txt` (or submit it in Search Console).
Cross-site cookies work because production sets `SameSite=None; Secure`. Both sites must be HTTPS.

## API
Public GET: `/api/site`, `/api/{projects,skills,experience,education,certifications,achievements,blog,social}` (+`/:id|slug`), `/api/profile`, `/api/settings`. `POST /api/contact`, `POST /api/analytics`.
Auth: `POST /api/auth/login|logout`, `GET /api/auth/me`.
Admin (cookie required): POST/PUT/DELETE on all resources, `PUT /:resource/reorder`, `PUT /api/profile|settings`, `GET /api/contact`, `PATCH /api/contact/:id/read`, `DELETE /api/contact/:id`, `POST /api/upload`, `GET /api/stats`.

## Not yet implemented / ideas
Section-level SEO images, pagination UI on blog, password change screen, image deletion from Cloudinary, per-project analytics charts, automated tests, screenshots section (add yours here).
