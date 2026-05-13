-- name: CreateIncident :one
INSERT INTO incidents (org_id, title, status, severity, started_at)
VALUES (@org_id, @title, @status, @severity, @started_at)
RETURNING id, org_id, title, status, severity, started_at, resolved_at, created_at, updated_at;

-- name: ListIncidents :many
SELECT id, org_id, title, status, severity, started_at, resolved_at, created_at, updated_at
FROM incidents
WHERE org_id = @org_id
ORDER BY started_at DESC;

-- name: GetIncident :one
SELECT id, org_id, title, status, severity, started_at, resolved_at, created_at, updated_at
FROM incidents
WHERE id = @id AND org_id = @org_id;

-- name: UpdateIncidentStatus :exec
UPDATE incidents
SET status      = @status,
    resolved_at = @resolved_at
WHERE id = @id AND org_id = @org_id;

-- name: AddIncidentUpdate :one
INSERT INTO incident_updates (incident_id, status, body)
VALUES (@incident_id, @status, @body)
RETURNING id, incident_id, status, body, created_at;
