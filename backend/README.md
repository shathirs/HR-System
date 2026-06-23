# HR Management API (Backend)

NestJS REST API for the HR Employee Management System.

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, FRONTEND_URL
npm run migration:run
npm run seed:admin
npm run start:dev
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Start with hot reload (port 5000) |
| `npm run migration:run` | Apply database migrations |
| `npm run migration:show` | Show migration status |
| `npm run seed:admin` | Create/update default admin user |

## API Documentation

Swagger UI: http://localhost:5000/api/docs

## Environment Variables

See `.env.example` for required variables.
