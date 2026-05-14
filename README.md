# TradeConnect Service Request Board

A small full-stack assessment project built with Next.js, Express, and MongoDB.

## What it does

- Lists all job requests on the home page with a category filter
- Supports keyword search across title and description
- Creates a new job request through a form
- Shows a job detail page where status can be changed or the job can be deleted
- Uses JWT login for creating and deleting jobs
- Uses a separate Express API backed by MongoDB and Mongoose

## Project Structure

- `frontend` - Next.js App Router frontend
- `backend` - Express API and MongoDB models

## Setup

1. Install dependencies from the repo root:

```bash
npm install
```

2. Create `backend/.env` from the example file and set your MongoDB connection string.

3. Start both apps:

```bash
npm run dev
```

The frontend runs on `http://localhost:3000` and the backend on `http://localhost:4000` by default.

## Environment Variables

### backend/.env

- `MONGODB_URI` - MongoDB connection string
- `PORT` - API port, defaults to `4000`
- `FRONTEND_URL` - Allowed frontend origin, defaults to `http://localhost:3000`
- `JWT_SECRET` - Secret used to sign login tokens, defaults to a demo value
- `USER_EMAIL` - Demo login email, defaults to `demo@tradeconnect.com`
- `USER_PASSWORD` - Demo login password, defaults to `password123`

### frontend/.env.local

- `NEXT_PUBLIC_API_BASE_URL` - Backend base URL, defaults to `http://localhost:4000`

## API

- `POST /api/auth/login` - return a JWT for the demo user
- `GET /api/jobs` - list jobs, optionally filter with `?category=Plumbing&status=Open&q=tap`
- `GET /api/jobs/:id` - get one job
- `POST /api/jobs` - create a job, requires `Authorization: Bearer <token>`
- `PATCH /api/jobs/:id` - update status only
- `DELETE /api/jobs/:id` - delete a job, requires `Authorization: Bearer <token>`

## Login

Open `/login` in the frontend and use the demo credentials below unless you changed the env values:

- Email: `demo@tradeconnect.com`
- Password: `password123`

## Seed Data

Run the backend seed script after setting `MONGODB_URI`:

```bash
npm run seed
```

It inserts five sample job requests.

## Tests

Run backend endpoint tests with:

```bash
npm test --workspace backend
```
