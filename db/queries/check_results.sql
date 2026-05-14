-- name: InsertCheckResult :exec
INSERT INTO check_results (service_id, org_id, checked_at, ok, status_code, response_ms, error)
VALUES (@service_id, @org_id, @checked_at, @ok, @status_code, @response_ms, @error);

-- name: GetRecentResults :many
SELECT id, service_id, org_id, checked_at, ok, status_code, response_ms, error
FROM check_results
WHERE service_id = @service_id AND org_id = @org_id
ORDER BY checked_at DESC
LIMIT @limit_count;

-- name: GetUptimePercent :one
-- caller passes since = now() - interval '24 hours' (or 7d / 30d)
SELECT
    COALESCE(
        COUNT(*) FILTER (WHERE ok) * 100.0 / NULLIF(COUNT(*), 0),
        0
    ) AS uptime_percent
FROM check_results
WHERE service_id = @service_id
  AND org_id     = @org_id
  AND checked_at >= @since;

-- name: PruneOldResults :exec
DELETE FROM check_results
WHERE org_id = @org_id AND checked_at < @before;

-- name: GetLastCheckTimes :many
-- returns the most recent check time per service, used by the scheduler
SELECT DISTINCT ON (service_id) service_id, checked_at AS last_checked_at
FROM check_results
ORDER BY service_id, checked_at DESC;

-- name: GetResultsSince :many
SELECT id, service_id, org_id, checked_at, ok, status_code, response_ms, error
FROM check_results
WHERE service_id = @service_id AND org_id = @org_id AND checked_at >= @since
ORDER BY checked_at ASC;
