-- Public status page queries — service role, RLS bypassed.
-- Every query filters explicitly by org_id.

-- name: ListPublicServices :many
-- Only active services, no internal fields (org_id not in SELECT).
SELECT id, name, url
FROM services
WHERE org_id = @org_id
  AND is_active = true
ORDER BY name;

-- name: GetServiceLastCheck :one
-- Most recent check result for a service.
SELECT ok, status_code, response_ms, checked_at
FROM check_results
WHERE service_id = @service_id
ORDER BY checked_at DESC
LIMIT 1;

-- name: GetServiceUptime30d :one
SELECT
    COALESCE(
        COUNT(*) FILTER (WHERE ok) * 100.0 / NULLIF(COUNT(*), 0),
        0
    )::float8 AS uptime_percent
FROM check_results
WHERE service_id = @service_id
  AND checked_at >= NOW() - INTERVAL '30 days';

-- name: GetServiceDailyUptime :many
-- One row per calendar day in the last 90 days that has at least one check.
-- Missing days are filled in Go.
SELECT
    (checked_at AT TIME ZONE 'UTC')::date AS day,
    COUNT(*) FILTER (WHERE ok)            AS ok_count,
    COUNT(*)                              AS total_count
FROM check_results
WHERE service_id = @service_id
  AND checked_at >= NOW() - INTERVAL '90 days'
GROUP BY 1
ORDER BY 1 ASC;

-- name: ListPublicIncidents :many
-- Open incidents + last 5 resolved, ordered newest first.
SELECT id, title, status, severity, started_at, resolved_at
FROM incidents
WHERE org_id = @org_id
  AND (
      status != 'resolved'
      OR resolved_at >= NOW() - INTERVAL '7 days'
  )
ORDER BY started_at DESC
LIMIT 10;

-- name: ListIncidentUpdatesByIncident :many
SELECT id, incident_id, status, body, created_at
FROM incident_updates
WHERE incident_id = @incident_id
ORDER BY created_at ASC;
