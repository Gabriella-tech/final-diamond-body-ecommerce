# Diamond Body — Backend API

Production-ready REST API for the Diamond Body wellness e-commerce platform.

**Stack:** Node.js · Express · PostgreSQL · Prisma · JWT · bcrypt · Multer · Nodemailer · Express Validator

The backend is completely standalone. Your existing React + Vite frontend calls this API over HTTP and does not need to be modified structurally — only the API base URL needs to be pointed at this backend.

---

## 📁 Folder Structure

```
backend/
├── prisma/
│   ├── schema.prisma        # database schema
│   └── seed.js              # seed 1 super admin + 1 admin + 8 nations + 8 leaders + products
├── src/
│   ├── config/
│   │   ├── env.js           # validated env loader
│   │   └── prisma.js        # PrismaClient singleton
│   ├── controllers/         # route handlers
│   ├── middleware/          # auth, validation, error handling, rate limits
│   ├── routes/              # /auth, /nations, /products, /orders, /members, /leader, /admin
│   ├── services/            # auth, tokens, mail, upload
│   ├── utils/               # ApiError, response envelope, pagination
│   ├── app.js               # Express app (middleware + routes)
│   └── server.js            # HTTP bootstrap
├── uploads/                 # payment proof files (git-ignored)
├── .env.example
├── .gitignore
└── package.json
```

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env & fill in DATABASE_URL + JWT secrets
cp .env.example .env

# 3. Create the database schema
npm run prisma:migrate      # first time (creates migration)
# or in production:
# npm run prisma:deploy

# 4. Seed initial data (super admin, admin, 8 nations, products, pickup stations)
npm run seed

# 5. Start the server
npm run dev                 # http://localhost:5000
```

Health check: `GET http://localhost:5000/api/v1/health`

---

## 🔑 Seeded Login Credentials

| Role | Email | Password |
|---|---|---|
| Super Admin | `super@diamondbody.com` | `DiamondSuper2026!` |
| Admin | `admin@diamondbody.com` | `DiamondAdmin2026!` |
| Nation Leader (all 8) | `tunde@diamondbody.com`, `sarah@…`, `blessing@…`, `david@…`, `grace@…`, `emeka@…`, `chioma@…`, `john@…` | `Diamond2026!` |

⚠️ Change these in `.env` before deploying to production.

---

## 🧭 Roles & Access

- **`SUPER_ADMIN`** — full access to everything
- **`ADMIN`** — everything except permanent product deletion
- **`NATION_LEADER`** — dashboard + members + orders **scoped to their own nation only**
- **`MEMBER`** — own profile, own orders, place orders, upload payment proofs

---

## 🌐 Frontend Integration

Set the base URL your frontend uses to call the API:

```
VITE_API_URL=http://localhost:5000/api/v1
```

All responses follow the envelope:
```json
{ "success": true, "message": "OK", "data": { ... } }
```

Authentication is Bearer JWT:
```
Authorization: Bearer <accessToken>
```

---

## 📖 See Also

- [`API.md`](./API.md) — full endpoint reference
- [`INSTALL.md`](./INSTALL.md) — detailed installation guide
- [`DEPLOY.md`](./DEPLOY.md) — production deployment guide (Render, Railway, Fly.io)

---

## 🛡️ Security Features

- JWT with rotating refresh tokens (revocable sessions)
- bcrypt password hashing (configurable rounds, default 12)
- Helmet security headers
- CORS allowlist (from env)
- Global + per-endpoint rate limiting
- Express Validator input validation
- Multer upload validation (mime type + size + safe filenames)
- Password reset via signed one-time tokens (SHA-256 hashed at rest)
- Nation scope enforcement in leader endpoints (data isolation)

---

## 📝 License

Proprietary — Diamond Body Wellness Ltd.
