# Sportify

Book sports venues by the slot. A Playo-style platform for finding courts, turfs, and pools — with a player-facing booking flow and a merchant dashboard for venue owners.

## What's in this repo

```
Sportify-v1/
  backend/    Express + TypeScript + Prisma + PostgreSQL
  frontend/   Vite + React 19 + TypeScript + Tailwind v4 + React Router
```

## Stack at a glance

**Backend** — Express 4, TypeScript (strict), Prisma 6, PostgreSQL (Neon). Auth via JWT (7-day expiry, bcrypt), Zod for request validation, helmet, cors, pino-http logs, express-rate-limit on auth and bookings. Modular structure: `auth`, `users`, `sports`, `venues` (with slot endpoints), `bookings`.

**Frontend** — Vite 6, React 19, TypeScript, Tailwind CSS v4, React Router 6, Zustand (with persist) for auth state, axios with token interceptor + 401 redirect, react-hook-form + Zod for forms, sonner for toasts, lucide-react icons, date-fns for date formatting.

**Database** — single PostgreSQL DB. Prisma schema includes `User`, `Sport`, `Venue`, `Slot`, `Booking`, `Payment` (model only, payments are a future phase), `Review`, `Activity`, `Coupon`, `Notification`.

**Booking integrity** — `Slot` has a unique `@@unique([venueId, date, startTime])`; `Booking` has a Postgres **partial unique index** `CREATE UNIQUE INDEX booking_active_slot_unique ON "Booking"("slotId") WHERE status <> 'CANCELLED' AND "slotId" IS NOT NULL` that makes double-booking physically impossible — combined with `prisma.$transaction(..., { isolationLevel: 'Serializable' })` in the booking service, concurrent attempts on the same slot resolve to exactly one 201 and the rest 409 (verified with a 10-way concurrent test).

## Run locally

Two terminals.

### Backend

```bash
cd Sportify-v1/backend
cp .env.example .env       # then edit DATABASE_URL + JWT_SECRET (>=32 chars)
npm install
npm run migrate            # applies init + booking_active_slot_unique
npm run seed               # creates demo accounts + 4 venues across Bengaluru/Hyderabad
npm run dev                # http://localhost:5000
```

Demo accounts (password `Password123!`):
- `admin@sportify.dev` (ADMIN)
- `merchant@sportify.dev` (MERCHANT) — owns the seeded venues
- `player@sportify.dev` (PLAYER)

Health check: `GET /health`. API root: `/api`.

### Frontend

```bash
cd Sportify-v1/frontend
cp .env.example .env       # default points at http://localhost:5000/api
npm install
npm run dev                # http://localhost:5173 (or 5174 if 5173 is busy)
```

If Vite picks 5174, add it to the backend's `CORS_ORIGIN` (comma-separated): `CORS_ORIGIN='http://localhost:5173,http://localhost:5174'`, then restart the backend.

## API surface (MVP)

| Module | Endpoint | Auth | Notes |
|---|---|---|---|
| Auth | `POST /api/auth/signup` | – | `{ name, email, password, role: PLAYER\|MERCHANT }` → user + JWT |
| Auth | `POST /api/auth/login` | – | `{ email, password }` → user + JWT |
| Auth | `GET /api/auth/me` | bearer | Fresh user (no password) |
| Users | `GET /api/users/me` | bearer | |
| Users | `PATCH /api/users/me` | bearer | `{ name?, phone?, bio?, avatarUrl?, skill? }` |
| Sports | `GET /api/sports` | – | Read-only sport list |
| Venues | `GET /api/venues` | – | Filters: `sport`, `city`, `q`, `minPrice`, `maxPrice`, paginated |
| Venues | `GET /api/venues/:id` | – | With sports + owner |
| Venues | `POST /api/venues` | MERCHANT | Create (Zod-validated) |
| Venues | `PATCH /api/venues/:id` | owner | Partial update |
| Venues | `DELETE /api/venues/:id` | owner | Blocked if active bookings |
| Venues | `GET /api/venues/me/owned` | MERCHANT | Merchant dashboard |
| Venues | `POST /api/venues/:id/slots` | owner | `{ date, startHour, endHour, slotDurationMinutes? }` — idempotent |
| Venues | `POST /api/venues/:id/slots/bulk` | owner | Same but for a date range |
| Venues | `GET /api/venues/:id/availability?date=YYYY-MM-DD` | – | Slots annotated with `isBooked` |
| Bookings | `POST /api/bookings` | bearer | `{ slotId, sportId }` — transactional, 409 on race |
| Bookings | `GET /api/bookings/me` | bearer | Split `upcoming` / `past` |
| Bookings | `GET /api/bookings/venue/:venueId` | venue owner | Merchant view |
| Bookings | `PATCH /api/bookings/:id/cancel` | booking owner OR venue owner OR ADMIN | |

