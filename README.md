# FISSI-PORTAL Backend

Backend API for Faith International Secondary School Itobe's school management system.
Node.js + Express + PostgreSQL (via Prisma).

## Why devices couldn't connect before

There was no live deployed backend — the code only existed in chat. A device
can only "connect" to something with a real internet address. Once this is
deployed to Render (below), every phone or PC just visits the same URL over
the internet — no local network setup needed at all.

## 1. Push this code to GitHub

```bash
cd fissi-portal-backend
git init
git add .
git commit -m "Initial backend commit"
git branch -M main
git remote add origin https://github.com/humoru29-netizen/fissi-portal--backend.git
git push -u origin main
```

## 2. Create the database on Neon.tech

1. Go to https://neon.tech and sign in / sign up
2. Create a new project (e.g. "fissi-portal")
3. Copy the **pooled connection string** it gives you — looks like:
   `postgresql://user:password@ep-xxxx-pooler.neon.tech/neondb?sslmode=require`
4. Keep this for step 3.

## 3. Deploy to Render

1. Go to https://render.com and sign in
2. New + → Web Service → connect your `fissi-portal--backend` GitHub repo
3. Settings:
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `npx prisma migrate deploy && npm start`
   - **Environment:** Node
4. Add Environment Variables (Render dashboard → Environment):
   - `DATABASE_URL` → the Neon connection string from step 2
   - `JWT_SECRET` → any long random string (generate one at random.org or just mash your keyboard)
   - `JWT_EXPIRES_IN` → `7d`
   - `NODE_ENV` → `production`
   - `CORS_ORIGIN` → your frontend URL, e.g. `https://fissi-portal.netlify.app` (comma-separate if more than one)
5. Deploy. Render gives you a live URL like `https://fissi-portal-backend.onrender.com`

## 4. Point your frontend at the live backend

Wherever your frontend calls the API (usually an `.env` or `config.js` with
`API_BASE_URL` or similar), set it to your Render URL. Redeploy the frontend.

## 5. Test from another device

Once both are deployed, open the frontend URL on your Android phone or any
PC. It will now talk to the same live backend as your main computer — that's
what "connecting from another device" actually means for a web app.

## First-time setup after deploy

The **first account you sign up** through `/api/auth/signup` is automatically
made an ADMIN and auto-approved (so there's always someone able to approve
everyone else). Every signup after that goes into a pending queue until an
admin approves it via `/api/admin/signups/pending`.

## Local development

```bash
npm install
cp .env.example .env   # fill in a local or Neon DATABASE_URL
npx prisma migrate dev --name init
npm run dev
```

## API overview

| Area | Route | Notes |
|---|---|---|
| Auth | `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me` | First signup = auto admin |
| Admin | `GET/PATCH /api/admin/signups/*`, `/api/admin/students/*` | Approval queue + student CRUD |
| Scores | `POST /api/scores`, `GET /api/scores/pending`, `PATCH /api/scores/:id/decision` | Teacher submit → admin approve workflow, works from any device |
| Fees | `POST /api/fees`, `POST /api/fees/bulk-csv`, `POST /api/fees/adjustments` | Cashier module |
| Reports | `GET /api/reports/:studentId?term=FIRST&session=2025/2026` | PDF, only generates if scores are approved |
| Academics | `/api/academics/classes`, `/api/academics/subjects` | Class & subject setup |
