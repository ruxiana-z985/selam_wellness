# Selam Wellness

Selam Wellness is a hackathon-ready MVP for a digital Ethiopian wellness village: community circles, Women's Haven, culturally rooted wellness content, practitioners, journaling, and bookable retreats.

## Why It Wins

- **Clear cultural wedge:** built around Idir, Mahber, women's circles, coffee ceremony calm, and Ethiopian visual language.
- **Business model:** subscriptions for premium Women's Haven and journaling insights, practitioner commissions, retreat bookings, corporate wellness circles, and sponsored wellness content.
- **Deployable without Docker:** Vite frontend plus NestJS API on normal Node hosting, with PostgreSQL from Neon, Supabase, Render, or Railway.
- **Judge demo friendly:** the frontend runs with beautiful demo data immediately, while the API includes PostgreSQL schema and production endpoints.

## Stack

- `apps/web`: Vite + React + TypeScript
- `apps/api`: NestJS + Prisma + PostgreSQL

## Local Setup

```bash
npm install
cp apps/api/.env.example apps/api/.env
npm run db:generate
npm run dev:web
```

In a second terminal:

```bash
npm run dev:api
```

If you have PostgreSQL configured:

```bash
npm run db:migrate
npm run db:seed
```

## Deployment Without Docker

### Backend on Render

1. Create a PostgreSQL database on Render, Neon, Supabase, or Railway.
2. Add `DATABASE_URL` and `FRONTEND_URL` to the API environment.
3. Set build command: `npm install && npm run db:generate && npm run build:api`
4. Set start command: `npm run start:prod --workspace @selam/api`
5. Run `npm run db:migrate` once from your machine or Render shell.

### Frontend on Vercel or Netlify

1. Set root directory to `apps/web`.
2. Set build command to `npm run build`.
3. Set publish directory to `dist`.
4. Add `VITE_API_URL` pointing to the deployed Nest API.

## Demo Story

1. Open the home screen and say: "Selam means peace. This is a digital Ethiopian wellness village."
2. Show Women's Haven: cycle insight, practitioners, and safe community whispers.
3. Open Circles: explain low-toxicity support spaces with no downvotes.
4. Open Retreats: show how digital wellness becomes real-world revenue.
5. Mention backend safety checks, PostgreSQL schema, booking flow, and marketplace economics.
