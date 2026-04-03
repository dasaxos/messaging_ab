# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Messaging A/B Predictor: a self-serve web tool where B2B SaaS PMMs submit two competing positioning messages and get a prediction of which resonates better, powered by MiroFish's multi-agent swarm simulation. Users fill a form, receive an email when results are ready (~20 min), and view an interactive comparison dashboard.

The project wraps MiroFish (in the `MiroFish/` subdirectory) with a new product layer. MiroFish is an existing open-source simulation engine — do not modify its code unless fixing integration bugs.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), Tailwind CSS, Recharts
- **Worker**: Node.js with BullMQ (Redis-backed job queue)
- **Simulation engine**: MiroFish (Flask backend on port 5001)
- **Database**: SQLite via Drizzle ORM
- **Email**: Resend
- **Hosting target**: Railway (backend + MiroFish + Redis) + Vercel (frontend)

## Target Repo Structure

```
packages/
├── web/              # Next.js frontend
│   ├── app/          # App Router pages (/, /status/[jobId], /results/[jobId])
│   ├── components/   # InputForm, StatusTracker, results/ (Dashboard, charts)
│   └── lib/          # db.ts, schema.ts, seed-doc-template.ts
├── worker/           # BullMQ job processor
│   ├── index.ts
│   ├── mirofish-client.ts    # HTTP client for MiroFish API
│   ├── orchestrator.ts       # Full A/B pipeline
│   ├── report-parser.ts      # LLM-based metric extraction from reports
│   └── email.ts
└── shared/           # Shared TypeScript types
    └── types.ts
mirofish/             # MiroFish engine (submodule or clone)
```

## Architecture

**Three-page user flow**: Form submission (`/`) -> Status polling (`/status/[jobId]`) -> Results dashboard (`/results/[jobId]`).

**Pipeline**: Form input -> seed document generation -> MiroFish graph build -> run simulation A -> generate report A -> run simulation B (reuses same graph) -> generate report B -> LLM-based report parsing -> A/B comparison -> email notification.

The worker orchestrates MiroFish via its HTTP API (polling long-running operations). BullMQ concurrency = 1; simulations run sequentially. Both simulations share a single knowledge graph for fair comparison.

**Results framing**: All metrics must be RELATIVE (multipliers, raw counts, comparative deltas) — never absolute percentages. The 25-agent simulation predicts which message performs better, not exact conversion rates.

## Design System

Design reference files live in `design-reference/`. Read these before implementing any UI:

- `obsidian_graphite/DESIGN.md` — Design system tokens: "The Technical Curator" aesthetic with deep charcoal surfaces (#131314 base), blue primary (#adc6ff) for Message A, rose (#ffb0cd) for Message B. No-line rule (tonal shifts instead of borders), glassmorphism for floating elements, Inter + Berkeley Mono typography.
- `messaging_a_b_predictor/code.html` — Landing page + form mockup
- `simulation_status_messaging_a_b_predictor/code.html` — Status page mockup
- `simulation_results_messaging_a_b_predictor/code.html` — Results dashboard mockup

Each folder also has a `screen.png` screenshot for visual reference. When spec and design conflict: spec wins for behavior, design wins for appearance.

## MiroFish Integration

MiroFish has its own CLAUDE.md at `MiroFish/CLAUDE.md` — refer to it for MiroFish-specific details.

Before building `mirofish-client.ts`, verify actual Flask route paths:
```bash
grep -r "@.*\.route\|@.*\.add_url_rule" MiroFish/backend/ --include="*.py"
```

Key MiroFish config for this project: 25 agents x 8 rounds (reduced from default 44x10 for speed). Use `platforms: ['twitter']` (single platform is sufficient for messaging comparison).

## Commands

MiroFish development (from `MiroFish/` directory):
```bash
npm run setup:all    # Install all deps (root npm + frontend npm + backend uv)
npm run dev          # Run backend (Flask :5001) + frontend (Vite :3000) concurrently
npm run backend      # Flask only
cd backend && uv run pytest  # Backend tests
```

## Environment Variables

Root `.env` (for the A/B Predictor app):
- `MIROFISH_URL` — MiroFish API base (default: http://localhost:5001)
- `REDIS_URL` — Redis for BullMQ
- `RESEND_API_KEY`, `FROM_EMAIL` — Email delivery
- `OPENAI_API_KEY` — For GPT-4o-mini report parsing
- `NEXT_PUBLIC_APP_URL`, `DATABASE_PATH`

MiroFish's own `.env` (inside `MiroFish/`):
- `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL_NAME` — OpenAI-compatible LLM
- `ZEP_API_KEY` — Zep Cloud for knowledge graph memory

## Implementation Notes

- The full specification is in `PROJECT_SPEC.md` — it contains form fields, validation rules, DB schema, pipeline pseudocode, API client shapes, report parsing logic, and dashboard component specs.
- Agent population uses a realistic 6-tier distribution (9 non-responders, 5 skeptics, 4 passive observers, 3 mild interest, 2 active evaluators, 2 champions) to avoid unrealistic herd behavior.
- The seed document generator embeds 25 detailed persona descriptions that MiroFish uses to generate agent profiles.
- Report parsing uses a secondary LLM call (GPT-4o-mini) to extract structured `ParsedResults` from MiroFish's markdown reports.
- Error recovery: retry each pipeline stage up to 2 times with exponential backoff.
- Footer must include "Built by Hayk Kocharyan" (LinkedIn link) and "Powered by MiroFish" (GitHub link).
