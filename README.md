# Prasanth Selva — Cybersecurity Portfolio

A cinematic, Awwwards-style portfolio with a **sticky canvas scrollytelling hero**
(300 real WebP frames), an **interactive 3D skill orbit**, a full content model on
**Supabase (Postgres + Storage + RLS)**, and a **secure admin dashboard** at
`/admin` for managing every piece of content without touching code.

```
Next.js 14 (App Router) · TypeScript (strict) · Tailwind CSS
Framer Motion · Lenis · React Three Fiber + drei · three
Supabase · NextAuth (credentials) · Zod · react-hook-form
```

---

## ✨ Features

**Public site**

- 400vh sticky-canvas scrollytelling hero: devicePixelRatio-aware, lerp-smoothed
  rAF painting, full-sequence preload with percentage loader, scroll-synced
  cinematic text overlays (fade + blur + translate)
- Procedural fallback: if frames are missing, a canvas-drawn exploding
  cyber-core (shield + chip + padlock + network nodes) renders instead
- About with animated stat counters · scroll-drawn experience timeline
- 3D tilt/parallax project cards + detail pages (`/projects/[slug]`)
- Interactive 3D skill orbit (R3F) with graceful 2D fallback on mobile/reduced-motion
- Achievements, certifications, contact form (honeypot + rate limit + Zod),
  MDX writeups with syntax highlighting
- Terminal easter egg: press **`` ` ``** anywhere → `whoami`, `ls projects`,
  `skills`, `goto <section>`, `sudo` (nice try), and more
- Custom cursor, magnetic buttons, film grain, glassmorphism, active-section
  glass navbar, `prefers-reduced-motion` respected everywhere

**Admin (`/admin`)**

- Single-admin credentials auth (env-based), JWT httpOnly cookies,
  middleware-protected routes, per-IP login rate limiting (5 / 10 min)
- Full CRUD + drag-to-reorder + publish/draft for: Projects, Experience,
  Certifications, Achievements, Skills, Writeups
- MDX editor with live preview; direct image uploads for project covers and
  galleries, certifications, achievements, writeup covers, and the About photo;
  files go browser-to-Supabase using short-lived admin-authorized upload URLs,
  bypassing serverless request-body limits; resume PDF upload; site settings
  (hero badge, socials, SEO, phone)
- Contact inbox: unread badge, read/unread toggle, delete, reply-by-mailto
- Dashboard: content counts, recent messages, 14-day visit analytics
- On-demand ISR: every save revalidates affected public pages instantly

---

## 🚀 Quick start

```bash
# 1. Install
npm install

# 2. Environment
cp .env.example .env.local
#    → fill in at least NEXTAUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD

# 3. Run
npm run dev            # http://localhost:3000
```

The site works **out of the box** with seed data — Supabase is optional for
browsing; it becomes required for the admin CRUD and contact inbox.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | prod | Canonical URL for SEO/OG/sitemap |
| `NEXT_PUBLIC_SUPABASE_URL` | admin | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | admin | Public RLS reads |
| `SUPABASE_SERVICE_ROLE_KEY` | admin | Server writes (never client-side) |
| `NEXTAUTH_SECRET` | admin | Session signing (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | prod | Canonical auth URL |
| `ADMIN_EMAIL` | admin | The single admin login |
| `ADMIN_PASSWORD` **or** `ADMIN_PASSWORD_HASH` | admin | Password (bcrypt hash preferred) |
| `NEXT_PUBLIC_CONTACT_PHONE` | no | Show phone contact when set |
| `RESEND_API_KEY` / `CONTACT_NOTIFY_EMAIL` / `RESEND_FROM` | no | Email notifications for the contact form |

Generate a password hash:

```bash
node -e "console.log(require('bcryptjs').hashSync('YOUR_PASSWORD', 12))"
```

---

## 🗄️ Database setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** → paste and run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
   This creates all 8 tables, indexes, **Row Level Security** policies
   (public read on published rows, insert-only messages) and the public
   `media` storage bucket.
3. Copy `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and
   `SUPABASE_SERVICE_ROLE_KEY` from **Project Settings → API** into `.env.local`.
