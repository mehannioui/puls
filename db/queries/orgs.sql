-- name: CreateOrg :one
INSERT INTO orgs (slug, name, plan)
VALUES (@slug, @name, @plan)
RETURNING id, slug, name, plan, stripe_customer_id, created_at, updated_at;

-- name: GetOrgBySlug :one
SELECT id, slug, name, plan, stripe_customer_id, created_at, updated_at
FROM orgs
WHERE slug = @slug;

-- name: GetOrgByID :one
SELECT id, slug, name, plan, stripe_customer_id, created_at, updated_at
FROM orgs
WHERE id = @id;

-- name: GetOrgsForUser :many
SELECT o.id, o.slug, o.name, o.plan, o.stripe_customer_id, o.created_at, o.updated_at
FROM orgs o
JOIN org_members om ON om.org_id = o.id
WHERE om.user_id = @user_id;

-- name: UpdateOrgPlan :exec
UPDATE orgs
SET plan = @plan
WHERE id = @org_id;

-- name: AddOrgMember :exec
INSERT INTO org_members (org_id, user_id, role, is_default)
VALUES (@org_id, @user_id, @role, @is_default);

-- name: SetDefaultOrg :exec
UPDATE org_members
SET is_default = (org_id = @org_id)
WHERE user_id = @user_id;

-- name: IsMember :one
SELECT EXISTS(
    SELECT 1 FROM org_members WHERE org_id = @org_id AND user_id = @user_id
) AS is_member;
