-- name: CreateService :one
INSERT INTO services (org_id, name, url, method, expected_status, interval_seconds, timeout_seconds)
VALUES (@org_id, @name, @url, @method, @expected_status, @interval_seconds, @timeout_seconds)
RETURNING id, org_id, name, url, method, expected_status, interval_seconds, timeout_seconds, is_active, created_at, updated_at;

-- name: ListServices :many
SELECT id, org_id, name, url, method, expected_status, interval_seconds, timeout_seconds, is_active, created_at, updated_at
FROM services
WHERE org_id = @org_id
ORDER BY created_at DESC;

-- name: GetService :one
SELECT id, org_id, name, url, method, expected_status, interval_seconds, timeout_seconds, is_active, created_at, updated_at
FROM services
WHERE id = @id AND org_id = @org_id;

-- name: UpdateService :one
UPDATE services
SET name             = @name,
    url              = @url,
    method           = @method,
    expected_status  = @expected_status,
    interval_seconds = @interval_seconds,
    timeout_seconds  = @timeout_seconds,
    is_active        = @is_active
WHERE id = @id AND org_id = @org_id
RETURNING id, org_id, name, url, method, expected_status, interval_seconds, timeout_seconds, is_active, created_at, updated_at;

-- name: DeleteService :exec
DELETE FROM services
WHERE id = @id AND org_id = @org_id;

-- name: CountServices :one
SELECT COUNT(*) FROM services WHERE org_id = @org_id;

-- name: ListActiveServices :many
-- used by worker (service role) — no org_id filter intentional
SELECT id, org_id, name, url, method, expected_status, interval_seconds, timeout_seconds, is_active, created_at, updated_at
FROM services
WHERE is_active = true
ORDER BY org_id, id;
