# VedaAI AI Assessment Creator

VedaAI is a full-stack AI assessment creator for teachers. It lets a teacher create an assignment, upload reference material, define question type distribution, generate a structured question paper with Gemini, track generation progress in real time, and export the finished paper as a formatted PDF.

## Architecture Flow

1. Teacher creates an assignment in the Next.js dashboard.
2. Frontend submits assignment details to the Express API.
3. Backend validates input with Zod and stores it in MongoDB. If MongoDB is unavailable locally, the app uses an in-memory fallback repository so development is not blocked.
4. Assignment generation is queued with BullMQ and Redis.
5. If a file is uploaded, the backend extracts PDF text or image OCR text, cleans it, trims oversized content, and stores it with the assignment.
6. Worker processes the job, calls Gemini, validates and de-duplicates the generated paper, stores the result, and emits Socket.IO events.
7. When uploaded content exists, Gemini is instructed to generate questions only from the extracted material. Without an upload, it uses the subject/class prompt.
8. Frontend listens for queued, processing, completed, and failed events and updates the UI without refresh.
9. Frontend uses WebSocket updates with polling fallback for queued jobs.
10. Teacher downloads the completed exam paper through the Puppeteer PDF export route.

## Tech Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, Zustand, React Hook Form, Zod, Socket.IO client, Axios, Lucide React
- Backend: Node.js, Express, TypeScript, MongoDB, Mongoose, Zod, Multer, Morgan, CORS, dotenv
- AI and jobs: Gemini API, Redis, BullMQ, Socket.IO
- Material processing: PDF text extraction and image OCR
- Export: Puppeteer PDF generation

## Environment Variables

Create these files from the examples:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Backend variables:

```env
PORT=5000
MONGODB_URI=
CLIENT_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
REDIS_URL=
GEMINI_API_KEY=
```

Frontend variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Never commit real `.env` or `.env.local` files.

## Local Setup

Install dependencies from the repository root:

```bash
npm install
```

Run the backend API:

```bash
npm run dev --workspace backend
```

Run the BullMQ worker in a second terminal:

```bash
npm run worker --workspace backend
```

Run the frontend in a third terminal:

```bash
npm run dev --workspace frontend
```

Open:

```text
http://localhost:3000/assignments
```

## Build Commands

```bash
npm run build --workspace backend
npm run build --workspace frontend
```

Or build both workspaces:

```bash
npm run build
```

## API Overview

- `GET /health`
- `POST /api/assignments`
- `GET /api/assignments`
- `GET /api/assignments/:id`
- `DELETE /api/assignments/:id`
- `POST /api/assignments/:id/regenerate`
- `GET /api/assignments/:id/pdf`

## AI Generation Quality

The generation pipeline is class-aware and subject-aware. Gemini is prompted to create unique, grade-appropriate questions, subject-relevant numerical problems, topic-specific diagram prompts, mixed difficulty, and matching answer keys. The backend also normalizes generated output and removes duplicate question text before saving or exporting.

When a PDF or image is uploaded, VedaAI extracts readable content first and prompts Gemini to generate questions only from that uploaded material. If extraction fails, the API returns `Could not read uploaded content` instead of silently generating unrelated questions.

If Gemini is unavailable, the fallback generator still produces realistic class-level content instead of placeholder questions. MongoDB downtime also does not block local development because assignment APIs and generation continue with in-memory fallback storage.

## Security and Reliability

- Zod validates and trims assignment input before persistence.
- Uploads are limited to 10MB and restricted to JPEG, PNG, and PDF files.
- API routes use a shared rate limiter.
- CORS is restricted through `CLIENT_URL`.
- Secrets are read from environment variables only and ignored by Git.

## Verified Interactions

- Sidebar logo and assignment links navigate to implemented routes.
- Unimplemented sidebar and mobile nav items are disabled and labelled as coming soon.
- Assignment create buttons open `/assignments/create`.
- Dashboard search filters assignments through the API.
- Dashboard filter menu filters assignments by generation status.
- Assignment cards and View Assignment actions open the assignment output page.
- Delete Assignment asks for confirmation and removes the card after the API succeeds.
- File upload supports browse and drag/drop for supported files.
- Date picker opens from both input and calendar icon.
- Question type dropdown, add/remove row, and stepper controls update totals.
- Previous returns to the assignment dashboard and Next submits validated form data.
- Output page regenerate queues generation again.
- Output page PDF button downloads the generated paper.
- Mobile header, hamburger menu, floating create button, bottom nav, mobile back buttons, card menus, date picker, generate, regenerate, and PDF actions are wired.

## Deployment Notes

1. Deploy the backend to a Node-capable service with persistent environment variables.
2. Provide production values for `MONGODB_URI`, `REDIS_URL`, `GEMINI_API_KEY`, `CLIENT_URL`, and `BACKEND_URL`.
3. Run the API process with `npm run start --workspace backend` after building.
4. Run the worker as a separate process with `npm run worker --workspace backend` or an equivalent production process manager command.
5. Deploy the frontend to Vercel or another Next.js host.
6. Set `NEXT_PUBLIC_API_URL` to the deployed backend URL.
7. Ensure the deployment environment supports Puppeteer or provides a compatible Chromium runtime for PDF export.

## Known Limitations

- MongoDB local connection may require proper Atlas IP/DNS configuration.
- WebSocket updates have polling fallback for queued jobs.
- Tests are not included due to assignment timebox.
