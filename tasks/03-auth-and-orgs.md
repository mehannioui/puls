# Task 03 — Auth + Org Management

## Goal
Wire Supabase Auth into Nuxt and Go. Users can sign up, sign in, create an org,
switch between orgs they belong to. Go validates the JWT and surfaces an
authenticated `org_id` to handlers.

## Context
- Read `conventions/go.md` and `conventions/vue.md`.
- Supabase Auth is the identity provider. We add the `org_id` claim to the JWT via
  a Supabase Auth Hook (Postgres function) so it lands in `auth.jwt()` for RLS.

---

## Acceptance criteria
- [ ] Sign up + sign in flows work end-to-end in Nuxt
- [ ] Go middleware rejects requests without a valid JWT (401)
- [ ] Go middleware extracts `user_id` and `org_id` from the JWT into `context.Context`
- [ ] First-time user is redirected to `/onboarding` to create their first org
- [ ] User can switch orgs via a dropdown; the chosen `org_id` ends up in the JWT
- [ ] RLS test: a request from user A with `org_id` X cannot read org Y's data

---

## Backend (Go)

### `internal/auth/middleware.go`
- `Middleware(secret string) func(http.Handler) http.Handler`
- Validates JWT signature (HS256, `SUPABASE_JWT_SECRET`).
- Extracts `sub` (user_id) and custom claim `org_id`.
- Puts both on `context.Context` via typed keys.
- Helpers: `auth.UserID(ctx)`, `auth.OrgID(ctx)`.

### `internal/orgs/`
- `service.go` — `CreateOrg(ctx, name)`, `ListOrgsForUser(ctx)`, `SwitchOrg(ctx, orgID)`
- `http.go` — handlers: `POST /api/orgs`, `GET /api/orgs`, `POST /api/orgs/{id}/switch`
- `repo.go` — sqlc wiring

### Routes (in `internal/server/routes.go`)
- Public: `GET /health`
- Authed: `/api/*` (chi `Group` with auth middleware)

---

## Frontend (Nuxt)

### `app/middleware/auth.ts`
- Redirects to `/login` if no session.
- Redirects to `/onboarding` if session exists but no `org_id` claim.

### `app/composables/useApi.ts`
- Wraps `$fetch` with Supabase JWT in `Authorization: Bearer ...`.
- Single source for the API base URL.

### Pages
- `pages/login.vue` — Supabase email + password
- `pages/signup.vue` — Supabase signup
- `pages/onboarding.vue` — create first org
- `pages/index.vue` — redirect to `/dashboard` if authed, `/login` otherwise

### Components
- `OrgSwitcher.vue` — dropdown in the header, calls `POST /api/orgs/{id}/switch`

---

## Supabase Auth Hook (one-time setup, document in docs/)
- Postgres function `public.add_org_id_to_jwt(event jsonb) returns jsonb`
- Reads default org for the user from `org_members`, injects `org_id` into JWT claims.
- Registered in Supabase dashboard as the JWT customization hook.

---

## DO NOT
- Don't store passwords. Supabase handles that.
- Don't fetch user records from `auth.users` directly via Nuxt. Use `useSupabaseUser()`.
- Don't let the frontend pick `org_id` for API requests. The server reads it from the JWT.
- Don't write a custom JWT library. Use `github.com/golang-jwt/jwt/v5` (add via `go get`, ask first).
