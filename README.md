# HR Employee Management System

Full-stack HR management application with employee onboarding, document management, payroll, and an admin dashboard.

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | Next.js 16, React 19, Tailwind CSS v4 |
| Backend | NestJS 11, TypeORM, JWT auth |
| Database | PostgreSQL (Neon or local) |
| API Docs | Swagger at `/api/docs` |

## Prerequisites

- Node.js 20+
- PostgreSQL database (local or [Neon](https://neon.tech))
- npm

## Project Structure

```
HR-System/
├── backend/          # NestJS REST API (port 5000)
├── frontend/         # Next.js app (port 3000)
└── README.md
```

## Quick Start

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-secure-secret
FRONTEND_URL=http://localhost:3000
PORT=5000
```

Run database migrations and start the API:

```bash
npm run migration:run
npm run seed:admin
npm run start:dev
```

- API: http://localhost:5000
- Swagger: http://localhost:5000/api/docs

**Default admin account** (after `seed:admin`):

| Field | Value |
|-------|-------|
| Email | `admin@hrsystem.com` |
| Password | `Admin@123456` |

Migrations run automatically on app start (`migrationsRun: true`). For manual control:

```bash
npm run migration:show    # list migration status
npm run migration:run     # apply pending migrations
npm run migration:revert  # revert last migration
```

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the dev server:

```bash
npm run dev
```

Open http://localhost:3000 and log in with the admin account.

## Features

### Authentication
- Register, login, logout
- JWT-protected routes
- Role-based access (`admin` / `employee`)

### Modules
- **Departments** — full CRUD
- **Positions** — full CRUD (linked to departments)
- **Employees** — onboarding CRUD + document upload/list/download/delete (PDF, JPG, PNG; max 5 MB)
- **Payroll** — CRUD with auto-calculated net salary and payment status (`PENDING`, `PAID`, `FAILED`)
- **Dashboard** — live stats: totals, monthly payroll, recent employees, pending payrolls

### Frontend Architecture
- Reusable UI components (`Button`, `Input`, `Select`, `Table`, `Modal`, `Card`, `StatusBadge`, `FileUpload`)
- Layout components (`Navbar`, `Sidebar`, `DashboardLayout`, `AuthGuard`)
- Theme tokens in `frontend/tailwind.config.ts` (no inline CSS)
- API helpers in `frontend/src/lib/`

## API Overview

| Module | Base Path |
|--------|-----------|
| Auth | `/auth` |
| Departments | `/departments` |
| Positions | `/positions` |
| Employees | `/employees` |
| Payrolls | `/payrolls` |
| Dashboard | `/dashboard` |

Protected routes require `Authorization: Bearer <token>` header. Use Swagger **Authorize** button to test with a token from `/auth/login`.

## Production Build

```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
npm run start
```

## Acceptance Criteria Checklist

- [x] Login and register work correctly
- [x] JWT authentication protects private routes
- [x] Departments CRUD works
- [x] Positions CRUD works
- [x] Employee onboarding CRUD works
- [x] Employee document upload, list, download, and delete work
- [x] Payroll CRUD works
- [x] Dashboard displays real data from APIs
- [x] Frontend uses reusable components
- [x] No inline CSS is used
- [x] Tailwind theme values in `tailwind.config.ts`
- [x] Components separated into proper files
- [x] PostgreSQL with TypeORM migrations
- [x] Swagger API documentation at `/api/docs`
- [x] README explains how to run frontend and backend
