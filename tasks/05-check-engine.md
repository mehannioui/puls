# Task 05 — Check Engine (Worker)

## Goal
A River-based worker that, for every active service, performs an HTTP check on
schedule, records the result in `check_results`, and computes whether status changed.

## Context
- Read `conventions/go.md` and `docs/architecture.md` (decisions 1 and 2).
- River is in `go.mod`. Run with `cmd/worker`.
- This is the hot path of the product. Concurrency, timeouts, and observability matter.

---

## Acceptance criteria
- [ ] Worker boots, connects to Postgres via River, logs "worker started"
- [ ] A `CheckServiceArgs{ServiceID, OrgID}` job performs one HTTP check + insert
- [ ] A scheduler (separate goroutine in the worker) enqueues a `CheckServiceArgs` for
      every active service at its configured interval
- [ ] Worker handles transient HTTP errors gracefully (timeout, DNS fail, TLS error,
      non-2xx) and records them in `check_results`
- [ ] Worker honors per-service `timeout_seconds`
- [ ] Worker is shutdown-clean: SIGTERM cancels in-flight checks within 10s
- [ ] Concurrency: configurable max parallel checks (default 50)
- [ ] Integration test: spin up Postgres + mock HTTP server; assert results inserted

---

## Implementation

### `internal/checks/`
- `worker.go`:
  - `CheckWorker` implements `river.Worker[CheckServiceArgs]`
  - `Work(ctx, job)` — fetches the service, runs HTTP check, inserts result, returns.
- `scheduler.go`:
  - `Scheduler` — runs in a goroutine, ticks every 30s, queries `ListActiveServices`,
    enqueues a job for any service whose last check is older than its interval.
- `client.go`:
  - `Check(ctx, svc Service) Result` — does the HTTP work. Standalone for testability.
  - `Result{OK bool, StatusCode int, ResponseMS int, Error string}`
- `repo.go` — sqlc wiring for insert + last-check lookup.

### HTTP client behavior
- `http.Client` with timeout = `svc.timeout_seconds`.
- Follow up to 5 redirects.
- TLS errors → `OK=false, Error="tls: ..."`.
- DNS errors → `OK=false, Error="dns: ..."`.
- Non-2xx (or not matching `expected_status`) → `OK=false, StatusCode=..., Error="status mismatch"`.

### `cmd/worker/main.go`
- Loads `.env`.
- Boots River client + workers.
- Boots scheduler.
- Waits on SIGTERM, drains for up to 10s.

---

## Observability (do this, don't skip)
- `slog` with `service_id`, `org_id`, `ok`, `response_ms`, `status_code` fields.
- Counter (just in-process for now): `checks_total`, `checks_failed`.
- Log spike: if a service flips OK ↔ failed, log at `Warn`.

---

## DO NOT
- Don't make HTTP requests in the same goroutine as the scheduler. Always enqueue.
- Don't insert results without `org_id` (worker uses service role — RLS won't save you).
- Don't retry HTTP failures inside the worker. Each check is one attempt. The next
  scheduled run is the "retry."
- Don't fire checks for inactive services (`is_active = false`).
