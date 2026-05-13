-- +goose Up

CREATE TABLE services (
    id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id           uuid        NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name             text        NOT NULL,
    url              text        NOT NULL,
    method           text        NOT NULL DEFAULT 'GET' CHECK (method IN ('GET', 'HEAD', 'POST')),
    expected_status  int         NOT NULL DEFAULT 200,
    interval_seconds int         NOT NULL DEFAULT 300,
    timeout_seconds  int         NOT NULL DEFAULT 30,
    is_active        bool        NOT NULL DEFAULT true,
    created_at       timestamptz NOT NULL DEFAULT now(),
    updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_services_org_id ON services (org_id);
CREATE INDEX idx_services_active ON services (is_active) WHERE is_active;

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY services_tenant ON services
    USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- +goose Down

DROP POLICY IF EXISTS services_tenant ON services;
DROP TABLE  IF EXISTS services;
