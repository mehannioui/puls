package status

import (
	"encoding/json"
	"errors"
	"net"
	"net/http"
	"time"

	sqlcdb "github.com/mehannioui/pulse/db/sqlc"
)

// Handler serves GET /public/status?slug=<slug>.
type Handler struct {
	svc *svc
	rl  *ipRateLimiter
}

// NewHandler wires up the public status handler.
func NewHandler(q *sqlcdb.Queries) *Handler {
	r := newRepo(q)
	return &Handler{
		svc: newSvc(r),
		// 60 requests per minute per IP
		rl: newIPRateLimiter(60, time.Minute),
	}
}

func (h *Handler) GetStatus(w http.ResponseWriter, r *http.Request) {
	// Rate limit by real client IP.
	ip := realIP(r)
	if !h.rl.Allow(ip) {
		http.Error(w, `{"error":"rate limit exceeded"}`, http.StatusTooManyRequests)
		return
	}

	slug := r.URL.Query().Get("slug")
	if slug == "" {
		http.Error(w, `{"error":"slug is required"}`, http.StatusBadRequest)
		return
	}

	resp, err := h.svc.getStatus(r.Context(), slug)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			http.Error(w, `{"error":"not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, `{"error":"internal server error"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "public, max-age=30")
	_ = json.NewEncoder(w).Encode(resp)
}

// realIP extracts the client IP honouring X-Forwarded-For (Fly.io / Vercel set this).
func realIP(r *http.Request) string {
	if fwd := r.Header.Get("X-Forwarded-For"); fwd != "" {
		if ip, _, err := net.SplitHostPort(fwd); err == nil {
			return ip
		}
		return fwd
	}
	if ip, _, err := net.SplitHostPort(r.RemoteAddr); err == nil {
		return ip
	}
	return r.RemoteAddr
}
