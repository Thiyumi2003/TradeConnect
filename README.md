# TradeConnect Service Request Board

A small full-stack assessment project built with Next.js, Express, and MongoDB.

## What it does

- Lists all job requests on the home page with a category filter
- Supports keyword search across title and description
- Creates a new job request through a form with field validation
- Shows a job detail page where status can be changed or the job can be deleted
- Success and error notifications
- Empty state messaging for better UX
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

### frontend/.env.local

- `NEXT_PUBLIC_API_BASE_URL` - Backend base URL, defaults to `http://localhost:4000`

## API

- `GET /api/jobs` - list jobs, optionally filter with `?category=Plumbing&status=Open&q=tap`
- `GET /api/jobs/:id` - get one job
- `POST /api/jobs` - create a job
- `PATCH /api/jobs/:id` - update status only
- `DELETE /api/jobs/:id` - delete a job

## Seed Data

Run the backend seed script to insert sample job requests:

```bash
npm run seed
```

## Tests

Run backend endpoint tests:

```bash
npm test --workspace backend
```

## Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Set environment variable `NEXT_PUBLIC_API_BASE_URL` to your backend URL
5. Deploy

### Backend (Render or Railway)

1. Push code to GitHub
2. Create new Web Service on Render or Railway
3. Connect your repository
4. Set environment variables:
   - `MONGODB_URI` - your MongoDB Atlas connection string
   - `PORT` - `4000`
   - `FRONTEND_URL` - your Vercel frontend URL
5. Deploy
