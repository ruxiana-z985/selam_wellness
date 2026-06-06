# No-Docker Deployment

This MVP is designed for normal Node hosting. You do not need Docker.

## Recommended Setup

- **Database:** Neon, Supabase, Render PostgreSQL, or Railway PostgreSQL
- **Backend:** Render Web Service
- **Frontend:** Vercel, Netlify, or Render Static Site

## Backend: Render

1. Create a new Web Service and connect the repository.
2. Use the repository root as the root directory.
3. Add environment variables:
   - `DATABASE_URL`
   - `FRONTEND_URL`
   - `PORT`
4. Build command:

```bash
npm install && npm run db:generate && npm run build:api
```

5. Start command:

```bash
npm run start:prod --workspace @selam/api
```

6. Run migrations once:

```bash
npm run db:migrate
npm run db:seed
```

## Frontend: Vercel or Netlify

1. Set project directory to `apps/web`.
2. Add `VITE_API_URL` with the deployed backend URL ending in `/api`.
3. Build command:

```bash
npm run build
```

4. Publish directory:

```bash
dist
```

## Local Demo Commands

```bash
npm install
npm run db:generate
npm run build
npm run preview --workspace @selam/web -- --host 127.0.0.1 --port 4173
```

Open `http://127.0.0.1:4173`.
