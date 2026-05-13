# Task 02 — Database Schema + Migrations

## Goal
Write all SQL migrations for the full ShipFast data model, configure goose as the
migration runner, and generate the initial sqlc Go types.

---

## Context
- Task 01 (monorepo setup) is complete. Go module initialised, Makefile exists,
  docker-compose is running local Postgres on port 5432.
- No migrations exist yet. You are creating the baseline schema from scratch.
- Read docs/data-model.md before writing a single line of SQL.
- Multi-tenancy model: every table has `org_id uuid NOT NULL` + RLS. See CLAUDE.md.
- We use goose for migrations (already in go.mod). Files go in db/migrations/.
- We use sqlc for query generation. Config is sqlc.yaml at repo root.

---

## Acceptance criteria
- [ ] `make migrate` runs all migrations cleanly against local Postgres
- [ ] `make sqlc` generates Go types in db/sqlc/ with no errors
- [ ] `make test-go` passes (schema-level tests in db/schema_test.go)
- [ ] Every table has: id, org_id, created_at, updated_at
- [ ] Every table has RLS enabled + at least a SELECT policy
- [ ] Foreign keys have explicit ON DELETE behaviour (no silent nulls)
- [ ] No migration modifies a previous migration file

---

## Files to create
```
db/migrations/
  001_extensions.sql       ← uuid-ossp, pgcrypto
  002_orgs_users.sql       ← orgs, org_members tables
  003_projects.sql         ← projects, pipeline_status enum
  004_pipeline_events.sql  ← pipeline_events (realtime progress)
  005_deliverables.sql     ← deliverables (output files per project)
  006_billing.sql          ← subscriptions, invoices
  007_rls_policies.sql     ← all RLS policies in one place

db/queries/
  orgs.sql
  projects.sql
  pipeline_events.sql
  deliverables.sql
  billing.sql

sqlc.yaml                  ← sqlc config (create if missing)
db/schema_test.go          ← verify tables + columns exist
```

---

## Schema spec

### orgs
```sql
id          uuid PRIMARY KEY DEFAULT uuid_generate_v4()
name        text NOT NULL
slug        text NOT NULL UNIQUE
plan        text NOT NULL DEFAULT 'free'  -- free | starter | pro
created_at  timestamptz NOT NULL DEFAULT now()
updated_at  timestamptz NOT NULL DEFAULT now()
```

### org_members
```sql
id          uuid PRIMARY KEY DEFAULT uuid_generate_v4()
org_id      uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE
user_id     uuid NOT NULL  -- Supabase auth.users id
role        text NOT NULL DEFAULT 'member'  -- owner | admin | member
created_at  timestamptz NOT NULL DEFAULT now()
UNIQUE(org_id, user_id)
```

### projects
```sql
id            uuid PRIMARY KEY DEFAULT uuid_generate_v4()
org_id        uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE
name          text NOT NULL
source_type   text NOT NULL  -- github | zip
source_url    text           -- GitHub repo URL or null for zip
storage_path  text           -- path in Supabase Storage after ingest
status        pipeline_status NOT NULL DEFAULT 'pending'
input_tokens  bigint NOT NULL DEFAULT 0   -- Claude API cost tracking
output_tokens bigint NOT NULL DEFAULT 0
error_message text
created_at    timestamptz NOT NULL DEFAULT now()
updated_at    timestamptz NOT NULL DEFAULT now()
```

### pipeline_status enum
```sql
CREATE TYPE pipeline_status AS ENUM (
  'pending', 'ingesting', 'parsing', 'analyzing',
  'rebuilding', 'packaging', 'done', 'failed'
);
```

### pipeline_events
```sql
id          uuid PRIMARY KEY DEFAULT uuid_generate_v4()
project_id  uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE
org_id      uuid NOT NULL  -- denormalised for RLS performance
stage       text NOT NULL
status      text NOT NULL  -- started | progress | completed | failed
pct         int  NOT NULL DEFAULT 0  -- 0-100
message     text NOT NULL DEFAULT ''
metadata    jsonb NOT NULL DEFAULT '{}'
created_at  timestamptz NOT NULL DEFAULT now()
```
Index: (project_id, created_at DESC)
This table is the Supabase Realtime source — every INSERT streams to the dashboard.

### deliverables
```sql
id            uuid PRIMARY KEY DEFAULT uuid_generate_v4()
project_id    uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE
org_id        uuid NOT NULL
name          text NOT NULL  -- e.g. "Full rebuild zip"
storage_path  text NOT NULL
file_size     bigint NOT NULL DEFAULT 0
created_at    timestamptz NOT NULL DEFAULT now()
```

### subscriptions
```sql
id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4()
org_id                uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE
stripe_customer_id    text NOT NULL UNIQUE
stripe_subscription_id text
plan                  text NOT NULL DEFAULT 'free'
status                text NOT NULL DEFAULT 'active'
current_period_end    timestamptz
created_at            timestamptz NOT NULL DEFAULT now()
updated_at            timestamptz NOT NULL DEFAULT now()
```

---

## RLS policies pattern (replicate for every table)
```sql
-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Users can only see their org's rows
CREATE POLICY "org_isolation" ON projects
  FOR ALL
  USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- Service role bypasses RLS (for River workers)
-- This is automatic in Supabase for service_role key.
```

---

## sqlc.yaml config
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
        null_str: "pgtype.Text"
```

---

## Implementation notes
- Use `goose` annotation format in every migration file:
  ```sql
  -- +goose Up
  -- your SQL here

  -- +goose Down
  -- rollback SQL here
  ```
- Always write the Down migration. It saves you during development.
- updated_at columns: create a reusable trigger function once in 001_, apply it per table.
- Do not use Supabase's built-in auth schema for org data. Keep it in public schema.
- pipeline_events is INSERT-only in normal operation. Never UPDATE or DELETE from it.

---

## Already done — do not touch
- Go module (go.mod, go.sum) ✓
- Makefile with `make migrate` and `make sqlc` targets ✓
- docker-compose.yml with Postgres ✓
- .env.example with DATABASE_URL ✓
