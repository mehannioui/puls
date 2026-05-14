package checks

import (
	"context"
	"database/sql"
	"fmt"
	"log/slog"
	"sync/atomic"

	"github.com/google/uuid"
	"github.com/riverqueue/river"
)

// CheckServiceArgs are the arguments for a check_service River job.
type CheckServiceArgs struct {
	ServiceID uuid.UUID `json:"service_id"`
	OrgID     uuid.UUID `json:"org_id"`
}

func (CheckServiceArgs) Kind() string { return "check_service" }

// CheckWorker is a River worker that performs one HTTP check per job execution.
type CheckWorker struct {
	river.WorkerDefaults[CheckServiceArgs]
	repo         *repo
	client       *Client
	logger       *slog.Logger
	checksTotal  atomic.Int64
	checksFailed atomic.Int64
}

// NewCheckWorker creates a CheckWorker wired to the given dependencies.
func NewCheckWorker(db *sql.DB, client *Client, logger *slog.Logger) *CheckWorker {
	return &CheckWorker{
		repo:   newRepoWithDB(db),
		client: client,
		logger: logger,
	}
}

// Work fetches the service, runs an HTTP check, records the result, and notifies listeners.
func (w *CheckWorker) Work(ctx context.Context, job *river.Job[CheckServiceArgs]) error {
	args := job.Args

	svc, err := w.repo.getService(ctx, args.ServiceID, args.OrgID)
	if err != nil {
		return fmt.Errorf("fetching service %s: %w", args.ServiceID, err)
	}

	prev, err := w.repo.getLastCheckResult(ctx, args.ServiceID, args.OrgID)
	if err != nil {
		w.logger.Warn("could not fetch previous check result",
			"service_id", args.ServiceID,
			"error", err,
		)
	}

	result := w.client.Check(ctx, svc)

	w.checksTotal.Add(1)
	if !result.OK {
		w.checksFailed.Add(1)
	}

	if prev != nil && prev.Ok != result.OK {
		w.logger.Warn("service status flipped",
			"service_id", args.ServiceID,
			"org_id", args.OrgID,
			"was_ok", prev.Ok,
			"now_ok", result.OK,
			"status_code", result.StatusCode,
			"response_ms", result.ResponseMS,
		)
	}

	checkedAt, err := w.repo.insertCheckResult(ctx, args.ServiceID, args.OrgID, result)
	if err != nil {
		return fmt.Errorf("inserting check result for service %s: %w", args.ServiceID, err)
	}

	if err := w.repo.notifyResult(ctx, Event{
		ServiceID:  args.ServiceID,
		OrgID:      args.OrgID,
		OK:         result.OK,
		StatusCode: result.StatusCode,
		ResponseMS: result.ResponseMS,
		CheckedAt:  checkedAt,
	}); err != nil {
		w.logger.Warn("pg_notify failed", "error", err)
	}

	w.logger.Info("check complete",
		"service_id", args.ServiceID,
		"org_id", args.OrgID,
		"ok", result.OK,
		"status_code", result.StatusCode,
		"response_ms", result.ResponseMS,
		"error", result.Error,
	)

	return nil
}

// ChecksTotal returns the total number of checks performed in this process.
func (w *CheckWorker) ChecksTotal() int64 { return w.checksTotal.Load() }

// ChecksFailed returns the number of failed checks in this process.
func (w *CheckWorker) ChecksFailed() int64 { return w.checksFailed.Load() }
