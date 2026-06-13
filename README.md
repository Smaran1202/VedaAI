# VedaAI - AI Assessment Platform

VedaAI is an AI-powered assessment and teaching assistant for teachers. It provides a teacher assessment workspace for creating assignments, generating structured question papers from prompts or uploaded material, tracking generation status in real time, and exporting polished exam papers as PDFs.

The current product scope focuses on assignment creation and AI question paper generation. The codebase is organized as a SaaS foundation for future Auth, RAG, Student Portal, AI Grading, and Analytics phases.

## Features

- Teacher assignment dashboard with search, status filters, view, regenerate, PDF export, and delete actions.
- Assignment creation form with PDF, TXT, JPG, JPEG, and PNG upload support.
- Question type distribution with counts, marks, and validation.
- AI question generation with sectioned output, difficulty labels, marks, MCQ options, and answer keys.
- Structured parsing and normalization so raw LLM responses are never rendered directly.
- MongoDB persistence for assignments and generated papers.
- Redis and BullMQ queue support for background generation jobs.
- Socket.IO status updates with frontend polling fallback for queued jobs.
- Puppeteer PDF export with exam-paper formatting.
- Development fallback storage when MongoDB is unavailable locally.

## Architecture

```text
Teacher UI
  -> Next.js frontend
  -> Express API
  -> Zod validation
  -> MongoDB assignment record
  -> BullMQ job in Redis
  -> Worker generates paper with Gemini
  -> MongoDB generated paper update
  -> Socket.IO event and polling fallback
  -> Structured exam paper UI and PDF export
```

When Redis is not configured, the backend can run generation inline for local development. When MongoDB is unavailable in development, the backend uses in-memory fallback storage so frontend workflows remain testable.

## Tech Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, Zustand, React Hook Form, Zod, Socket.IO client, Axios, Lucide React
- Backend: Node.js, Express, TypeScript, MongoDB, Mongoose, Multer, Zod, Socket.IO
- Jobs and cache: Redis, BullMQ
- AI: Gemini API with structured prompt and parsing pipeline
- Document processing: PDF text extraction, TXT ingestion, image OCR
- Export: Puppeteer PDF generation

## Local Setup

Install dependencies from the repository root:

```bash
npm install
```

Create environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

## Environment Variables

Backend:

```env
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=
MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1
REDIS_URL=
GEMINI_API_KEY=
```

Frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Never commit real `.env` or `.env.local` files.

## Running Frontend

```bash
npm run dev --workspace frontend
```

Open:

```text
http://localhost:3000/assignments
```

## Running Backend

```bash
npm run dev --workspace backend
```

Health check:

```text
http://localhost:5000/health
```

## Running Worker

```bash
npm run worker --workspace backend
```

The worker processes BullMQ jobs from Redis. If Redis is not configured, local generation falls back to the API process.

## Build And Quality Checks

```bash
npm run build --workspace frontend
npm run build --workspace backend
npm run typecheck --workspace backend
```

Root commands:

```bash
npm run build
npm run typecheck
```

## Deployment Guide

Recommended deployment:

- Frontend: Vercel
- Backend API: Render, Railway, or another Node service
- Worker: Railway background service, Render worker, or another long-running Node process
- MongoDB: MongoDB Atlas
- Redis: Upstash or managed Redis provider

Backend API build command:

```bash
npm install && npm run build --workspace backend
```

Backend API start command:

```bash
npm run start --workspace backend
```

Worker build command:

```bash
npm install && npm run build --workspace backend
```

Worker start command:

```bash
npm run worker:start --workspace backend
```

Frontend build command from the `frontend` root:

```bash
npm run build
```

Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL` to the deployed backend URL. Set backend `CLIENT_URL` to the deployed frontend URL.

## API Overview

- `GET /health`
- `POST /api/assignments`
- `GET /api/assignments`
- `GET /api/assignments/:id`
- `DELETE /api/assignments/:id`
- `POST /api/assignments/:id/regenerate`
- `GET /api/assignments/:id/pdf`

## Current Limitations

- Authentication and role-based access are not implemented yet.
- Generated papers are scoped to assignment records, not teacher accounts.
- RAG retrieval is not implemented; uploaded material is extracted and placed into the generation prompt.
- Worker Socket.IO events do not cross process boundaries directly, so the frontend uses polling fallback for queued jobs.
- Automated tests are not included yet.
- Production observability, audit logs, and billing are not implemented.

## Roadmap

- Phase 1: Auth + Roles
- Phase 2: Document Upload Pipeline
- Phase 3: RAG Question Generation
- Phase 4: Assessment Intelligence
- Phase 5: Student Attempt Flow
- Phase 6: AI Grading
- Phase 7: Analytics
- Phase 8: Production Hardening
