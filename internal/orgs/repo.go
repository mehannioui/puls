package orgs

import (
	"context"

	"github.com/google/uuid"
	sqlcdb "github.com/mehannioui/pulse/db/sqlc"
)

type repo struct {
	q *sqlcdb.Queries
}

func newRepo(q *sqlcdb.Queries) *repo {
	return &repo{q: q}
}

func (r *repo) createOrg(ctx context.Context, slug, name string) (sqlcdb.Org, error) {
	return r.q.CreateOrg(ctx, sqlcdb.CreateOrgParams{
		Slug: slug,
		Name: name,
		Plan: "free",
	})
}

func (r *repo) addMember(ctx context.Context, orgID, userID uuid.UUID, role string, isDefault bool) error {
	return r.q.AddOrgMember(ctx, sqlcdb.AddOrgMemberParams{
		OrgID:     orgID,
		UserID:    userID,
		Role:      role,
		IsDefault: isDefault,
	})
}

func (r *repo) listForUser(ctx context.Context, userID uuid.UUID) ([]sqlcdb.Org, error) {
	return r.q.GetOrgsForUser(ctx, userID)
}

func (r *repo) isMember(ctx context.Context, orgID, userID uuid.UUID) (bool, error) {
	return r.q.IsMember(ctx, sqlcdb.IsMemberParams{OrgID: orgID, UserID: userID})
}

func (r *repo) setDefault(ctx context.Context, orgID, userID uuid.UUID) error {
	return r.q.SetDefaultOrg(ctx, sqlcdb.SetDefaultOrgParams{OrgID: orgID, UserID: userID})
}
