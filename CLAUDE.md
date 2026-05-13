# ShipFast — Claude Code Context

## What this project is
ShipFast is an AI-native development service SaaS. Clients submit their legacy codebase,
and an AI pipeline (powered by Claude API) rebuilds it in 30 days: full test coverage,
design system, component library, Storybook docs, and analytics parity.

This file is your single source of truth. Read it before touching anything.
Full architecture decisions are in docs/architecture.md — do not re-derive them.

---

## Stack
| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Nuxt 3 (Vue 3, App Router) — Vercel |
| Backend    | Go 1.23 — Fly.io                    |
| Database   | PostgreSQL via Supabase             |
| Auth       | Supabase Auth (JWT)                 |
| Storage    | Supabase Storage                    |
| Realtime   | Supabase Realtime                   |
| Queue      | River (Postgres-backed job queue)   |
| Cache      | Upstash Redis (cache + rate limit)  |
| Payments   | Stripe                              |
| Email      | Resend                              |
| Errors     | Sentry                              |
| Analytics  | PostHog                             |
| CI/CD      | GitHub Actions                      |

---

## Directory structure
```
shipfast/
├── CLAUDE.md                  ← you are here
├── Makefile                   ← all runnable commands
├── .env.example               ← every required env var documented
├── docker-compose.yml         ← local Postgres + Redis
│
├── cmd/
│   ├── api/main.go            ← HTTP server entrypoint
│   └── worker/main.go         ← River worker entrypoint
│
├── internal/
│   ├── auth/                  ← auth middleware, JWT validation
│   ├── projects/              ← project CRUD, status management
│   ├── billing/               ← Stripe integration
│   ├── pipeline/              ← AI pipeline job implementations
│   ├── storage/               ← Supabase Storage client
│   ├── notify/                ← Resend email + in-app notifications
│   └── server/                ← chi router setup, middleware wiring
│
├── db/
│   ├── migrations/            ← sequential SQL migration files
│   └── queries/               ← sqlc .sql query files → generated Go
│
├── web/                       ← Nuxt 3 app
│   ├── pages/
│   ├── components/
│   ├── composables/
│   └── stores/
│
├── docs/                      ← architecture decisions (read before each task)
├── tasks/                     ← one task file per Claude Code session
└── conventions/               ← code style rules per layer
```

---

## Commands — always use these to verify your work
```bash
make dev          # start Go API + Nuxt locally (requires docker-compose up)
make test         # go test ./... + vitest run
make test-go      # go test ./... -v -race
make test-web     # cd web && npx vitest run
make build        # go build ./cmd/api ./cmd/worker
make migrate      # apply pending migrations via goose
make sqlc         # regenerate Go code from db/queries/*.sql
make lint         # golangci-lint + eslint
make docker-up    # start local Postgres + Redis
```

---

## DO NOT — non-negotiable rules
- **No ORM.** Use sqlc + raw SQL only. See conventions/sql.md.
- **No new Go dependencies** without asking first. Check if stdlib covers it.
- **No touching files that already pass tests** unless the task explicitly says so.
- **No global mutable state** in Go packages. Pass dependencies explicitly.
- **No secrets in web/.** All API calls go through Go backend.
- **No `any` type in Go** without a comment explaining why.
- **No direct Supabase DB calls from Nuxt.** All data flows through Go API, except Realtime subscriptions.
- **Do not run `go mod tidy` without checking** what it removes.

---

## Conventions (read the relevant file before each task)
- Go patterns → conventions/go.md
- Vue/Nuxt patterns → conventions/vue.md
- SQL patterns → conventions/sql.md
- Testing patterns → conventions/testing.md

---

## Key architecture decisions (don't re-derive)
1. **River over Celery** — Go-native, Postgres-backed, no extra broker service.
2. **sqlc over GORM** — type-safe, explicit, no magic, easier to debug.
3. **Supabase Auth over Clerk** — already in stack, free tier, good enough for now.
4. **Supabase Realtime for job progress** — no custom WebSocket server needed.
5. **Modular monolith** — no microservices until justified by real load.
6. **Row Level Security on all tables** — multi-tenancy enforced at DB level.
7. Full rationale in docs/architecture.md.

---

## Environment variables (see .env.example for full list)
```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
ANTHROPIC_API_KEY
RESEND_API_KEY
SENTRY_DSN
UPSTASH_REDIS_URL
UPSTASH_REDIS_TOKEN
DATABASE_URL
PORT (default: 8080)
```

---

## Multi-tenancy model
Every table has `org_id uuid NOT NULL` (the tenant identifier).
RLS policies on every table enforce: `org_id = auth.jwt() ->> 'org_id'`.
The Go service role bypasses RLS for worker jobs only.
Never query across tenants. Never skip `org_id` in inserts.

---

## Current project status
Track what is done vs pending in tasks/STATUS.md.
Check it before starting any session so you don't redo completed work.
