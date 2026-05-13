# Task 07 — Real-time Dashboard (SSE)

## Goal
The authenticated dashboard shows live status and recent check results, updating in
real time without polling. Plus a response-time chart per service.

## Context
- Read `docs/architecture.md` (decision 3 — SSE not WebSockets).
- Task 05 is feeding `check_results` continuously. We just need to stream them.
- Tasks 03 + 04 deliver auth + service list.

---

## Acceptance criteria
- [ ] `GET /api/stream` (SSE, authed) streams every new `check_result` for the user's org
- [ ] Browser reconnects automatically on disconnect (native `EventSource` does this)
- [ ] Dashboard service rows update status dot + last response time in real time
- [ ] Each service has a sparkline of last 60 check response times
- [ ] Service detail page `/dashboard/services/{id}` shows a 24h line chart of response_ms
- [ ] Stream survives a 2-min idle period without disconnect (server sends keepalive comments)
- [ ] Closing the tab cleanly terminates the SSE connection on the server (no goroutine leak)

---

## Backend (Go)

### `internal/checks/stream.go`
- `Hub` — in-process pub/sub keyed by `org_id`.
  - `Subscribe(orgID) <-chan CheckResult`
  - `Publish(result CheckResult)` (called by worker after insert)
- `StreamHandler(w, r)` — SSE handler.
  - Subscribes to `Hub` for the request's `org_id`.
  - Writes `event: check\ndata: {json}\n\n` per message.
  - Sends `:\n\n` keepalive every 25s.
  - On `r.Context().Done()`, unsubscribes and returns.

### Cross-process pub/sub
- v1: in-process is fine — single API instance + single worker instance.
- v2 if we scale out: swap `Hub` to Redis pub/sub. Don't build it until needed.

### Worker integration
- After `InsertCheckResult`, call `hub.Publish(result)`.
- If API and worker are separate processes (they are), the worker can't reach the API's
  in-memory hub. Two options:
  1. Use Postgres `LISTEN/NOTIFY` — worker NOTIFIEs, API LISTENs.
  2. Redis pub/sub.
- Pick **LISTEN/NOTIFY**. No new dependency, fine for v1 throughput.

---

## Frontend (Nuxt)

### `app/composables/useStatusStream.ts`
- Opens `EventSource(/api/stream)` with auth header (use `fetchEventSource` polyfill or
  pass JWT in query for SSE — Vercel proxies SSE fine).
- Returns a reactive map: `serviceId → latestResult`.
- Cleans up on `onScopeDispose`.

### `app/pages/dashboard/index.vue`
- Uses `useStatusStream()` to keep the list reactive.
- Each row shows a 60-point sparkline (use a tiny library like `@unovis/vue` or hand-rolled SVG).

### `app/pages/dashboard/services/[id].vue`
- Fetches 24h history (new endpoint: `GET /api/services/{id}/results?range=24h`).
- Renders a line chart with x = time, y = response_ms. Mark failed checks in red.

---

## DO NOT
- Don't poll. We have SSE now.
- Don't ship WebSockets unless you can name a concrete blocker on SSE.
- Don't store stream state in a Pinia store unless multiple pages need it. Component-local is fine.
- Don't forget to cancel the EventSource when the page unmounts.
