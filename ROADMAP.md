# VedaAI Roadmap

VedaAI is moving from an assessment generation prototype into a long-term AI SaaS platform for teachers, students, and school teams.

## Phase 1: Auth + Roles

- Teacher sign-in and session management
- Role model for teachers, students, and admins
- Account-scoped assignments and generated papers

## Phase 2: Document Upload Pipeline

- Robust document ingestion for PDF, TXT, images, and future DOCX
- File metadata, extraction state, and retry handling
- Cleaner separation between uploaded source material and assignments

## Phase 3: RAG Question Generation

- Chunking and embeddings for uploaded material
- Retrieval-backed question generation
- Source-grounded answer keys and explanations

## Phase 4: Assessment Intelligence

- Blueprint suggestions by class, subject, marks, and difficulty
- Quality checks for coverage, duplication, difficulty balance, and bloom level
- Teacher review tools for editing generated papers

## Phase 5: Student Attempt Flow

- Student-facing assessment pages
- Timed attempts and draft autosave
- Submission records tied to assignments

## Phase 6: AI Grading

- Rubric-based grading
- Short answer evaluation
- Teacher override and feedback workflow

## Phase 7: Analytics

- Assignment performance dashboard
- Class and student-level insights
- Topic weakness and remediation suggestions

## Phase 8: Production Hardening

- Observability and structured logging
- Automated tests and CI checks
- Rate limits, audit logs, and security review
- Deployment runbooks and incident recovery
