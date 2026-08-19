# CHAYKAHANA MENU

Next.js 16 full-stack multilingual restaurant menu and protected admin panel.

## Features

- Mobile-first menu with UZ / 한국어 / RU / EN languages
- Localized welcome loader, category search, quantity controls, and meal-total calculator
- Protected admin login
- Dish create, update, show/hide, image upload, translation, and delete
- Shared REST API backed by Supabase PostgreSQL
- HTTP-only signed admin session cookie
- Vercel-compatible database and image storage

## Routes

- `/` — customer menu
- `/admin/login` — admin login
- `/admin` — protected CRUD panel
- `/api/dishes` — public visible menu; protected admin reads/writes
- `/api/auth/login`, `/api/auth/logout` — admin session

## Setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

Set strong values in `.env.local`:

```env
ADMIN_PASSWORD=your-strong-password
AUTH_SECRET=at-least-32-random-characters
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Development-only fallback password when `ADMIN_PASSWORD` is missing: `chaykahana-admin`.

## Production

```bash
npm run build
npm start
```

## Supabase and Vercel

1. Create a Supabase project and run `supabase/migration.sql` in its SQL Editor.
2. Add all variables from `.env.example` to Vercel Project Settings → Environment Variables.
3. Redeploy the latest `main` commit. The service-role key is server-only and must never use the `NEXT_PUBLIC_` prefix.

The menu uses Supabase PostgreSQL and uploads admin images to the public `dish-images` Storage bucket, so it is compatible with Vercel's serverless filesystem.

## Security

- Admin writes require a valid signed HTTP-only cookie.
- The cookie uses `SameSite=Strict` and `Secure` in production.
- Never commit `.env.local` or service-role credentials.
