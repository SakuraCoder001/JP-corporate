# JP Corporate — Dynamic IT Company Website 

A full-stack, CMS-driven corporate website for a Japanese IT company, with a chatbot (Groq), RAG knowledge base, real-time visitor analytics, and a complete admin dashboard.

| Layer | Tech |
| --- | --- |
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Backend | Nest.js 10, Prisma, Socket.io |
| Database | Neon (PostgreSQL) + `pgvector` |
| RAG service | Python FastAPI + `sentence-transformers` |
| Chatbot | Groq (free, OpenAI-compatible API) |
| Fonts | Noto Sans JP (text) + Montserrat (numbers) |

The public site is **fully dynamic** — every section (Hero, About, Services, Portfolio, Testimonials, News, Team, Contact) is populated from data managed in the admin panel at `/admin`.

## Features

- **Admin CMS** at `/admin` (JWT login) to add / edit / delete all site content.
- **Customer Testimonials, Portfolio, News/Updates** sections (plus Services & Team).
- **Visitor History** log: IP, city/country (via `geoip-lite`), page views and clicks, updated in real time. Email shows `N/A` (no Gmail capture).
- **Live chat monitoring**: every visitor↔chatbot conversation is streamed to the admin in real time via Socket.io.
- **RAG knowledge base**: paste documents in the admin; the Python service embeds them into pgvector and the chatbot answers from them.
- **Groq chatbot** widget on the public site.

## Architecture

```
frontend/   Next.js  (http://localhost:3000)
backend/    Nest.js  (http://localhost:4000/api  + Socket.io)
rag-service/ FastAPI (http://localhost:8000)
                 └── all share one Neon Postgres DB (pgvector)
```

## Prerequisites

- Node.js 20+ and npm 10+
- Python 3.11+
- A free **Neon** Postgres database — https://console.neon.tech
- A free **Groq** API key — https://console.groq.com

## Setup

### 1. Environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
cp .env.example backend/.env
cp .env.example rag-service/.env
```

At minimum set `DATABASE_URL` (Neon) and `GROQ_API_KEY` (Groq) in `backend/.env`, and `DATABASE_URL` in `rag-service/.env`.

### 2. Install dependencies

```bash
npm install                 # installs frontend + backend (npm workspaces)
npm run install:rag         # installs the Python RAG service deps
```

> The first RAG run downloads the `all-MiniLM-L6-v2` embedding model (~90 MB).

### 3. Database

```bash
npm run db:generate         # generate Prisma client
npm run db:push             # create tables in Neon (or: npm run db:migrate)
npm run db:seed             # create admin + sample content + pgvector table
```

**Troubleshooting `P1001: Can't reach database server`**

- In the [Neon console](https://console.neon.tech), confirm the project is **Active** (free tier projects auto-suspend when idle).
- Copy a fresh connection string from Neon → **Connect** (pooled URL is fine).
- On Windows, omit `channel_binding=require` from `DATABASE_URL` if Prisma cannot connect.
- Ensure outbound TCP **5432** is allowed (some corporate networks block it).

The seed prints the admin credentials (defaults: `admin@jp-corporate.local` / `admin1234`, configurable via env).

### 4. Run everything

```bash
npm run dev                 # starts backend, frontend, and rag-service together
```

- Website: http://localhost:3000 (home = hero only; other sections have their own URLs)
- `/about`, `/services`, `/portfolio`, `/testimonials`, `/news`, `/team`, `/contact`
- Admin: http://localhost:3000/admin
- API: http://localhost:4000/api
- RAG: http://localhost:8000/health

You can also run services individually: `npm run dev:backend`, `npm run dev:frontend`, `npm run dev:rag`.

### LAN access (other devices on your network)

With `CORS_ALLOW_LAN=true` and `BACKEND_HOST=0.0.0.0`, open the site from another device:

`http://<your-computer-ip>:3000` — **you must include port 3000**

Example: `http://103.179.45.76:3000` (not `http://103.179.45.76` alone — port 80 is not the Next.js dev server and often returns **403** from another service).

The frontend automatically calls the API at `http://<same-ip>:4000` (no need to change env when using LAN IP).

Ensure Windows Firewall allows inbound TCP on ports **3000** and **4000** (PowerShell as Administrator):

```powershell
New-NetFirewallRule -DisplayName "JP Corporate 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "JP Corporate 4000" -Direction Inbound -LocalPort 4000 -Protocol TCP -Action Allow
```

If you still see **403**, restart dev after changing config: `npm run dev`, then open `http://103.179.45.76:3000` in the browser.

If the URL grows like `/103.179.45.76:3000/103.179.45.76:3000/...` and shows **404**, that is a dev redirect loop (now fixed via `allowedDevOrigins` + middleware). Clear the address bar and open exactly `http://103.179.45.76:3000/` once, then restart `npm run dev`.

### RAG / chatbot knowledge

The chatbot learns company facts (including CEO) from CMS content indexed into pgvector:

```bash
npm run rag:sync   # with rag-service running
```

Or in Admin → **ナレッジ (RAG)** → **CMSから再同期**. The backend also syncs ~8s after startup when all services are running.

## Notes

- The app builds and starts without secrets, but chat needs `GROQ_API_KEY` and all data features need `DATABASE_URL`.
- `pgvector` is pre-installed on Neon; the seed/RAG service run `CREATE EXTENSION IF NOT EXISTS vector` automatically.
- Visitor geolocation uses the offline `geoip-lite` database, so localhost IPs resolve to `Unknown` during local dev — deploy behind a real IP to see cities.

## Project structure

```
backend/
  prisma/schema.prisma        # all models
  prisma/seed.ts              # admin + demo content
  src/
    auth/                     # JWT login + guard
    content/                  # CMS CRUD (public read + admin write)
    analytics/                # visitor sessions + events (+ geo)
    chat/                     # Groq chat + persistence
    rag/                      # proxy to Python RAG service
    events/                   # Socket.io gateway
frontend/
  src/app/page.tsx            # dynamic public site
  src/app/admin/              # admin dashboard
  src/components/             # sections, chatbot, tracking, admin panels
rag-service/
  app/main.py                 # FastAPI ingest/query/delete
  app/embeddings.py           # sentence-transformers
  app/db.py                   # pgvector access
```
