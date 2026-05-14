package main

import (
	"context"
	"database/sql"
	"log"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jackc/pgx/v5/stdlib"
	"github.com/joho/godotenv"
	"github.com/riverqueue/river"
	"github.com/riverqueue/river/riverdriver/riverpgxv5"
	"github.com/riverqueue/river/rivermigrate"
	sqlcdb "github.com/mehannioui/pulse/db/sqlc"
	"github.com/mehannioui/pulse/internal/checks"
)

const (
	maxParallelChecks = 50
	shutdownTimeout   = 10 * time.Second
)

func main() {
	if os.Getenv("APP_ENV") != "production" {
		_ = godotenv.Load()
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	ctx := context.Background()

	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		log.Fatalf("create pool: %v", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		log.Fatalf("ping db: %v", err)
	}
	slog.Info("database connected")

	// Run River schema migrations so the worker can always boot cleanly.
	migrator, err := rivermigrate.New(riverpgxv5.New(pool), nil)
	if err != nil {
		log.Fatalf("river migrator: %v", err)
	}
	if _, err := migrator.Migrate(ctx, rivermigrate.DirectionUp, nil); err != nil {
		log.Fatalf("river migrate: %v", err)
	}
	slog.Info("river migrations applied")

	// sql.DB backed by the same pool, for sqlc queries and pg_notify.
	sqlDB := sql.OpenDB(stdlib.GetPoolConnector(pool))
	defer sqlDB.Close()

	q := sqlcdb.New(sqlDB)
	httpClient := checks.NewClient()

	workers := river.NewWorkers()
	checkWorker := checks.NewCheckWorker(sqlDB, httpClient, slog.Default())
	river.AddWorker(workers, checkWorker)

	riverClient, err := river.NewClient(riverpgxv5.New(pool), &river.Config{
		Queues: map[string]river.QueueConfig{
			river.QueueDefault: {MaxWorkers: maxParallelChecks},
		},
		Workers: workers,
	})
	if err != nil {
		log.Fatalf("river client: %v", err)
	}

	scheduler := checks.NewScheduler(riverClient, q, slog.Default())

	if err := riverClient.Start(ctx); err != nil {
		log.Fatalf("river start: %v", err)
	}
	slog.Info("worker started")

	scheduler.Start(ctx)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	slog.Info("worker shutting down")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)
	defer cancel()

	if err := riverClient.Stop(shutdownCtx); err != nil {
		slog.Error("river stop", "error", err)
	}
	slog.Info("worker stopped")
}
