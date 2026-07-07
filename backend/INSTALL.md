# Installation Guide — Diamond Body Backend

Get the API running locally on Windows, macOS, or Linux in ~10 minutes.

---

## Prerequisites

- **Node.js 18+** — https://nodejs.org
- **PostgreSQL 14+** running locally OR a managed database URL (Neon, Supabase, Render, Railway)
- **Git** (optional but recommended)

Check versions:
```bash
node --version   # v18+
npm --version    # v9+
psql --version   # 14+ (only if using local Postgres)
```

---

## 1. Get the code

```bash
cd backend
npm install
```

---

## 2. Set up PostgreSQL

### Option A — Local Postgres
```sql
-- as superuser (psql -U postgres)
CREATE DATABASE diamond_body;
CREATE USER diamond WITH ENCRYPTED PASSWORD 'diamond';
GRANT ALL PRIVILEGES ON DATABASE diamond_body TO diamond;
```
Connection string:
```
postgresql://diamond:diamond@localhost:5432/diamond_body?schema=public
```

### Option B — Managed (Neon / Supabase / Render / Railway)
Create a free Postgres instance and copy the connection URL they give you.

---

## 3. Configure environment

```bash
cp .env.example .env
```

Open `.env` and set these mandatory values:

```env
DATABASE_URL=postgresql://diamond:diamond@localhost:5432/diamond_body?schema=public

# Generate long random secrets (any 64+ char strings). One-liners:
#   Node:    node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
#   OpenSSL: openssl rand -hex 48
JWT_ACCESS_SECRET=<paste-64+-char-hex>
JWT_REFRESH_SECRET=<paste-different-64+-char-hex>
JWT_RESET_SECRET=<paste-third-different-hex>

# Frontend origin(s), comma-separated
CORS_ORIGINS=http://localhost:5173,http://localhost:9999
FRONTEND_URL=http://localhost:5173
```

Optional (for real emails — leave blank in dev):
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASSWORD=your-gmail-app-password
```

---

## 4. Run database migration

Create the schema in your Postgres database:

```bash
npm run prisma:migrate
# When prompted, name the migration "init"
```

This runs `prisma migrate dev`, which:
1. Creates the migration SQL in `prisma/migrations/`
2. Applies it to your database
3. Generates the Prisma Client

---

## 5. Seed initial data

```bash
npm run seed
```

You should see:
```
✓ Super Admin: super@diamondbody.com
✓ Admin:       admin@diamondbody.com
✓ Nation: Vision Nation — Tunde Adebayo
✓ Nation: Unstoppable Nation — Sarah Adeyemi
… (all 8)
✓ Categories: 7
✓ Products:   11
✓ Pickup Stations: 5
✅ Seed complete.
```

---

## 6. Start the server

```bash
npm run dev
```

Output:
```
[db] Connected to PostgreSQL
[server] Diamond Body API running on http://localhost:5000
[server] API prefix: /api/v1
```

Test it:
```bash
curl http://localhost:5000/api/v1/health
```

Expected response:
```json
{ "success": true, "message": "Diamond Body API healthy", "timestamp": "..." }
```

---

## 7. Test login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@diamondbody.com","password":"DiamondAdmin2026!"}'
```

You'll get back:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "...", "email": "admin@diamondbody.com", "role": "ADMIN", ... },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

## 8. Point your frontend at the API

In your frontend project, set:
```
VITE_API_URL=http://localhost:5000/api/v1
```

Then rebuild the frontend and it will talk to this backend.

---

## Troubleshooting

**`P1001: Can't reach database server`** — Postgres isn't running or `DATABASE_URL` is wrong. Verify with `psql "$DATABASE_URL"`.

**`PrismaClientInitializationError`** — Run `npx prisma generate` after any schema change.

**`Missing required environment variable: JWT_ACCESS_SECRET`** — Set all three JWT secrets in `.env`.

**CORS errors from the browser** — Add your frontend URL to `CORS_ORIGINS` (comma-separated, no trailing slash).

**Port 5000 already in use** — Change `PORT` in `.env` to something else (e.g. `PORT=5050`).

**Uploads fail with "no such file"** — Ensure `uploads/` folder exists at the project root (it's auto-created on boot, but make sure the process has write permission).

---

## Handy commands

```bash
npm run dev              # dev server with auto-reload
npm start                # production server
npm run prisma:studio    # open Prisma Studio — visual DB explorer at localhost:5555
npm run prisma:migrate   # create + apply a new migration
npm run prisma:deploy    # apply pending migrations (use in production)
npm run prisma:generate  # regenerate Prisma Client after schema.prisma changes
npm run seed             # (re)seed the database
```
