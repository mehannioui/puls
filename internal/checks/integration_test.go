//go:build integration

package checks_test

import (
	"context"
	"database/sql"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/google/uuid"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/riverqueue/river"
	"github.com/riverqueue/river/rivertype"
	sqlcdb "github.com/mehannioui/pulse/db/sqlc"
	"github.com/mehannioui/pulse/internal/checks"
)

func openTestDB(t *testing.T) *sql.DB {
	t.Helper()
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgres://pulse:pulse@localhost:5432/pulse_dev"
	}
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		t.Fatalf("open db: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	if err := db.Ping(); err != nil {
		t.Fatalf("ping db: %v", err)
	}
	return db
}

// TestCheckWorkerWork verifies the full check pipeline:
// service fetch → HTTP check → check_result insert.
func TestCheckWorkerWork(t *testing.T) {
	ctx := context.Background()
	db := openTestDB(t)
	q := sqlcdb.New(db)

	// Mock HTTP server returns 200.
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	t.Cleanup(srv.Close)

	orgID := uuid.New()
	var serviceID uuid.UUID

	// Seed org and service as superuser (bypasses RLS).
	_, err := db.ExecContext(ctx,
		`INSERT INTO orgs (id, slug, name) VALUES ($1, $2, $3)`,
		orgID, "check-test-org-"+orgID.String()[:8], "Check Test Org",
	)
	if err != nil {
		t.Fatalf("insert org: %v", err)
	}

	err = db.QueryRowContext(ctx,
		`INSERT INTO services (org_id, name, url, expected_status, timeout_seconds)
		 VALUES ($1, $2, $3, 200, 5)
		 RETURNING id`,
		orgID, "test-svc", srv.URL,
	).Scan(&serviceID)
	if err != nil {
		t.Fatalf("insert service: %v", err)
	}

	t.Cleanup(func() {
		_, _ = db.ExecContext(ctx, `TRUNCATE check_results, services, org_members, orgs CASCADE`)
	})

	worker := checks.NewCheckWorker(db, checks.NewClient(), slog.Default())

	job := &river.Job[checks.CheckServiceArgs]{
		JobRow: &rivertype.JobRow{
			ID:          1,
			Kind:        "check_service",
			Attempt:     1,
			CreatedAt:   time.Now(),
			EncodedArgs: []byte(`{}`),
		},
		Args: checks.CheckServiceArgs{
			ServiceID: serviceID,
			OrgID:     orgID,
		},
	}

	if err := worker.Work(ctx, job); err != nil {
		t.Fatalf("Work: %v", err)
	}

	// Verify the result was inserted.
	results, err := q.GetRecentResults(ctx, sqlcdb.GetRecentResultsParams{
		ServiceID:  serviceID,
		OrgID:      orgID,
		LimitCount: 1,
	})
	if err != nil {
		t.Fatalf("GetRecentResults: %v", err)
	}
	if len(results) == 0 {
		t.Fatal("expected a check result to be inserted, got none")
	}

	r := results[0]
	if !r.Ok {
		t.Errorf("expected ok=true for a 200 response, got false (error: %s)", r.Error.String)
	}
	if !r.ResponseMs.Valid || r.ResponseMs.Int32 < 0 {
		t.Errorf("expected valid response_ms, got %v", r.ResponseMs)
	}
	if r.ServiceID != serviceID {
		t.Errorf("service_id mismatch: got %s, want %s", r.ServiceID, serviceID)
	}
	if r.OrgID != orgID {
		t.Errorf("org_id mismatch: got %s, want %s", r.OrgID, orgID)
	}

	if total := worker.ChecksTotal(); total != 1 {
		t.Errorf("ChecksTotal: got %d, want 1", total)
	}
	if failed := worker.ChecksFailed(); failed != 0 {
		t.Errorf("ChecksFailed: got %d, want 0", failed)
	}
}

// TestCheckWorkerWorkFailure verifies a non-2xx response produces ok=false.
func TestCheckWorkerWorkFailure(t *testing.T) {
	ctx := context.Background()
	db := openTestDB(t)
	q := sqlcdb.New(db)

	// Mock server always returns 503.
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusServiceUnavailable)
	}))
	t.Cleanup(srv.Close)

	orgID := uuid.New()
	var serviceID uuid.UUID

	_, err := db.ExecContext(ctx,
		`INSERT INTO orgs (id, slug, name) VALUES ($1, $2, $3)`,
		orgID, "fail-test-org-"+orgID.String()[:8], "Fail Test Org",
	)
	if err != nil {
		t.Fatalf("insert org: %v", err)
	}

	err = db.QueryRowContext(ctx,
		`INSERT INTO services (org_id, name, url, expected_status, timeout_seconds)
		 VALUES ($1, $2, $3, 200, 5)
		 RETURNING id`,
		orgID, "fail-svc", srv.URL,
	).Scan(&serviceID)
	if err != nil {
		t.Fatalf("insert service: %v", err)
	}

	t.Cleanup(func() {
		_, _ = db.ExecContext(ctx, `TRUNCATE check_results, services, org_members, orgs CASCADE`)
	})

	worker := checks.NewCheckWorker(db, checks.NewClient(), slog.Default())

	job := &river.Job[checks.CheckServiceArgs]{
		JobRow: &rivertype.JobRow{
			ID:          2,
			Kind:        "check_service",
			Attempt:     1,
			CreatedAt:   time.Now(),
			EncodedArgs: []byte(`{}`),
		},
		Args: checks.CheckServiceArgs{
			ServiceID: serviceID,
			OrgID:     orgID,
		},
	}

	if err := worker.Work(ctx, job); err != nil {
		t.Fatalf("Work: %v", err)
	}

	results, err := q.GetRecentResults(ctx, sqlcdb.GetRecentResultsParams{
		ServiceID:  serviceID,
		OrgID:      orgID,
		LimitCount: 1,
	})
	if err != nil {
		t.Fatalf("GetRecentResults: %v", err)
	}
	if len(results) == 0 {
		t.Fatal("expected a check result to be inserted, got none")
	}

	r := results[0]
	if r.Ok {
		t.Error("expected ok=false for a 503 response")
	}
	if !r.StatusCode.Valid || r.StatusCode.Int32 != http.StatusServiceUnavailable {
		t.Errorf("expected status_code=503, got %v", r.StatusCode)
	}

	if failed := worker.ChecksFailed(); failed != 1 {
		t.Errorf("ChecksFailed: got %d, want 1", failed)
	}
}
