# Task 06 — Public Status Page (SSG + Subdomain Routing)

## Goal
Public, static-generated status pages at `<slug>.pulse.io` showing service status,
last 90 days uptime per service, and active/recent incidents. No auth required.

## Context
- Read `docs/architecture.md` (decisions 4 + 5).
- Nuxt SSG with on-demand ISR (revalidated on incident change).
- Wildcard DNS configured in Vercel: `*.pulse.io` → this app.

---

## Acceptance criteria
- [ ] Visiting `<slug>.pulse.io` resolves to the correct org's public page
- [ ] Unknown slug → 404 page
- [ ] Page shows: org name, list of services with current status + 90-day uptime bar
- [ ] Page shows: active incidents (status, severity, started, latest update)
- [ ] Page is statically generated (verify with `view-source` — no client-only render)
- [ ] Page rebuilds within ~10s of an incident state change (via on-demand revalidation)
- [ ] No data leaks: only `is_active = true` services appear; no internal fields exposed

---

## Backend (Go)

### Public API (no auth, but rate-limited)
- `GET /public/status?slug=acme` → `{ org, services, incidents }`
  - `services`: id, name, current_status (ok/degraded/down), uptime_percent_30d, uptime_buckets_90d (1 bool/day)
  - `incidents`: open incidents only + last 5 resolved (with updates)
- Apply Redis-backed rate limit: 60 req/min per IP.

### Revalidation trigger
- On incident create/update/resolve, Go calls Vercel revalidation API:
  `POST https://pulse.io/api/revalidate?path=/&slug=...&secret=...`
- Endpoint lives in `internal/incidents/` since that's where the state changes.

---

## Frontend (Nuxt)

### Routing (`app/middleware/tenant.global.ts`)
- Reads `host` header on SSR.
- Parses `<slug>.pulse.io`. If slug matches a tenant, sets `useState('tenant', ...)`.
- If not in app domain (`pulse.io` root), continues to normal app routes.

### `app/pages/index.vue` (public status page, when on tenant subdomain)
- Renders org name, services with status bars, incidents.
- Uses `useAsyncData` to fetch from Go's `/public/status` — SSG-compatible.

### Components
- `StatusBar.vue` — 90 boxes (one per day), green/red/grey.
- `IncidentCard.vue` — title, severity badge, started, updates timeline.

### Nuxt config
- Add `nitro.prerender` config or use `routeRules` with `swr: 60` for ISR.
- Add API route `server/api/revalidate.post.ts` that calls `useStorage().setItem` to bust SSG cache (or use Vercel's `revalidatePath`).

---

## DO NOT
- Don't fetch from the *authenticated* API. Public pages use the public endpoint.
- Don't expose `org_id` UUIDs in the URL. Use slugs.
- Don't query `check_results` directly from the frontend. The Go endpoint aggregates.
- Don't render anything client-only on the public page. SSR/SSG only.
