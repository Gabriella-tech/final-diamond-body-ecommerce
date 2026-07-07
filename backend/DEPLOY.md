# Deployment Guide — Diamond Body Backend

Recommended: **Render** (easy) or **Railway** (also easy) with a managed PostgreSQL instance.

---

## Option 1 — Render.com (Recommended)

### Step 1: Create a PostgreSQL database
1. Render Dashboard → **New +** → **PostgreSQL**
2. Name: `diamond-body-db`
3. Plan: Free is fine to start
4. Region: same as your web service (e.g. Oregon)
5. Click **Create Database**
6. Copy the **Internal Connection String** — you'll need it in Step 2

### Step 2: Create the Web Service
1. Push this `backend/` folder to a Git repository (GitHub/GitLab)
2. Render Dashboard → **New +** → **Web Service**
3. Connect your repo
4. Configure:
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command:** `npm start`
   - **Instance Type:** Starter or higher (Free tier sleeps after 15 min)

### Step 3: Environment variables
In the service **Environment** tab, add all values from `.env.example`:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `10000` (Render auto-detects) |
| `DATABASE_URL` | *(paste internal URL from Step 1)* |
| `JWT_ACCESS_SECRET` | *(64+ char random hex)* |
| `JWT_REFRESH_SECRET` | *(different 64+ char random hex)* |
| `JWT_RESET_SECRET` | *(third random hex)* |
| `CORS_ORIGINS` | `https://your-frontend.vercel.app` |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` |
| `SMTP_HOST` | `smtp.gmail.com` *(or your SMTP)* |
| `SMTP_USER` | *(your email)* |
| `SMTP_PASSWORD` | *(SMTP app password)* |
| `SUPER_ADMIN_EMAIL` | *(custom, or leave default)* |
| `SUPER_ADMIN_PASSWORD` | *(**strong** password)* |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | *(strong password)* |
| `NATION_LEADER_PASSWORD` | *(strong password)* |

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Step 4: Persistent disk for uploads
Render Dashboard → your service → **Disks** → **Add Disk**
- Name: `uploads`
- Mount path: `/opt/render/project/src/backend/uploads`
- Size: 1 GB (grow as needed)

Without this, uploaded payment proofs vanish on every deploy.

### Step 5: Seed the database (once)
After the first successful deploy, open the Render **Shell** for your service and run:
```bash
npm run seed
```

### Step 6: Verify
```bash
curl https://your-api.onrender.com/api/v1/health
```

---

## Option 2 — Railway.app

1. **New Project** → **Deploy from GitHub repo**
2. Add a **PostgreSQL** plugin (Railway wires the `DATABASE_URL` automatically)
3. Set all env vars in the service Variables tab
4. Set **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy`
5. Set **Start Command:** `npm start`
6. Mount a **Volume** at `/app/uploads` so payment proofs persist
7. After first deploy, open a shell and run: `npm run seed`

---

## Option 3 — Fly.io / VPS / Docker

A minimal `Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npx prisma generate
EXPOSE 5000
CMD ["node", "src/server.js"]
```

Then:
```bash
docker build -t diamond-body-api .
docker run -p 5000:5000 --env-file .env -v $PWD/uploads:/app/uploads diamond-body-api
```

Remember to run migrations against your managed Postgres:
```bash
DATABASE_URL="postgres://…" npx prisma migrate deploy
DATABASE_URL="postgres://…" node prisma/seed.js
```

---

## Production checklist

- [ ] All JWT secrets are **new**, 64+ char random hex (never commit `.env`)
- [ ] `SUPER_ADMIN_PASSWORD`, `ADMIN_PASSWORD`, `NATION_LEADER_PASSWORD` are strong and unique
- [ ] `DATABASE_URL` points to a managed backup-enabled Postgres
- [ ] `CORS_ORIGINS` lists **only** your real production frontend URLs
- [ ] `NODE_ENV=production`
- [ ] Persistent volume mounted for `uploads/` OR migrated to S3/Cloudinary
- [ ] SMTP credentials work — test forgot-password flow
- [ ] HTTPS enforced by your host (Render, Railway, Fly all do this)
- [ ] Health check monitored: `/api/v1/health`
- [ ] Database backups enabled by your provider
- [ ] Rate limits reviewed for expected traffic (`RATE_LIMIT_MAX_REQUESTS`)

---

## Frontend connection

Point your frontend build to the API:

```env
# frontend .env
VITE_API_URL=https://your-api.onrender.com/api/v1
```

Then rebuild + redeploy the frontend.

---

## Scaling notes

- **Uploads folder** — switch to Cloudinary/S3 as soon as you outgrow a single instance. Replace `services/upload.service.js` with your storage client; the rest of the code doesn't change.
- **Sessions table** grows over time — add a scheduled task (e.g. Render cron job) to run:
  ```sql
  DELETE FROM "Session" WHERE "expiresAt" < NOW() OR "revoked" = TRUE;
  DELETE FROM "PasswordResetToken" WHERE "expiresAt" < NOW() OR "used" = TRUE;
  ```
- **Rate limits** — currently per-instance. For multi-instance, plug `rate-limit-redis` into `middleware/rateLimit.middleware.js`.

---

## Rotating admin passwords

If you need to reset an admin password on production without deploying:

```bash
# On the server shell:
node -e "
const bcrypt=require('bcryptjs');
const {PrismaClient}=require('@prisma/client');
const p=new PrismaClient();
(async()=>{
  const hash=await bcrypt.hash('NEW_STRONG_PASSWORD_HERE', 12);
  await p.user.update({ where:{email:'admin@diamondbody.com'}, data:{passwordHash:hash} });
  console.log('Password updated');
  process.exit(0);
})();"
```
