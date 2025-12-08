# Agents Architecture

This document outlines the design, responsibilities, and interactions of the agents in the uptime monitoring system. The goal is to define a clear blueprint for frontend, backend, validation, UI structure, coding conventions, and project architecture.

---

## 1. Tech Stack Overview

### **Frontend**

* **Framework:** React + TanStack Router
* **Forms:** TanStack Form
* **Validation:** Zod v4
* **Styling:** TailwindCSS
* **UI Components:** shadcn/ui (kept minimal, basic design)
* **File naming:** `snakecase` → `this-component.tsx`
* **Structure:** Aligned with *Bulletproof React* principles

### **Backend**

* **Runtime:** Cloudflare Workers
* **Framework:** Hono
* **Validation:** Zod v4 (shared schemas)
* **Database:** D1
* **Queues / CRON:** Cloudflare Queues + Scheduled Workers
* **Email:** Resend

---

## 2. Folder Structure (Modeled after Bulletproof React)

```
project/
├─ src/
│  ├─ app/
│  │  ├─ router/              # TanStack router definitions
│  │  ├─ providers/           # form provider, theme provider, query provider
│  ├─ features/
│  │  ├─ monitors/
│  │  │  ├─ components/
│  │  │  ├─ forms/
│  │  │  ├─ schema/           # zod v4 schemas
│  │  │  ├─ api/
│  │  │  ├─ hooks/
│  │  │  ├─ pages/
│  │  │  └─ utils/
│  ├─ components/             # shared ui components
│  ├─ lib/                    # shared utilities, zod helpers
│  ├─ types/                  # TypeScript types
│  ├─ styles/                 # tailwind and global css
│  ├─ index.tsx
│
├─ backend/
│  ├─ routes/
│  │  ├─ monitors/
│  │  │  ├─ get.ts              # get single monitor
│  │  │  ├─ get-all.ts          # list monitors
│  │  │  ├─ post.ts             # create monitor
│  │  │  ├─ put.ts              # update monitor
│  │  │  ├─ delete.ts           # delete monitor
│  │  ├─ teams/
│  │  ├─ alerts/
│  ├─ utils/                    # helpers, env, auth, rate limiting
│  ├─ services/                 # business logic, separated from routes
│  ├─ schema/                   # zod validators
│  ├─ workers/                  # CRON + queue workers
│  ├─ src/
│  │  ├─ routes/
│  │  ├─ schema/              # shared zod schemas
│  │  ├─ workers/
│  │  ├─ db/
│  │  └─ utils/
│  └─ index.ts
│
├─ shared/
│  ├─ schema/                 # zod schemas shared FE/BE
│  └─ utils/
│
└─ agents.md
```

---

## 4. Conventions

### **No Comments Rule

* Avoid unnecessary comments ("no comment bullshit").
* Code should be self-explanatory through naming and structure.
* Comments allowed only for complex logic, edge cases, or architectural notes.

### **REST Body & Headers Rule**

* Request/response **body contains only the entity** being created, updated, or returned.
* **Headers carry meta information** (pagination, rate limits, trace IDs, auth context, etc.).
* This keeps the API predictable, clean, and aligned with standard REST patterns.

---

## Backend Structure

The backend should follow a clean, modular structure where each HTTP method is its own file.

Example (Hono + Cloudflare Workers):

```
backend/
├─ src/
│  ├─ routes/
│  │  ├─ monitors/
│  │  │  ├─ get.ts          # get one
│  │  │  ├─ get-all.ts      # list all
│  │  │  ├─ post.ts         # create
│  │  │  ├─ put.ts          # update
│  │  │  ├─ delete.ts       # delete
│  │  │  └─ index.ts        # exports router
│  │  └─ index.ts
│  ├─ utils/                # helpers, shared logic
│  ├─ db/                   # D1 queries, prepared statements
│  ├─ workers/              # cron + queue workers
│  └─ schema/               # backend/shared zod v4
```

Each route file handles **one thing only**, validated with Zod v4.

---

## Mutations

Mutations in this architecture belong **inside each feature**, mirroring the Bulletproof React structure.

### **Frontend (React + TanStack Query)**

* **All data fetching MUST use TanStack Query.**
* **All mutations MUST use TanStack Query mutations.**
* No raw `fetch` calls inside components.
* Each feature (e.g., `monitors`) contains its own `api/` folder with query + mutation hooks.
* Each feature (e.g., `monitors`) contains its own `mutations/` directory.
* Example:

  ```
  src/features/monitors/api/
  ├─ use-create-monitor.ts
  ├─ use-update-monitor.ts
  ├─ use-delete-monitor.ts
  └─ use-toggle-status.ts
  ```
* Mutations:

  * Always call a backend route defined in `backend/src/routes/...`
  * Use Zod v4 to validate both the request body and the response
  * Are colocated with the feature, *never* global

### **Backend (Hono)**

* Mutations map directly to HTTP method files:

  ```
  backend/src/routes/monitors/
  ├── post.ts      # create monitor
  ├── put.ts       # update monitor
  ├── delete.ts    # delete monitor
  ```
* Each mutation file:

  * Validates input with Zod v4
  * Executes a D1 prepared statement
  * Returns an entity-only JSON body
  * Sends meta through headers

---

## 5. Data Flow Conventions

### **No Comments Rule**

* Avoid unnecessary comments ("no comment bullshit").
* Code should be self-explanatory through naming and structure.
* Comments allowed only for complex logic, edge cases, or architectural notes.

### **Naming Rules**

* Components: `snakecase` → `monitor-form.tsx`
* Routes: `monitor-routes.ts`
* Backend: `monitor-handler.ts`
* Schemas: `monitor-schema.ts`

### **Validation Rules**

* All forms must be validated with TanStack Form + Zod
* All backend endpoints must validate:

  * `params`
  * `query`
  * `json body`
  * `response`
* Shared schemas must be the single source of truth

---

## 5. Data Flow

1. **Frontend Form** → TanStack Form + Zod validation
2. **Submit** → Hono API endpoint
3. **Backend validates** request with Zod
4. **DB action** → D1
5. **Backend returns validated response**
6. **Frontend updates state** via React Query / TanStack Query
