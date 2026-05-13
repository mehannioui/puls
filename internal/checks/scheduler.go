package checks

import (
	"context"
	"log/slog"
	"time"

	"github.com/riverqueue/river"
	"github.com/riverqueue/river/rivertype"
	sqlcdb "github.com/mehannioui/pulse/db/sqlc"
)

const tickInterval = 30 * time.Second

// jobInserter is the subset of river.Client needed by the Scheduler.
type jobInserter interface {
	Insert(ctx context.Context, args river.JobArgs, opts *river.InsertOpts) (*rivertype.JobInsertResult, error)
}

// Scheduler ticks every 30s and enqueues a CheckServiceArgs job for every
// active service whose last check is older than its configured interval.
type Scheduler struct {
	inserter jobInserter
	repo     *repo
	logger   *slog.Logger
}

// NewScheduler creates a Scheduler. q must be opened with the service role
// so it can query across all orgs without RLS filtering.
func NewScheduler(inserter jobInserter, q *sqlcdb.Queries, logger *slog.Logger) *Scheduler {
	return &Scheduler{
		inserter: inserter,
		repo:     newRepo(q),
		logger:   logger,
	}
}

// Start runs the scheduler loop in a goroutine. It returns when ctx is done.
func (s *Scheduler) Start(ctx context.Context) {
	go s.run(ctx)
}

func (s *Scheduler) run(ctx context.Context) {
	s.logger.Info("scheduler started")
	ticker := time.NewTicker(tickInterval)
	defer ticker.Stop()

	// Enqueue on first tick immediately so the worker doesn't wait 30s on boot.
	s.enqueue(ctx)

	for {
		select {
		case <-ctx.Done():
			s.logger.Info("scheduler stopped")
			return
		case <-ticker.C:
			s.enqueue(ctx)
		}
	}
}

func (s *Scheduler) enqueue(ctx context.Context) {
	services, err := s.repo.listActiveServices(ctx)
	if err != nil {
		s.logger.Error("scheduler: listing active services", "error", err)
		return
	}

	lastCheckTimes, err := s.repo.getLastCheckTimes(ctx)
	if err != nil {
		s.logger.Error("scheduler: fetching last check times", "error", err)
		return
	}

	now := time.Now()
	enqueued := 0

	for _, svc := range services {
		interval := time.Duration(svc.IntervalSeconds) * time.Second
		lastCheck, hasCheck := lastCheckTimes[svc.ID]
		if hasCheck && now.Sub(lastCheck) < interval {
			continue
		}

		_, err := s.inserter.Insert(ctx, CheckServiceArgs{
			ServiceID: svc.ID,
			OrgID:     svc.OrgID,
		}, nil)
		if err != nil {
			s.logger.Error("scheduler: enqueuing check",
				"service_id", svc.ID,
				"org_id", svc.OrgID,
				"error", err,
			)
			continue
		}
		enqueued++
	}

	if enqueued > 0 {
		s.logger.Info("scheduler: enqueued checks", "count", enqueued, "total_active", len(services))
	}
}
