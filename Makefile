.PHONY: help dev build test test-go test-web lint migrate migrate-down migrate-status sqlc docker-up docker-down tidy

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
	golangci-lint run ./cmd/... ./internal/...
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
