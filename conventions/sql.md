# SQL conventions

## Migrations (`db/migrations/`)
- Goose. Filenames: `NNNNNN_short_description.sql` (zero-padded sequence).
- One logical change per migration. Don't bundle.
- Always write `-- +goose Up` and `-- +goose Down`. Down must reverse Up.
- Never edit a migration after it's been applied to any environment. Write a new one.

## Schema rules
- `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` unless there's a reason not to.
- `org_id uuid NOT NULL` on every tenant table. Foreign key to `orgs(id) ON DELETE CASCADE`.
- `created_at timestamptz NOT NULL DEFAULT now()` on every table.
- `updated_at timestamptz NOT NULL DEFAULT now()` on mutable tables. Trigger to bump it.
- Enum-like columns: `text` with a `CHECK (status IN (...))`. Avoid Postgres enums (migration pain).

## Indexes
- Index every `org_id` column.
- Index every column used in a `WHERE` or `ORDER BY` in a hot query.
- Composite indexes for `(org_id, created_at DESC)` patterns.
- Don't over-index — every index is a write cost.

## RLS
- Enable RLS on every tenant table: `ALTER TABLE foo ENABLE ROW LEVEL SECURITY;`
- Policy: `USING (org_id = (auth.jwt() ->> 'org_id')::uuid)`.
- Service role bypasses RLS — only the worker uses it. Worker code must always set `org_id` on insert.

## Queries (`db/queries/*.sql` — sqlc)
- One file per feature: `services.sql`, `checks.sql`, etc.
- Name queries: `:one`, `:many`, `:exec` — be deliberate.
- Always filter by `org_id` in `WHERE`. RLS is a backstop, not the source of truth in app code.
- No `SELECT *`. Name the columns.

## What we don't do
- No ORMs (gorm, ent, bun).
- No stored procedures or triggers for business logic. Triggers OK for `updated_at` only.
- No nullable booleans. Use a default.
- No `JSON` columns for data we'll query. Use proper columns.
