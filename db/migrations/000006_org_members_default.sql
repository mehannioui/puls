-- +goose Up

ALTER TABLE org_members ADD COLUMN is_default boolean NOT NULL DEFAULT false;

-- +goose Down

ALTER TABLE org_members DROP COLUMN IF EXISTS is_default;
