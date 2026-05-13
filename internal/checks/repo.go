package checks

import (
	"context"
	"database/sql"
	"time"

	"github.com/google/uuid"
	sqlcdb "github.com/mehannioui/pulse/db/sqlc"
)

type repo struct {
	q *sqlcdb.Queries
}

func newRepo(q *sqlcdb.Queries) *repo {
	return &repo{q: q}
}

func (r *repo) getService(ctx context.Context, serviceID, orgID uuid.UUID) (sqlcdb.Service, error) {
	return r.q.GetService(ctx, sqlcdb.GetServiceParams{ID: serviceID, OrgID: orgID})
}

func (r *repo) listActiveServices(ctx context.Context) ([]sqlcdb.Service, error) {
	return r.q.ListActiveServices(ctx)
}

func (r *repo) getLastCheckTimes(ctx context.Context) (map[uuid.UUID]time.Time, error) {
	rows, err := r.q.GetLastCheckTimes(ctx)
	if err != nil {
		return nil, err
	}
	m := make(map[uuid.UUID]time.Time, len(rows))
	for _, row := range rows {
		m[row.ServiceID] = row.LastCheckedAt
	}
	return m, nil
}

func (r *repo) getLastCheckResult(ctx context.Context, serviceID, orgID uuid.UUID) (*sqlcdb.CheckResult, error) {
	results, err := r.q.GetRecentResults(ctx, sqlcdb.GetRecentResultsParams{
		ServiceID:  serviceID,
		OrgID:      orgID,
		LimitCount: 1,
	})
	if err != nil {
		return nil, err
	}
	if len(results) == 0 {
		return nil, nil
	}
	return &results[0], nil
}

func (r *repo) insertCheckResult(ctx context.Context, serviceID, orgID uuid.UUID, result Result) error {
	var statusCode sql.NullInt32
	if result.StatusCode != 0 {
		statusCode = sql.NullInt32{Int32: int32(result.StatusCode), Valid: true}
	}
	var errStr sql.NullString
	if result.Error != "" {
		errStr = sql.NullString{String: result.Error, Valid: true}
	}
	return r.q.InsertCheckResult(ctx, sqlcdb.InsertCheckResultParams{
		ServiceID:  serviceID,
		OrgID:      orgID,
		CheckedAt:  time.Now().UTC(),
		Ok:         result.OK,
		StatusCode: statusCode,
		ResponseMs: sql.NullInt32{Int32: int32(result.ResponseMS), Valid: true},
		Error:      errStr,
	})
}
