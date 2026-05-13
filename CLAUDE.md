# Pulse — Claude Code Context

## What this project is
Pulse is an uptime monitoring + hosted status page SaaS for indie hackers and small
teams. Customers add HTTP services to monitor; we ping them on a schedule, store
results, render a public status page at `<slug>.pulse.io`, and alert on failures.

This file is the single source of truth. Read it before touching anything.
Detail lives elsewhere — read those files only when relevant to your task.

> The product name and Go module path are both **Pulse** (`github.com/mehannioui/pulse`).

---

## Stack
| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Nuxt 4 (Vue 3) — Vercel             |
| Backend    | Go 1.23 — Fly.io                    |
| Database   | PostgreSQL via Supabase             |
| Auth       | Supabase Auth (JWT)                 |
| Queue      | River (Postgres-backed)             |
| Cache      | Upstash Redis                       |
| Payments   | Stripe                              |
| Email      | Resend                              |
| Errors     | Sentry                              |
| CI/CD      | GitHub Actions                      |

---

## Directory structure
```
shipfast/
├── CLAUDE.md
├── Makefile               ← all runnable commands
├── docker-compose.yml     ← local Postgres + Redis
│
├── cmd/
│   ├── api/main.go        ← HTTP server entrypoint
│   └── worker/main.go     ← River worker entrypoint
│
├── internal/
│   ├── server/            ← chi router, middleware
│   ├── auth/              ← JWT validation, org context
│   ├── orgs/              ← org + membership CRUD
│   ├── services/          ← monitored services CRUD
│   ├── checks/            ← check engine + results
│   ├── incidents/         ← incident management
│   ├── billing/           ← Stripe
│   ├── notify/            ← Resend email
│   └── storage/           ← Supabase Storage
│
├── db/
│   ├── migrations/        ← goose SQL migrations
│   ├── queries/           ← sqlc .sql files
│   └── sqlc/              ← generated Go (do not edit)
│
├── web/                   ← Nuxt 4 app
│   └── app/
│       ├── pages/
│       ├── components/
│       ├── composables/
│       └── stores/
│
├── docs/architecture.md   ← decision rationale (read when relevant)
├── tasks/                 ← one task file per session, with acceptance criteria
└── conventions/           ← style rules per layer (read for that layer's work)
```

---

## Commands
```bash
make dev          # API + worker locally
make test         # go test + vitest
make build        # build Go binaries
make migrate      # apply DB migrations
make sqlc         # regen Go from db/queries/
make lint         # golangci-lint + eslint
make docker-up    # local Postgres + Redis
make help         # show all targets
```

---

## DO NOT
- **No ORM.** sqlc + raw SQL only. See conventions/sql.md.
- **No new Go deps** without asking. Check stdlib first.
- **No global mutable state.** Pass dependencies explicitly.
- **No `any` type in Go** without a comment explaining why.
- **No secrets in `web/`.** All third-party API calls go through the Go backend.
- **No direct Supabase DB calls from Nuxt.** Only Auth + Realtime subscriptions.
- **Never query across tenants.** Every table has `org_id`; RLS enforces it.

---

## Conventions (read the relevant file for the layer you're touching)
- Go → conventions/go.md
- Vue/Nuxt → conventions/vue.md
- SQL → conventions/sql.md
- Tests → conventions/testing.md

---

## Key architecture decisions (don't re-derive — full rationale in docs/architecture.md)
1. **River for check scheduling** — Postgres-backed, handles retries + leader election.
2. **Plain Postgres for check_results** — no TimescaleDB v1; aggregation table for old data.
3. **SSE for real-time dashboard** — simpler than WebSockets, one-way fits the use case.
4. **SSG for public status pages** — regenerated on incident change via Vercel hooks.
5. **Wildcard subdomain routing** — `*.pulse.io` resolved by Nuxt middleware to tenant.
6. **sqlc over ORM** — type-safe, explicit, debuggable.
7. **Supabase Auth over Clerk** — already in stack, free tier sufficient.
8. **RLS on every table** — multi-tenancy enforced at DB level; service role bypass for worker.
9. **Modular monolith** — `cmd/api` + `cmd/worker`, no microservices.

---

## Pricing tiers (drives feature flags)
- **Free** — 3 services, 5-min interval, 7 days history, 1 status page
- **Pro ($19/mo)** — 50 services, 1-min interval, 90 days history, 5 team members

---

## Multi-tenancy
Every table has `org_id uuid NOT NULL`.
RLS: `org_id = (auth.jwt() ->> 'org_id')::uuid` on all tables.
Worker uses service role (bypasses RLS) — must pass `org_id` explicitly in every insert.

---

## Environment variables
See `.env.example` for the full list. Required:
`DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_JWT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`,
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `SENTRY_DSN`,
`UPSTASH_REDIS_URL`, `UPSTASH_REDIS_TOKEN`, `PORT`.

---

## Current status
See `tasks/STATUS.md` at session start. Don't redo completed tasks.
