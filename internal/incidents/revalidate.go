// Package incidents owns incident lifecycle helpers.
// Full CRUD (task-09) lives here when scheduled.
package incidents

import (
	"bytes"
	"context"
	"fmt"
	"net/http"
	"net/url"
	"time"
)

// RevalidateConfig holds the secrets needed to trigger Vercel ISR.
type RevalidateConfig struct {
	BaseURL string // e.g. "https://pulse.io"
	Secret  string // NUXT_REVALIDATE_SECRET
}

// TriggerRevalidation asks Nuxt/Vercel to rebuild the public status page
// for the given org slug. Call this after any incident state change.
//
// It fires-and-forgets with a 5s timeout; a failure only logs — it does not
// block the incident write path.
func TriggerRevalidation(ctx context.Context, cfg RevalidateConfig, slug string) error {
	if cfg.BaseURL == "" || cfg.Secret == "" {
		return nil // not configured; skip silently (local dev)
	}

	endpoint, err := url.Parse(cfg.BaseURL + "/api/revalidate")
	if err != nil {
		return fmt.Errorf("revalidate: bad base URL: %w", err)
	}
	q := endpoint.Query()
	q.Set("slug", slug)
	q.Set("secret", cfg.Secret)
	q.Set("path", "/")
	endpoint.RawQuery = q.Encode()

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint.String(), bytes.NewReader(nil))
	if err != nil {
		return fmt.Errorf("revalidate: build request: %w", err)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("revalidate: request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("revalidate: unexpected status %d", resp.StatusCode)
	}
	return nil
}
