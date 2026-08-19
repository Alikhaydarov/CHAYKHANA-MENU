# CHAYKAHANA MENU

Next.js 16 full-stack multilingual restaurant menu and protected admin panel.

## Features

- Mobile-first menu with UZ / 한국어 / RU / EN languages
- Localized welcome loader, category search, quantity controls, and meal-total calculator
- Protected admin login
- Dish create, update, show/hide, image upload, translation, and delete
- Shared REST API backed by SQLite
- HTTP-only signed admin session cookie
- Production build compatible with a persistent Node/VPS deployment

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
DATABASE_PATH=./data/chaykahana.db
```

Development-only fallback password when `ADMIN_PASSWORD` is missing: `chaykahana-admin`.

## Production

```bash
npm run build
npm start
```

Deploy on a Node/VPS platform with a persistent disk because SQLite and uploaded image data must survive restarts. For Vercel/serverless deployment, migrate the storage layer to Postgres/Supabase and object storage first.

## Security

- Admin writes require a valid signed HTTP-only cookie.
- The cookie uses `SameSite=Strict` and `Secure` in production.
- Never commit `.env.local` or production database files.

