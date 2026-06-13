# Contributing To VedaAI

VedaAI is being developed as a production-minded AI assessment platform. Contributions should preserve the current assignment generation flow while moving the codebase toward a maintainable SaaS architecture.

## Local Development

Install dependencies:

```bash
npm install
```

Create local environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Run the app:

```bash
npm run dev
```

Or run services separately:

```bash
npm run dev --workspace frontend
npm run dev --workspace backend
npm run worker --workspace backend
```

## Quality Checks

Before opening a pull request or pushing a release branch:

```bash
npm run build --workspace frontend
npm run build --workspace backend
npm run typecheck --workspace backend
```

## Code Guidelines

- Keep assignment generation, regeneration, PDF export, and dashboard actions working.
- Prefer small, focused changes over broad rewrites.
- Keep raw AI output away from the UI; parse and normalize generated data first.
- Do not commit secrets or local `.env` files.
- Keep user-facing copy product-oriented and teacher-focused.
- Add abstractions only when they reduce repeated logic or clarify product boundaries.

## Branching

Use short descriptive branches, for example:

```text
phase1-auth-foundation
rag-upload-pipeline
analytics-dashboard
```
