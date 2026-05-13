package status

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

func (r *repo) getOrgBySlug(ctx context.Context, slug string) (sqlcdb.Org, error) {
	return r.q.GetOrgBySlug(ctx, slug)
}

func (r *repo) listPublicServices(ctx context.Context, orgID uuid.UUID) ([]sqlcdb.ListPublicServicesRow, error) {
	return r.q.ListPublicServices(ctx, orgID)
}

func (r *repo) getServiceLastCheck(ctx context.Context, serviceID uuid.UUID) (sqlcdb.GetServiceLastCheckRow, error) {
	return r.q.GetServiceLastCheck(ctx, serviceID)
}

func (r *repo) getServiceUptime30d(ctx context.Context, serviceID uuid.UUID) (float64, error) {
	return r.q.GetServiceUptime30d(ctx, serviceID)
}

func (r *repo) getServiceDailyUptime(ctx context.Context, serviceID uuid.UUID) ([]sqlcdb.GetServiceDailyUptimeRow, error) {
	return r.q.GetServiceDailyUptime(ctx, serviceID)
}

func (r *repo) listPublicIncidents(ctx context.Context, orgID uuid.UUID) ([]sqlcdb.ListPublicIncidentsRow, error) {
	return r.q.ListPublicIncidents(ctx, orgID)
}

func (r *repo) listIncidentUpdates(ctx context.Context, incidentID uuid.UUID) ([]sqlcdb.IncidentUpdate, error) {
	return r.q.ListIncidentUpdatesByIncident(ctx, incidentID)
}
