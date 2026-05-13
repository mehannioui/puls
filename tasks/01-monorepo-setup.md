# Task 01 — Monorepo Setup

## Status
✅ **Done.** Completed in initial session.

## What was built
- Go module `github.com/mehannioui/pulse` (Go 1.23)
- `cmd/api` (chi HTTP server with `/health`) + `cmd/worker` (skeleton)
- `internal/server/{server,routes}.go`
- Placeholder `internal/{auth,orgs,services,checks,incidents,billing,notify,storage}/` dirs
- Nuxt 4 in `web/` with Pinia + Supabase modules installed
- `Makefile` with `help`, `dev`, `build`, `test`, `lint`, `migrate`, `sqlc`, `docker-up` targets
- `docker-compose.yml` (Postgres 16 + Redis 7)
- `sqlc.yaml`, `.golangci.yml` (v2 format)
- `.env.example`, `.gitignore`

## Verification commands
```bash
go build ./...                    # passes
make help                         # lists all targets
make lint                         # passes (0 Go issues)
cd web && npm run dev             # starts on :3000
docker-compose up -d              # Postgres on :5432, Redis on :6379
```

## Outstanding cleanup (do as a 5-min chore, not a session)
- Rename `internal/projects/` → `internal/orgs/`
- Delete `internal/pipeline/` (was for the prior product idea)
- Create `internal/services/.gitkeep`, `internal/checks/.gitkeep`, `internal/incidents/.gitkeep`
