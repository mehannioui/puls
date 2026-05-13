package services

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

func (r *repo) countServices(ctx context.Context, orgID uuid.UUID) (int64, error) {
	return r.q.CountServices(ctx, orgID)
}

func (r *repo) createService(ctx context.Context, arg sqlcdb.CreateServiceParams) (sqlcdb.Service, error) {
	return r.q.CreateService(ctx, arg)
}

func (r *repo) listServices(ctx context.Context, orgID uuid.UUID) ([]sqlcdb.Service, error) {
	return r.q.ListServices(ctx, orgID)
}

func (r *repo) getService(ctx context.Context, id, orgID uuid.UUID) (sqlcdb.Service, error) {
	return r.q.GetService(ctx, sqlcdb.GetServiceParams{ID: id, OrgID: orgID})
}

func (r *repo) updateService(ctx context.Context, arg sqlcdb.UpdateServiceParams) (sqlcdb.Service, error) {
	return r.q.UpdateService(ctx, arg)
}

func (r *repo) deleteService(ctx context.Context, id, orgID uuid.UUID) error {
	return r.q.DeleteService(ctx, sqlcdb.DeleteServiceParams{ID: id, OrgID: orgID})
}

func (r *repo) getOrgByID(ctx context.Context, orgID uuid.UUID) (sqlcdb.Org, error) {
	return r.q.GetOrgByID(ctx, orgID)
}
