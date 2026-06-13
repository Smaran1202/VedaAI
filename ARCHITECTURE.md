# VedaAI Architecture

VedaAI is a monorepo with a Next.js frontend and an Express backend. The current platform centers on teacher assignment creation and AI-generated assessment papers.

## Repository Layout

```text
frontend/
  src/app/                 Next.js App Router pages
  src/components/          UI, layout, assignment, and form components
  src/hooks/               Shared frontend hooks
  src/lib/                 Client utilities and environment helpers
  src/services/            API client functions
  src/store/               Zustand stores
  src/types/               Shared frontend types

backend/
  src/config/              Environment, database, Redis
  src/controllers/         HTTP request handlers
  src/routes/              Express route definitions
  src/services/            AI, assignment, PDF, extraction services
  src/repositories/        Data access implementations and fallback storage
  src/models/              Mongoose models
  src/workers/             BullMQ workers
  src/queue/               Queue setup and job types
  src/socket/              Socket.IO integration
  src/middleware/          Express middleware
  src/validators/          Zod request schemas
  src/utils/               Shared backend helpers
  src/types/               Backend type definitions
```

## Assignment Generation Flow

```text
Create Assignment Form
  -> POST /api/assignments
  -> Zod validation
  -> MongoDB assignment record
  -> Redis/BullMQ generation job
  -> Worker fetches assignment
  -> Gemini prompt generation
  -> JSON parse and normalization
  -> Generated paper stored in MongoDB
  -> Frontend updates through WebSocket and polling fallback
```

If Redis is unavailable in development, the API process can run generation inline. If MongoDB is unavailable in development, in-memory fallback storage keeps the UI workflow usable.

## AI Output Contract

The backend prompts the model to return strict JSON with:

- school
- subject
- className
- timeAllowed
- maximumMarks
- instructions
- sections
- questions
- difficulty
- marks
- optional MCQ options
- answerKey

The parser validates the shape, normalizes difficulty, removes duplicates, and falls back to a local generator if parsing fails.

## Realtime Strategy

Socket.IO is used for assignment status events from the API process. Because worker processes may run separately from the API process, the frontend also polls assignment details while a paper is queued or processing.

## Deployment Shape

Recommended production shape:

- Vercel for frontend
- Render or Railway for backend API
- Railway or another worker-capable platform for the BullMQ worker
- MongoDB Atlas for database
- Upstash or managed Redis for queue state