## Frontend routes

- Public: `/`, `/login`, `/signup`, `/venues`, `/venues/:id`
- Protected (auth): `/bookings`, `/profile`
- Merchant-only: `/merchant/venues`, `/merchant/venues/new`, `/merchant/venues/:id/edit`, `/merchant/venues/:id/slots`

## Verification (golden path)

1. `curl http://localhost:5000/health` → `{ status: 'ok' }`
2. Open `http://localhost:5173` → landing renders with seeded venues.
3. Sign up as a PLAYER → redirected to `/venues`.
4. Filter by sport → list updates from `?sport=...` query.
5. Open a venue → pick tomorrow → slot grid shows hourly slots.
6. Click a slot → "Book this slot" → toast → land on `/bookings` with the booking.
7. Cancel from `/bookings` → moves to Past tab.
8. Log out → log in as `merchant@sportify.dev` → `/merchant/venues` shows the seeded 4 → `Slots` opens the date-range form → generate slots for next week.

## Race-condition test

```bash
# Get a token, find a free slot, then blast 10 concurrent POSTs:
for i in {1..10}; do
  curl -s -o /tmp/r$i.json -w "%{http_code}\n" \
    -X POST http://localhost:5000/api/bookings \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"slotId\":\"$SLOT_ID\",\"sportId\":\"$SPORT_ID\"}" &
done
wait
# Expected: exactly one 201, nine 409s.
```

## What's intentionally out of scope (next phases)

- Payments (Razorpay / Stripe) — `Payment` model exists, no service.
- Activities / hosting games — `Activity` model exists, no UI.
- Reviews & ratings — `Review` model exists, no UI.
- Notifications, chat, loyalty redemption.
- Image uploads — venue images are URL strings for now (Cloudinary in phase 2).
- Email verification + password reset — needs an email provider.
- Automated tests — Vitest + Supertest (backend) and Playwright (frontend e2e) tracked as a follow-up.

## Deploy

The repo ships with deploy configs for both sides:

- `render.yaml` — backend blueprint for [Render](https://render.com) (free tier, recommended)
- `backend/railway.json` — backend config for [Railway](https://railway.app) (alternative)
- `frontend/vercel.json` — frontend config for [Vercel](https://vercel.com) (free tier)

Database stays on [Neon](https://neon.tech) (already provisioned).

### Step 1 — backend on Render (5 min)

1. https://render.com → **New +** → **Blueprint**.
2. Connect this repo. Render detects `render.yaml` and proposes the `sportify-api` service.
3. Add the three secret env vars in the dashboard (the blueprint marks them as `sync: false`):
   - `DATABASE_URL` — your Neon connection string
   - `JWT_SECRET` — 32+ random chars (`node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"`)
   - `CORS_ORIGIN` — set to a placeholder for now, e.g. `http://localhost:5173`. Update after step 2.
4. **Apply**. First build runs `prisma generate && tsc -p .`; start runs `prisma migrate deploy && node dist/server.js`. Visit `/health` to confirm.

You'll get a URL like `https://sportify-api.onrender.com`.

### Step 2 — frontend on Vercel (3 min)

1. https://vercel.com/new → import this repo.
2. Set **Root Directory** to `frontend`.
3. Vercel auto-detects Vite. Confirm build command `npm run build`, output `dist`.
4. Add env var **`VITE_API_URL`** = `https://sportify-api.onrender.com/api` (from step 1).
5. **Deploy**.

### Step 3 — wire them together (1 min)

Back in Render → Environment → set `CORS_ORIGIN` to your Vercel URL (e.g. `https://sportify.vercel.app`) → save → service auto-redeploys.

Done. Visit the Vercel URL.

### Notes

- The first request to the Render free tier after 15 min of inactivity wakes the dyno (~30s cold start). Upgrade to a paid plan to keep it warm.
- Rotate the Neon password before going public — the original was in git history. Generate a new one in the Neon console and update `DATABASE_URL` in Render.
- The seed only runs locally (`npm run seed`); on Render only `migrate deploy` runs at start. If you want seeded data in prod, run the seed locally pointing at the prod `DATABASE_URL` once.
- CI (`.github/workflows/ci.yml`) runs typecheck + build + tests on every push — this won't auto-deploy, the Render/Vercel sides do that.

### Why these picks

- **Backend → Render**: free tier with a real Postgres connection (Railway moved off free in late 2025). Deploys from GitHub on push.
- **Frontend → Vercel**: zero-config Vite detection, fastest CDN for SPAs, generous free tier.
- **Backend → Railway**: included `backend/railway.json` if you prefer a paid host with no cold starts. Same flow — `railway init` and link the repo, then set the same env vars.