4. Seed canonical content:

```bash
npm run seed
```

### Data model

`projects`, `experiences`, `certifications`, `achievements`, `skills`,
`posts`, `messages`, `settings` — see
[`src/lib/types.ts`](src/lib/types.ts) for row shapes and
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) for
constraints and policies.

---

## 🎞️ Hero frame pipeline

The hero ships with **300 real frames** already optimized into
`public/sequence/` (`core_001_delay-0.04s.webp` … + `manifest.json`).

**To regenerate from raw frames** (any `hero/ezgif-frame-*.png`):

```bash
node scripts/optimize-frames.mjs --width 1280 --quality 78
```

**To create a new sequence from scratch:**

1. Generate keyframes with an image model (e.g. a glowing cyber-core —
   shield, chip, padlock and network nodes — that explodes and reassembles).
2. Animate them with a video model into `core.mp4`.
3. Extract frames with ffmpeg:

```bash
ffmpeg -i core.mp4 -vf "fps=30,scale=1920:-1" -c:v libwebp -quality 80 core_%03d.webp
```

4. Drop the frames in `public/sequence/` named
   `core_[i]_delay-0.04s.webp` (zero-padded to 3) and update
   `count` in `public/sequence/manifest.json`.

Until frames exist, the site automatically renders the **procedural fallback**
(`src/components/hero/fallback-painter.tsx`) — no blank hero, ever.

---

## 🛠️ Admin dashboard

1. Fill admin env vars (above) and visit `/admin/login`.
2. Sign in — sessions are JWT httpOnly cookies, 12h expiry.
3. Manage content: each section supports create/edit/delete, drag-to-reorder
   (saved automatically) and publish/draft toggles.
4. **Resume** page uploads a PDF to Supabase Storage and wires the
   “Download Resume” buttons automatically.
5. **Settings** controls the hero badge, email, socials, phone visibility,
   SEO defaults and the about photo upload.
6. There is **no link to /admin** in the public UI — it is deliberately
   unlisted. Bookmark it.

Security posture: middleware route protection + server-session checks in every
server action, Zod validation on all payloads, per-IP login rate limiting,
honeypot + rate-limited contact endpoint, strict security headers (CSP,
X-Frame-Options, Referrer-Policy, HSTS, nosniff) in
[`next.config.mts`](next.config.mts).

---

## ☁️ Deploy to Vercel

1. Push the repo to GitHub.
2. **Import** it in Vercel; framework preset: Next.js (zero config).
3. Add all env vars from `.env.example` in **Project → Settings → Environment Variables**.
   - `NEXTAUTH_URL` → your production URL
   - `NEXT_PUBLIC_SITE_URL` → same
4. In Supabase **Authentication → URL Configuration**, add
   `https://your-domain.com/admin/login` as a redirect target if you ever
   enable Supabase-side auth flows (not required for NextAuth credentials).
5. Deploy. On-demand revalidation and OG image generation work out of the box.

---

## 📜 Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run typecheck` | Strict TypeScript check |
| `npm run lint` | ESLint (next/core-web-vitals) |
| `npm run seed` | Seed Supabase with canonical content |
| `node scripts/optimize-frames.mjs` | Re-optimize raw hero frames → WebP |

---

## 🧱 Project structure

```
src/
├── app/                    # App Router pages (home, projects, writeups, admin, APIs)
├── components/
│   ├── hero/               # CyberCoreScroll + overlays + procedural fallback
│   ├── layout/             # Navbar, footer, terminal easter egg
│   ├── sections/           # About, Experience, Projects, Skills, …
│   ├── three/              # R3F skill orbit (lazy, client-only)
│   └── ui/                 # Magnetic buttons, reveals, custom cursor
├── lib/                    # Data layer, auth, validation, rate limiting, seed
└── middleware.ts           # /admin protection + login rate limit
supabase/migrations/        # SQL schema + RLS
scripts/                    # Frame optimizer + seed script
hero/                       # Raw frames (gitignored; optimized into public/)
```
