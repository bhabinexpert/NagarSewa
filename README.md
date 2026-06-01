# NagarSewa (नगरसेवा)

<div align="center">

**Digital Public Service Platform for Damak Municipality, Nepal**

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF.svg)](https://vite.dev/)
[![Express](https://img.shields.io/badge/Express-5-black.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791.svg)](https://neon.tech/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

🌐 **Live:** [nagar-sewa.netlify.app](https://nagar-sewa.netlify.app) · **API:** [nagarsewa.onrender.com](https://nagarsewa.onrender.com)

</div>

---

## 📖 Overview

**NagarSewa** is a civic‑engagement platform that connects citizens of **Damak Municipality (Jhapa, Nepal)** with their local government. Citizens report issues, request community campaigns, and verify their identity (KYC); municipal staff manage and respond — all in one bilingual (English / नेपाली) web app.

| Role | Capabilities |
|------|--------------|
| **Citizen** | Report issues (photo + GPS), request campaigns, submit & manage KYC, read the community feed, receive broadcasts |
| **Ward Admin** | Manage issues & campaigns in their ward, verify KYC, manage users, view analytics, send broadcasts |
| **Super Admin** | All of the above across **every ward** + create/manage ward‑admin accounts |

> 📐 For a full walkthrough of how the code fits together (great for a demo), see **[ARCHITECTURE.md](ARCHITECTURE.md)**.

---

## ✨ Features

- 🔐 **JWT auth** with bcrypt password hashing and **role‑based access** (Citizen / Ward Admin / Super Admin), enforced server‑side
- 🗂️ **Per‑tab sessions** (`sessionStorage`) — run an admin and a citizen in two tabs without clashing
- 📋 **Issue reporting** with camera/file photo upload and automatic GPS location
- 🪪 **KYC verification** — citizens upload citizenship documents, view/replace them, admins approve or reject
- 🎯 **Campaign requests** with admin approval workflow
- 📣 **Broadcasts & community feed** with unseen‑notification badges
- 📊 **Analytics dashboard** for issues, users, and campaigns
- 🌐 **Bilingual UI** (English / Nepali) and Nepal‑specific location data
- ⚡ **Optimized** — route‑level code‑splitting and cacheable vendor chunks

---

## 🏗️ Project Structure

```
NagarSewa/
├── Frontend/                     # React 19 + Vite SPA
│   └── src/
│       ├── pages/                # landing, auth (login/signup), dashboards
│       ├── components/           # common, landing, dashboard/{user,admin}
│       ├── contexts/             # auth + language providers
│       ├── hooks/useData.js      # data-fetching hooks
│       ├── services/api.js       # Axios client + all endpoints
│       └── utils/                # image + location helpers
│
└── Backend/                      # Express 5 REST API
    └── src/
        ├── routes/               # auth, admin, users, issues, campaigns, feed, broadcasts
        ├── controllers/          # business logic
        ├── models/               # parameterised SQL (User, Issue, Campaign, Broadcast)
        ├── middleware/           # JWT auth, multer upload, rate limiting, logging
        ├── db.js                 # Postgres pool (DATABASE_URL+SSL or local PG_*)
        ├── app.js                # Express app + middleware + routes
        └── server.js             # entry point
```

---

## 🛠️ Tech Stack

**Frontend:** React 19 · Vite 7 · React Router 7 · Tailwind CSS 4 · Axios · lucide‑react · react‑toastify

**Backend:** Node.js · Express 5 · PostgreSQL (`pg`) · JWT · bcrypt · Multer · CORS · Morgan

**Hosting:** Netlify (frontend) · Render (backend) · Neon (Postgres)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (local) **or** a hosted Postgres connection string (Neon/Render)

### 1. Backend

```bash
cd Backend
npm install
cp .env.example .env      # then edit values
npm run dev               # http://localhost:2026
```

Configure `Backend/.env`:

```env
PORT=2026

# Local Postgres…
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=NagarSewa
PG_USER=postgres
PG_PASSWORD=your_password
PG_SSL=false

# …or a hosted DB (overrides the PG_* vars, connects over SSL)
# DATABASE_URL=postgresql://user:pass@host.neon.tech/neondb?sslmode=require

JWT_SECRET=change_this_to_a_long_random_secret_min_32_chars
NODE_ENV=development
```

> `db.js` automatically uses `DATABASE_URL` (with SSL) when set, otherwise the individual `PG_*` variables — so the same code runs locally and in production.

### 2. Frontend

```bash
cd Frontend
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:2026/api
npm run dev               # http://localhost:5173
```

---

## 📜 Scripts

**Backend**
```bash
npm run dev      # nodemon (hot reload)
npm start        # production
```

**Frontend**
```bash
npm run dev      # dev server
npm run build    # production build
npm run preview  # preview the build
npm run lint     # ESLint (0 errors)
```

---

## 🔌 API Summary

Base URL: `/api` · all responses are `{ success, message, data }`.

| Mount | Purpose |
|-------|---------|
| `/api/auth` | register, login, logout, current user |
| `/api/users` | profile, KYC submit/update/view |
| `/api/issues` | create / list / update status & priority |
| `/api/campaigns` | request / list / approve‑reject |
| `/api/feed` | community feed |
| `/api/broadcasts` | list / send announcements |
| `/api/admin` | dashboard stats, analytics, user & ward‑admin management |

Full endpoint list and request flow: **[ARCHITECTURE.md](ARCHITECTURE.md)**.

---

## ☁️ Deployment

| Component | Host | Notes |
|-----------|------|-------|
| Frontend | **Netlify** | `VITE_API_URL` set in `Frontend/netlify.toml`; SPA redirect for deep links |
| Backend | **Render** | env vars in dashboard; `trust proxy` enabled for HTTPS |
| Database | **Neon** | `DATABASE_URL` with SSL |

Pushing to `main` triggers the Netlify and Render deploys.

---

## 📝 License

MIT — see [LICENSE](LICENSE).
