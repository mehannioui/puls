-- +goose Up

CREATE TABLE check_results (
    id          bigserial   PRIMARY KEY,
    service_id  uuid        NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    org_id      uuid        NOT NULL REFERENCES orgs(id)     ON DELETE CASCADE,
    checked_at  timestamptz NOT NULL DEFAULT now(),
    ok          bool        NOT NULL,
    status_code int,
    response_ms int,
    error       text
);

CREATE INDEX idx_check_results_service_checked ON check_results (service_id, checked_at DESC);
CREATE INDEX idx_check_results_org_checked     ON check_results (org_id,     checked_at DESC);

ALTER TABLE check_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY check_results_tenant ON check_results
    USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- +goose Down

DROP POLICY IF EXISTS check_results_tenant ON check_results;
DROP TABLE  IF EXISTS check_results;
