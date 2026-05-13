-- +goose Up

-- auth stub for local Postgres (Supabase provides these in production)
CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
    id uuid PRIMARY KEY
);

-- +goose StatementBegin
CREATE OR REPLACE FUNCTION auth.jwt()
RETURNS jsonb LANGUAGE sql STABLE AS $$
    SELECT coalesce(
        current_setting('request.jwt.claims', true)::jsonb,
        '{}'::jsonb
    );
$$;
-- +goose StatementEnd

CREATE TABLE orgs (
    id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    slug               text        NOT NULL UNIQUE,
    name               text        NOT NULL,
    plan               text        NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
    stripe_customer_id text,
    created_at         timestamptz NOT NULL DEFAULT now(),
    updated_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;

CREATE POLICY orgs_tenant ON orgs
    USING (id = (auth.jwt() ->> 'org_id')::uuid);

CREATE TABLE org_members (
    org_id     uuid        NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    user_id    uuid        NOT NULL REFERENCES auth.users(id),
    role       text        NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (org_id, user_id)
);

CREATE INDEX idx_org_members_org_id  ON org_members (org_id);
CREATE INDEX idx_org_members_user_id ON org_members (user_id);

ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY org_members_tenant ON org_members
    USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- +goose Down

DROP POLICY IF EXISTS org_members_tenant ON org_members;
DROP TABLE  IF EXISTS org_members;
DROP POLICY IF EXISTS orgs_tenant ON orgs;
DROP TABLE  IF EXISTS orgs;
DROP FUNCTION IF EXISTS auth.jwt();
DROP TABLE  IF EXISTS auth.users;
DROP SCHEMA IF EXISTS auth;
