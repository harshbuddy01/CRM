# TravelCRM — Enterprise Lead Management System

Welcome to the **TravelCRM** project — a full-stack, enterprise-grade CRM built for travel agencies to manage leads, proposals, payments, tours, and team operations.

---

## 🏗 Project Architecture

This is a **Monorepo-lite** structure designed for high performance and deployment reliability.

### **1. Frontend (Next.js 14)**
- **Root Directory (`/`)**: Powered by **Next.js 14 (App Router)**
- **`/src`**: All UI components, pages, hooks, and business logic
- **`/public`**: Static assets (images, icons)
- **Auth**: Zustand store (`useAuthStore`) + JWT access token cookie
- **API Client**: Axios instance at `@/lib/api` pointing to the GCP backend

### **2. Backend (Express.js API)**
- **`/backend`**: Dedicated Express.js API workspace
- **`src/`**: Controllers, routes, services, middlewares, cron jobs
- **`prisma/`**: Prisma ORM — schema + migrations for Supabase PostgreSQL

---

## 🌐 Live Deployment Infrastructure

| Service         | Platform                        | URL / Endpoint                                      |
|-----------------|---------------------------------|------------------------------------------------------|
| **Frontend**    | Hostinger Node.js Web App       | `https://crm.imagicaholidays.com`                   |
| **Backend API** | Google Cloud Platform (GCP) VM  | `https://api.imagicaholidays.com`                   |
| **Database**    | Supabase PostgreSQL             | `aws-1-ap-south-1.pooler.supabase.com:5432`         |
| **Media/Files** | Cloudflare R2                   | `https://media.imagicaholidays.com`                 |
| **DB Backups**  | MinIO (Railway)                 | `https://bucket-production-901c.up.railway.app`     |
| **Search**      | Meilisearch (Railway)           | `https://getmeilimeilisearchv190-production-7566.up.railway.app` |
| **Email**       | Brevo SMTP                      | `smtp-relay.brevo.com:587`                          |
| **Process Mgr** | Docker Compose on GCP VM        | `/home/harshanand/app/deployment/gcp/`              |

---

## ⚙️ Key Features

- **Lead Management** — Full query lifecycle from intake → assignment → proposal → payment → tour
- **Team Management (Administration)** — User roles, permissions (RBAC), and team operations
- **Live Activity Log** — Real-time, searchable audit trail of all team actions (7-day rolling retention)
- **Proposals** — Rich PDF and web proposal generation with Canva template support
- **Finance** — Invoice generation, payment tracking, Razorpay integration
- **Tour Operations** — Tour scheduling, vouchers, booking services
- **Notifications** — In-app notification system with priority levels
- **CMS** — Website content management for journeys, destinations, trending packages
- **Pipeline** — Kanban-style lead pipeline with customizable status colours

---

## 🔁 Cron Jobs (Run on GCP Backend — `src/cron.js`)

| Schedule       | Task                                                    |
|----------------|---------------------------------------------------------|
| Daily 9:00 AM  | Follow-up escalation notifications                      |
| Daily 9:00 AM  | Tour starting-in-2-days reminder notifications          |
| Daily Midnight | Expired user session cleanup                            |
| Daily Midnight | **Activity log purge** — deletes logs older than 7 days |

---

## 👥 Administration — Activity Log

Admins can view the **Live Activity Log** under the **Administration** page (`/users` → "Activity Log" tab):
- Auto-refreshes every **30 seconds** with a live pulse indicator
- **Search** by team member name, action type, or record ID
- **Filter** by team member, module (Leads, Proposals, Payments, Tours, etc.)
- Shows: who did what, on which record, at what time, from which IP address
- **7-day rolling retention** — logs older than 7 days are automatically purged every midnight to keep the Supabase database lean

---

## 🛠 Developing Locally

### Frontend
```bash
# From root directory
npm install
npm run dev
# Runs on http://localhost:3000
```

### Backend
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:3001
```

### Environment Variables
- **Frontend**: Copy `.env.local.example` → `.env.local`, set `NEXT_PUBLIC_API_URL`
- **Backend**: Copy `backend/.env.template` → `backend/.env`, fill in all values

---

## 🚀 Deployment

### Frontend → Hostinger
Push to `main` branch on GitHub. Hostinger auto-deploys from the `harshbuddy01/CRM` repo.
- Framework: Next.js
- Root directory: `/`
- Key env var: `NEXT_PUBLIC_API_URL=https://api.imagicaholidays.com/api/v1`

### Backend → GCP
SSH into GCP VM and pull latest code:
```bash
ssh harshanand@8.231.65.6
cd /home/harshanand/app
git pull origin main
docker compose -f deployment/gcp/docker-compose.yml up -d --build
```

---

## 🔐 Security Notes

- JWT access tokens expire in **15 minutes**; refresh tokens in **7 days**
- Login rate-limited to **10 attempts per 5 minutes**
- Supabase network access should be restricted to GCP static IP (`8.231.65.6`)
- Activity logs are admin-only (`users.manage` permission required)

---

*Built for Imagica Holidays. Last updated: July 2026.*
