# Task 08 — Stripe Billing

## Goal
Users can upgrade from Free → Pro via Stripe Checkout. Successful subscription
updates `orgs.plan`. Plan limits (already enforced in Task 04) gate features.
Webhook handles subscription lifecycle.

## Context
- Read `conventions/go.md`.
- Stripe SDK already in `go.mod` (`stripe-go/v78`).
- Webhook signing secret in `STRIPE_WEBHOOK_SECRET`.

---

## Acceptance criteria
- [ ] `POST /api/billing/checkout` creates a Stripe Checkout Session for the current org's Pro plan
- [ ] Success URL → `/dashboard/billing?status=success`
- [ ] `POST /webhooks/stripe` (no auth, signature-verified) processes:
      - `checkout.session.completed` → set `orgs.plan = 'pro'`, store `stripe_customer_id`
      - `customer.subscription.deleted` → set `orgs.plan = 'free'`
      - `invoice.payment_failed` → mark plan as past_due
- [ ] Billing page shows current plan, Pro features, "Upgrade" or "Manage subscription" button
- [ ] "Manage subscription" → Stripe Customer Portal session
- [ ] Webhook is idempotent: replaying an event doesn't double-charge plan state
- [ ] Downgrading from Pro → Free at period end disables service slots > 3 (mark inactive,
      don't delete data)

---

## Backend (Go)

### `internal/billing/`
- `service.go`:
  - `CreateCheckoutSession(ctx, orgID) (string, error)` — returns Checkout URL
  - `CreatePortalSession(ctx, orgID) (string, error)`
  - `HandleWebhook(ctx, event)` — switch on event type, dispatch
- `webhook.go` — HTTP handler, verifies signature, calls service.
- `repo.go` — `UpdateOrgPlan(ctx, orgID, plan)`, idempotency key tracking.

### Idempotency
- Stripe sends `event.id`. Store processed event IDs in a `stripe_events` table:
  `(id text primary key, processed_at timestamptz default now())`.
- On webhook: `INSERT ... ON CONFLICT DO NOTHING`. If no row inserted, event was already processed → return 200.

### Routes
- `POST /api/billing/checkout` — authed
- `POST /api/billing/portal` — authed
- `POST /webhooks/stripe` — public, signature-verified

### Stripe setup (document in docs/)
- One Product in Stripe: "Pulse Pro"
- One Price: $19/month recurring
- Webhook endpoint registered with these events:
  `checkout.session.completed, customer.subscription.deleted, invoice.payment_failed`

---

## Frontend (Nuxt)

### `app/pages/dashboard/billing.vue`
- Shows current plan, list of features per tier (matrix).
- "Upgrade to Pro" button → calls `POST /api/billing/checkout`, redirects to returned URL.
- "Manage subscription" → calls `POST /api/billing/portal`, redirects.

### Downgrade UX
- If plan becomes Free and org has > 3 services, show a banner: "You exceed the Free
  limit. Pick 3 services to keep active."
- Implement as a dedicated page `/dashboard/billing/downgrade` with a service picker.

---

## DO NOT
- Don't trust the frontend to set the plan. Plan changes only via webhook.
- Don't skip signature verification on the webhook. Use `webhook.ConstructEvent`.
- Don't delete services on downgrade. Mark `is_active = false`.
- Don't enqueue checks for services on a past_due account.
