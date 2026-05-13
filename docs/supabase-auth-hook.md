# Supabase Auth Hook — JWT customization

## What it does
Injects `org_id` into every Supabase-issued JWT so that:
- The Go middleware can extract it without a DB round-trip.
- RLS policies (`org_id = (auth.jwt() ->> 'org_id')::uuid`) work for Supabase clients.

## One-time setup (Supabase dashboard)

1. Open **Database → Functions → New Function**.
2. Name: `add_org_id_to_jwt`, Schema: `public`, return type: `jsonb`.
3. Paste the function body below.
4. Open **Authentication → Hooks** and set **Customize Access Token** to call `public.add_org_id_to_jwt`.

```sql
CREATE OR REPLACE FUNCTION public.add_org_id_to_jwt(event jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  user_id  uuid;
  org_id   uuid;
BEGIN
  user_id := (event->>'user_id')::uuid;

  -- Pick the user's current default org; fall back to any membership.
  SELECT om.org_id INTO org_id
  FROM   org_members om
  WHERE  om.user_id = user_id
  ORDER  BY om.is_default DESC, om.created_at
  LIMIT  1;

  IF org_id IS NOT NULL THEN
    RETURN jsonb_set(event, '{claims,org_id}', to_jsonb(org_id::text));
  END IF;

  RETURN event;
END;
$$;
```

## How org switching works

1. User selects an org in the `OrgSwitcher` component.
2. `POST /api/orgs/{id}/switch` sets `is_default = true` for that org (all others set to `false`).
3. The component calls `supabase.auth.refreshSession()`.
4. Supabase issues a new JWT; the hook re-runs and writes the new `org_id`.
5. Subsequent API requests carry the updated `org_id` claim.

## Local dev

The local Postgres stub (`db/migrations/000001_init_orgs.sql`) provides a `auth.jwt()` function that reads from `request.jwt.claims`.
Set the claim in tests with `SELECT set_config('request.jwt.claims', '{"org_id":"..."}', true)`.
