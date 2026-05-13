# Task 01 — Monorepo Setup

## Goal
Bootstrap the full ShipFast project structure: Go module, Nuxt 3 app, Makefile,
docker-compose, goose, sqlc config, and all tooling — so every subsequent task
starts from a working, runnable foundation.

---

## Context
- Empty repo. git has been initialised. No code exists yet.
- Project root is shipfast/
- Full stack: Go backend (cmd/api + cmd/worker) + Nuxt 3 frontend (web/)
- Read CLAUDE.md for the complete directory structure before starting.
- Do not create any business logic — only scaffolding and tooling.

---

## Acceptance criteria
- [ ] `go build ./...` succeeds from repo root
- [ ] `cd web && npm install && npm run dev` starts Nuxt on localhost:3000
- [ ] `docker-compose up -d` starts Postgres on 5432 and Redis on 6379
- [ ] `make help` prints all available targets
- [ ] `make lint` runs without crashing (warnings OK, errors not OK)
- [ ] `.env.example` documents every environment variable used in the codebase
- [ ] `.gitignore` covers Go binaries, node_modules, .env, tmp/

---

## Files to create

### Go module + structure
```
go.mod                         (module github.com/shipfast/shipfast, go 1.23)
cmd/api/main.go                (minimal: starts HTTP server on $PORT, logs "api started")
cmd/worker/main.go             (minimal: logs "worker started", blocks)
internal/server/server.go      (empty Server struct, New() constructor)
internal/server/routes.go      (chi router, single GET /health → {"status":"ok"})
internal/auth/.gitkeep
internal/projects/.gitkeep
internal/billing/.gitkeep
internal/pipeline/.gitkeep
internal/storage/.gitkeep
internal/notify/.gitkeep
db/migrations/.gitkeep
db/queries/.gitkeep
db/sqlc/.gitkeep
```

### Go dependencies to add (go get)
```
github.com/go-chi/chi/v5
github.com/jackc/pgx/v5
github.com/riverqueue/river
github.com/riverqueue/river/riverdriver/riverpgxv5
github.com/pressly/goose/v3
github.com/redis/go-redis/v9
github.com/stripe/stripe-go/v78
github.com/resend/resend-go/v2
github.com/getsentry/sentry-go
github.com/joho/godotenv
```

### sqlc.yaml (repo root)
```yaml
version: "2"
sql:
  - engine: "postgresql"
    queries: "db/queries/"
    schema: "db/migrations/"
    gen:
      go:
        package: "sqlcdb"
        out: "db/sqlc"
        emit_json_tags: true
        emit_prepared_queries: false
        emit_interface: false
        emit_exact_table_names: false
```

### docker-compose.yml
```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: shipfast
      POSTGRES_PASSWORD: shipfast
      POSTGRES_DB: shipfast_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### .env.example
```
# Database
DATABASE_URL=postgres://shipfast:shipfast@localhost:5432/shipfast_dev

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=

# Stripe
STRIPE_SECRET_KEY=sk_test_
STRIPE_WEBHOOK_SECRET=whsec_

# Anthropic
ANTHROPIC_API_KEY=sk-ant-

# Resend
RESEND_API_KEY=re_

# Sentry
SENTRY_DSN=

# Upstash Redis
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=

# App
PORT=8080
APP_ENV=development
```

### Makefile
```makefile
.PHONY: help dev build test test-go test-web lint migrate sqlc docker-up docker-down

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

docker-up: ## Start local Postgres + Redis
	docker-compose up -d

docker-down: ## Stop local services
	docker-compose down

dev: ## Run API and worker locally (requires docker-up)
	@cp -n .env.example .env 2>/dev/null || true
	go run ./cmd/api &
	go run ./cmd/worker

build: ## Compile Go binaries
	go build -o tmp/api ./cmd/api
	go build -o tmp/worker ./cmd/worker

test: test-go test-web ## Run all tests

test-go: ## Run Go tests
	go test ./... -v -race -count=1

test-web: ## Run Nuxt/Vitest tests
	cd web && npm run test

lint: ## Run linters
	golangci-lint run ./...
	cd web && npm run lint

migrate: ## Apply pending DB migrations
	goose -dir db/migrations postgres "$(DATABASE_URL)" up

migrate-down: ## Roll back last migration
	goose -dir db/migrations postgres "$(DATABASE_URL)" down

migrate-status: ## Show migration status
	goose -dir db/migrations postgres "$(DATABASE_URL)" status

sqlc: ## Regenerate Go code from SQL queries
	sqlc generate

tidy: ## Tidy go modules
	go mod tidy
```

### .gitignore
```
# Go
tmp/
*.exe
*.test
*.out

# Env
.env
.env.local

# Node
web/node_modules/
web/.nuxt/
web/.output/
web/dist/

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
```

### Nuxt 3 app
Run: `cd web && npx nuxi@latest init . --no-install`
Then: `cd web && npm install`
Add to web/nuxt.config.ts:
```ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxtjs/supabase'],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8080',
    }
  }
})
```
Add Nuxt deps: `cd web && npm install @pinia/nuxt @nuxtjs/supabase pinia`

---

## Implementation notes
- cmd/api/main.go should load .env via godotenv in development, then start chi server.
- The /health endpoint must return 200 — used by Fly.io health checks.
- Keep cmd/api/main.go and cmd/worker/main.go under 50 lines each. No business logic.
- internal/server/routes.go is where all route registration lives — not main.go.
- Run `go mod tidy` after all `go get` commands.

---

## Already done — do not touch
- CLAUDE.md ✓
- tasks/ directory ✓
- .git ✓
