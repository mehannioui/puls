package checks

import (
	"context"
	"errors"
	"fmt"
	"net"
	"net/http"
	"strings"
	"time"

	sqlcdb "github.com/mehannioui/pulse/db/sqlc"
)

// Result is the outcome of a single HTTP check.
type Result struct {
	OK         bool
	StatusCode int
	ResponseMS int
	Error      string
}

// Client performs HTTP checks. It holds a shared transport for TLS session reuse.
type Client struct {
	transport *http.Transport
}

// NewClient creates an HTTP check Client.
func NewClient() *Client {
	return &Client{
		transport: &http.Transport{
			MaxIdleConns:        100,
			MaxIdleConnsPerHost: 10,
			IdleConnTimeout:     90 * time.Second,
		},
	}
}

// Check performs one HTTP request against svc and returns the result.
func (c *Client) Check(ctx context.Context, svc sqlcdb.Service) Result {
	timeout := time.Duration(svc.TimeoutSeconds) * time.Second
	if timeout <= 0 {
		timeout = 30 * time.Second
	}

	hc := &http.Client{
		Transport: c.transport,
		Timeout:   timeout,
		CheckRedirect: func(_ *http.Request, via []*http.Request) error {
			if len(via) >= 5 {
				return http.ErrUseLastResponse
			}
			return nil
		},
	}

	req, err := http.NewRequestWithContext(ctx, svc.Method, svc.Url, nil)
	if err != nil {
		return Result{OK: false, Error: fmt.Sprintf("request: %s", err)}
	}

	start := time.Now()
	resp, err := hc.Do(req)
	responseMS := int(time.Since(start).Milliseconds())

	if err != nil {
		return Result{OK: false, ResponseMS: responseMS, Error: classifyError(err)}
	}
	defer resp.Body.Close()

	if resp.StatusCode != int(svc.ExpectedStatus) {
		return Result{
			OK:         false,
			StatusCode: resp.StatusCode,
			ResponseMS: responseMS,
			Error:      "status mismatch",
		}
	}

	return Result{
		OK:         true,
		StatusCode: resp.StatusCode,
		ResponseMS: responseMS,
	}
}

func classifyError(err error) string {
	var dnsErr *net.DNSError
	if errors.As(err, &dnsErr) {
		return "dns: " + dnsErr.Error()
	}
	s := err.Error()
	if strings.Contains(s, "tls:") || strings.Contains(s, "certificate") || strings.Contains(s, "x509") {
		return "tls: " + s
	}
	return s
}
