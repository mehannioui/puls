-- +goose Up

CREATE TABLE incidents (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      uuid        NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    title       text        NOT NULL,
    status      text        NOT NULL DEFAULT 'investigating'
                            CHECK (status IN ('investigating', 'identified', 'monitoring', 'resolved')),
    severity    text        NOT NULL DEFAULT 'minor'
                            CHECK (severity IN ('minor', 'major', 'critical')),
    started_at  timestamptz NOT NULL DEFAULT now(),
    resolved_at timestamptz,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_incidents_org_id ON incidents (org_id);

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY incidents_tenant ON incidents
    USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

CREATE TABLE incident_services (
    incident_id uuid NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    service_id  uuid NOT NULL REFERENCES services(id)  ON DELETE CASCADE,
    PRIMARY KEY (incident_id, service_id)
);

CREATE INDEX idx_incident_services_incident_id ON incident_services (incident_id);
CREATE INDEX idx_incident_services_service_id  ON incident_services (service_id);

ALTER TABLE incident_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY incident_services_tenant ON incident_services
    USING (incident_id IN (
        SELECT id FROM incidents
        WHERE org_id = (auth.jwt() ->> 'org_id')::uuid
    ));

CREATE TABLE incident_updates (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id uuid        NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    status      text        NOT NULL
                            CHECK (status IN ('investigating', 'identified', 'monitoring', 'resolved')),
    body        text        NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_incident_updates_incident_id ON incident_updates (incident_id);

ALTER TABLE incident_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY incident_updates_tenant ON incident_updates
    USING (incident_id IN (
        SELECT id FROM incidents
        WHERE org_id = (auth.jwt() ->> 'org_id')::uuid
    ));

-- +goose Down

DROP POLICY IF EXISTS incident_updates_tenant  ON incident_updates;
DROP TABLE  IF EXISTS incident_updates;
DROP POLICY IF EXISTS incident_services_tenant ON incident_services;
DROP TABLE  IF EXISTS incident_services;
DROP POLICY IF EXISTS incidents_tenant ON incidents;
DROP TABLE  IF EXISTS incidents;
