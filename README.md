# TravelCRM — Enterprise Lead Management System

Welcome to the **TravelCRM** project! This repository follows a modern, enterprise-grade project structure optimized for **Next.js 14** deployments and **Node.js/Prisma** backends.

---

## 🏗 Project Architecture

This is a **Monorepo-lite** structure designed for high performance and deployment reliability.

### **1. Frontend (Website Core)**
- **Root Directory (`/`)**: The main website is powered by **Next.js 13/14 (App Router)**.
- **`/src`**: Contains all UI components, pages, hooks, and business logic.
- **`/public`**: Static assets (images, icons).
- **`package.json`**: Controls the root deployment. All frontend libraries (Shadcn, Tailwind, TanStack Query) are managed here.

### **2. Backend (API Hub)**
- **`/backend`**: A dedicated workspace for the **Express.js API**.
- **`src/`**: Logic for authentication, lead status transitions, and BullMQ workers.
- **`prisma/`**: Database schema and seeding scripts.

---

## 🚀 Deployment Guide (Hostinger hPanel)

This project is now **auto-detectable** for Hostinger Node.js plans.

### **Phase 1: Cleanup**
1. Log in to your **Hostinger hPanel**.
2. Go to **Websites**.
3. Find your current failed `CRM` website and click the **three dots** (or "Manage").
4. If there is a "Node.js" application already created, click **"Stop"** and then **"Delete"** it. 
   *(Don't worry, your files are safe in GitHub!)*

### **Phase 2: Fresh Setup**
1. In hPanel, go to **Websites -> Create or migrate a website**.
2. Choose **"Node.js Web App"**.
3. Connect your **harshbuddy01/CRM** GitHub repository.
4. **Auto-Detection**: Because the `package.json` is now at the root, Hostinger will automatically select:
   - **Framework**: Next.js
   - **Root directory**: `/` (Leave it as root)
   - **Package Manager**: npm
5. **Add Environment Variables**:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://crm-production-3f6d.up.railway.app/api/v1`
6. Click **Deploy**.

---

## 🛠 Developing Locally
1. **Frontend**: Run `npm install && npm run dev` from the root.
2. **Backend**: Run `cd backend && npm install && npm run dev`.

---

*This project is built for scalability and performance.*
