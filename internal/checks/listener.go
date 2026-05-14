package checks

import (
	"context"
	"encoding/json"
	"log/slog"
	"time"

	"github.com/jackc/pgx/v5"
)

// RunListener connects to Postgres, listens on the check_results NOTIFY channel,
// and publishes received payloads to hub. It reconnects automatically on errors.
// Blocks until ctx is cancelled.
func RunListener(ctx context.Context, dbURL string, hub *Hub, logger *slog.Logger) {
	for {
		if err := listenOnce(ctx, dbURL, hub, logger); err != nil {
			if ctx.Err() != nil {
				return
			}
			logger.Error("pg listener error, reconnecting in 2s", "error", err)
		}
		if ctx.Err() != nil {
			return
		}
		select {
		case <-ctx.Done():
			return
		case <-time.After(2 * time.Second):
		}
	}
}

func listenOnce(ctx context.Context, dbURL string, hub *Hub, logger *slog.Logger) error {
	conn, err := pgx.Connect(ctx, dbURL)
	if err != nil {
		return err
	}
	defer conn.Close(ctx)

	if _, err := conn.Exec(ctx, "LISTEN check_results"); err != nil {
		return err
	}
	logger.Info("pg listener connected")

	for {
		n, err := conn.WaitForNotification(ctx)
		if err != nil {
			if ctx.Err() != nil {
				return nil
			}
			return err
		}

		var e Event
		if err := json.Unmarshal([]byte(n.Payload), &e); err != nil {
			logger.Warn("listener: bad notify payload", "payload", n.Payload, "error", err)
			continue
		}
		hub.Publish(e)
	}
}
