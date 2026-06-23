# HR Management Frontend

Next.js frontend for the HR Employee Management System.

## Setup

```bash
npm install
```

Create `.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

```bash
npm run dev
```

Open http://localhost:3000

## Structure

- `src/app/` — pages (login, register, dashboard, departments, positions, employees, payroll)
- `src/components/ui/` — reusable UI components
- `src/components/layout/` — layout and auth guard
- `src/lib/` — API client helpers
- `src/types/` — TypeScript interfaces

Theme tokens are defined in `tailwind.config.ts`.
