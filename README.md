# Pulse

Uptime monitoring and hosted status pages for indie hackers and small teams.

Add HTTP services → Pulse pings them on a schedule, stores results, and renders a public status page at `<slug>.pulse.io`. Alerts fire on failure.

## Stack

| Layer    | Tech                              |
|----------|-----------------------------------|
| Frontend | Nuxt 4 (Vue 3) — Vercel           |
| Backend  | Go 1.23 — Fly.io                  |
| Database | PostgreSQL via Supabase           |
| Auth     | Supabase Auth (JWT)               |
| Queue    | River (Postgres-backed)           |
| Cache    | Upstash Redis                     |
| Payments | Stripe                            |
| Email    | Resend                            |

## Local setup

```bash
cp .env.example .env          # fill in required vars
make docker-up                # start Postgres + Redis
make migrate                  # apply DB migrations
make dev                      # API (8080) + worker
```

Frontend:

```bash
cd web && npm install && npm run dev   # http://localhost:3000
```

## Commands

```bash
make dev        # run API + worker
make test       # go test + vitest
make build      # compile Go binaries
make migrate    # apply DB migrations
make sqlc       # regenerate Go from SQL queries
make lint       # golangci-lint + eslint
make help       # list all targets
```

## Environment variables

See `.env.example`. Required at minimum:

```
DATABASE_URL
SUPABASE_URL
SUPABASE_JWT_SECRET
SUPABASE_SERVICE_ROLE_KEY
NUXT_PUBLIC_SUPABASE_URL
NUXT_PUBLIC_SUPABASE_KEY
PORT
```

## Pricing

- **Free** — 3 services, 5-min interval, 7-day history, 1 status page
- **Pro ($19/mo)** — 50 services, 1-min interval, 90-day history, 5 team members
