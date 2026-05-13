# Task 04 — Services CRUD + Dashboard Skeleton

## Goal
Authenticated users can add, list, edit, and delete monitored services for their org.
Dashboard shows the list with a placeholder status indicator (real status comes in Task 07).

## Context
- Read `conventions/go.md` and `conventions/vue.md`.
- Tasks 02 + 03 done — schema and auth are in place.
- A "service" is a URL we'll check on a schedule. Validation matters: bad URLs cause
  worker pain later.

---

## Acceptance criteria
- [ ] `POST /api/services` creates a service for the current org
- [ ] `GET /api/services` lists services for the current org (no cross-tenant leak)
- [ ] `PATCH /api/services/{id}` updates name, url, interval, expected_status, is_active
- [ ] `DELETE /api/services/{id}` removes the service (and its check_results via FK cascade)
- [ ] Plan enforcement: free tier capped at 3 services, pro at 50. 402 Payment Required on cap.
- [ ] Interval enforcement: free tier min 300s, pro tier min 60s.
- [ ] Dashboard `/dashboard` lists services with name, URL, interval, status indicator (mock OK).
- [ ] Form validation: URL must be http(s), interval within plan bounds, expected_status 100–599.

---

## Backend (Go)

### `internal/services/`
- `service.go`:
  - `Create(ctx, input) (Service, error)` — validates input, checks plan limit, inserts.
  - `List(ctx) ([]Service, error)`
  - `Get(ctx, id) (Service, error)`
  - `Update(ctx, id, input) (Service, error)`
  - `Delete(ctx, id) error`
- `validation.go` — URL parse + scheme check, interval bounds, status range.
- `http.go` — handlers.
- `repo.go` — sqlc wiring.

### Plan limits
- Hard-code in `internal/orgs/plan.go`: `MaxServices(plan)`, `MinInterval(plan)`.
- `services.Create` calls these. Returns a typed `ErrPlanLimit` → 402 response.

---

## Frontend (Nuxt)

### `app/pages/dashboard/index.vue`
- Lists services. Each row: name, URL, interval, status dot (mock green for now).
- "Add service" button → opens dialog or navigates to `/dashboard/services/new`.

### `app/pages/dashboard/services/new.vue` and `[id]/edit.vue`
- Form: name, URL, method (GET/HEAD), expected_status, interval (dropdown of plan-valid options).
- Inline validation. Disabled submit until valid.

### `app/composables/api/useServices.ts`
- `list()`, `create(input)`, `update(id, input)`, `remove(id)`
- All go through `useApi()`.

---

## DO NOT
- Don't trust client-side validation alone. Server validates everything.
- Don't allow `interval_seconds` below plan minimum even on update.
- Don't return raw DB errors to the client. Map to typed app errors.
- Don't add an "Account" or "Settings" page in this task. Out of scope.
