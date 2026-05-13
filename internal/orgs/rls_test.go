//go:build integration

package orgs_test

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"testing"

	"github.com/google/uuid"
	_ "github.com/jackc/pgx/v5/stdlib"
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

// TestRLS asserts that RLS prevents a tenant from reading another tenant's rows.
// It runs as a non-superuser role with a JWT claim pointing at orgB, then tries
// to read orgA's services — expecting zero rows back.
func TestRLS(t *testing.T) {
	ctx := context.Background()
	db := openTestDB(t)

	// Create a limited, non-owner role that is subject to RLS (ignore if already exists).
	_, _ = db.ExecContext(ctx, `CREATE ROLE rls_tester NOLOGIN`)
	if _, err := db.ExecContext(ctx, `GRANT USAGE ON SCHEMA public TO rls_tester`); err != nil {
		t.Fatalf("grant usage: %v", err)
	}
	if _, err := db.ExecContext(ctx, `GRANT SELECT, INSERT, DELETE ON ALL TABLES IN SCHEMA public TO rls_tester`); err != nil {
		t.Fatalf("grant tables: %v", err)
	}

	// Seed two orgs as superuser (bypasses RLS).
	orgA, orgB := uuid.New(), uuid.New()
	_, err := db.ExecContext(ctx,
		`INSERT INTO orgs (id, slug, name) VALUES ($1, $2, $3)`,
		orgA, "rls-test-org-a", "Org A",
	)
	if err != nil {
		t.Fatalf("insert orgA: %v", err)
	}
	_, err = db.ExecContext(ctx,
		`INSERT INTO orgs (id, slug, name) VALUES ($1, $2, $3)`,
		orgB, "rls-test-org-b", "Org B",
	)
	if err != nil {
		t.Fatalf("insert orgB: %v", err)
	}

	// Seed one service for orgA.
	_, err = db.ExecContext(ctx,
		`INSERT INTO services (org_id, name, url) VALUES ($1, $2, $3)`,
		orgA, "test-svc", "https://example.com",
	)
	if err != nil {
		t.Fatalf("insert service: %v", err)
	}

	t.Cleanup(func() {
		_, _ = db.ExecContext(ctx, `TRUNCATE services, org_members, orgs CASCADE`)
	})

	t.Run("cross-tenant read returns zero rows", func(t *testing.T) {
		tx, err := db.BeginTx(ctx, nil)
		if err != nil {
			t.Fatalf("begin tx: %v", err)
		}
		defer tx.Rollback()

		// Switch to non-owner role — now subject to RLS.
		if _, err := tx.ExecContext(ctx, `SET LOCAL ROLE rls_tester`); err != nil {
			t.Fatalf("set role: %v", err)
		}
		// JWT claims for orgB — should not see orgA's data.
		if _, err := tx.ExecContext(ctx,
			`SELECT set_config('request.jwt.claims', $1, true)`,
			fmt.Sprintf(`{"org_id": "%s"}`, orgB),
		); err != nil {
			t.Fatalf("set jwt claims: %v", err)
		}

		var count int
		if err := tx.QueryRowContext(ctx,
			`SELECT count(*) FROM services WHERE org_id = $1`, orgA,
		).Scan(&count); err != nil {
			t.Fatalf("query: %v", err)
		}
		if count != 0 {
			t.Errorf("expected 0 rows for cross-tenant read, got %d", count)
		}
	})

	t.Run("same-tenant read returns rows", func(t *testing.T) {
		tx, err := db.BeginTx(ctx, nil)
		if err != nil {
			t.Fatalf("begin tx: %v", err)
		}
		defer tx.Rollback()

		if _, err := tx.ExecContext(ctx, `SET LOCAL ROLE rls_tester`); err != nil {
			t.Fatalf("set role: %v", err)
		}
		// JWT claims for orgA — should see orgA's data.
		if _, err := tx.ExecContext(ctx,
			`SELECT set_config('request.jwt.claims', $1, true)`,
			fmt.Sprintf(`{"org_id": "%s"}`, orgA),
		); err != nil {
			t.Fatalf("set jwt claims: %v", err)
		}

		var count int
		if err := tx.QueryRowContext(ctx,
			`SELECT count(*) FROM services WHERE org_id = $1`, orgA,
		).Scan(&count); err != nil {
			t.Fatalf("query: %v", err)
		}
		if count != 1 {
			t.Errorf("expected 1 row for same-tenant read, got %d", count)
		}
	})
}
