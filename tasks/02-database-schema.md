# Task 02 — Database Schema

## Goal
Create the core schema: orgs, org_members, services, check_results, incidents,
incident_services, incident_updates. All tenant tables have `org_id` and RLS.
Generate sqlc Go bindings.

## Context
- Read `conventions/sql.md` first.
- Goose for migrations (`db/migrations/`).
- sqlc for query codegen (`db/queries/` → `db/sqlc/`).
- Supabase Auth manages `auth.users`. We do **not** mirror users into our own table;
  membership joins via `auth.uid()`.

---

## Acceptance criteria
- [ ] `make migrate` applies cleanly against a fresh local Postgres
- [ ] `make migrate-down` rolls back every migration cleanly
- [ ] `make sqlc` generates Go bindings without errors
- [ ] RLS policies prevent cross-tenant reads (verify with `psql` as a non-service role)
- [ ] Every tenant table has `org_id`, `created_at`, and `updated_at` where relevant
- [ ] Every `org_id` column is indexed

---

## Migrations to create

### `000001_init_orgs.sql`
- `orgs` (id, slug unique, name, plan, stripe_customer_id, timestamps)
- `org_members` (org_id, user_id [→ auth.users], role text check, timestamps)
- RLS on both. Policy reads `org_id` from JWT.

### `000002_services.sql`
- `services` (id, org_id, name, url, method, expected_status, interval_seconds,
  timeout_seconds, is_active, timestamps)
- Indexes: `(org_id)`, `(is_active) WHERE is_active`
- RLS on `services`.

### `000003_check_results.sql`
- `check_results` (id bigserial, service_id, org_id [denormalized for RLS perf],
  checked_at, ok bool, status_code, response_ms, error text)
- Indexes: `(service_id, checked_at DESC)`, `(org_id, checked_at DESC)`
- RLS on `check_results`.

### `000004_incidents.sql`
- `incidents` (id, org_id, title, status check in (...), severity check in (...),
  started_at, resolved_at, timestamps)
- `incident_services` (incident_id, service_id) — m2m
- `incident_updates` (id, incident_id, status, body, created_at)
- Indexes + RLS.

### `000005_updated_at_trigger.sql`
- One generic `set_updated_at()` function.
- Triggers on `orgs`, `services`, `incidents`.

---

## sqlc queries to create (in `db/queries/`)

### `orgs.sql`
- `CreateOrg :one`, `GetOrgBySlug :one`, `GetOrgsForUser :many`, `UpdateOrgPlan :exec`

### `services.sql`
- `CreateService :one`, `ListServices :many`, `GetService :one`,
  `UpdateService :one`, `DeleteService :exec`, `ListActiveServices :many` (worker)

### `check_results.sql`
- `InsertCheckResult :exec`, `GetRecentResults :many` (last N for a service),
  `GetUptimePercent :one` (last 24h / 7d / 30d), `PruneOldResults :exec`

### `incidents.sql`
- `CreateIncident :one`, `ListIncidents :many`, `GetIncident :one`,
  `UpdateIncidentStatus :exec`, `AddIncidentUpdate :one`

---

## Verification (write these as part of the task)
- `go test ./internal/orgs -run TestRLS` — integration test asserting cross-tenant
  reads return empty.
- `psql $DATABASE_URL -c "SELECT * FROM services;"` as a non-service user returns 0
  rows when JWT claim is empty.

---

## DO NOT
- Don't add a `users` mirror table. Use `auth.users` via FK.
- Don't use Postgres enums. Use `text CHECK (col IN (...))`.
- Don't bundle multiple features into one migration.
- Don't `SELECT *` in sqlc queries.
