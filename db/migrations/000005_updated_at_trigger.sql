-- +goose Up

-- +goose StatementBegin
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;
-- +goose StatementEnd

CREATE TRIGGER orgs_updated_at
    BEFORE UPDATE ON orgs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER org_members_updated_at
    BEFORE UPDATE ON org_members
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER incidents_updated_at
    BEFORE UPDATE ON incidents
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- +goose Down

DROP TRIGGER IF EXISTS incidents_updated_at   ON incidents;
DROP TRIGGER IF EXISTS services_updated_at    ON services;
DROP TRIGGER IF EXISTS org_members_updated_at ON org_members;
DROP TRIGGER IF EXISTS orgs_updated_at        ON orgs;
DROP FUNCTION IF EXISTS set_updated_at();
