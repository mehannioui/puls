package checks

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	sqlcdb "github.com/mehannioui/pulse/db/sqlc"
	"github.com/mehannioui/pulse/internal/auth"
)

// Handler exposes SSE streaming and check result history endpoints.
type Handler struct {
	hub    *Hub
	q      *sqlcdb.Queries
	jwtKey []byte
}

// NewHandler creates a Handler.
func NewHandler(hub *Hub, q *sqlcdb.Queries, jwtSecret string) *Handler {
	return &Handler{hub: hub, q: q, jwtKey: []byte(jwtSecret)}
}

// resultResponse is the clean JSON representation of a check result row.
type resultResponse struct {
	ID         int64     `json:"id"`
	ServiceID  uuid.UUID `json:"service_id"`
	OrgID      uuid.UUID `json:"org_id"`
	CheckedAt  time.Time `json:"checked_at"`
	OK         bool      `json:"ok"`
	StatusCode *int32    `json:"status_code"`
	ResponseMS *int32    `json:"response_ms"`
	Error      *string   `json:"error"`
}

func toResultResponse(r sqlcdb.CheckResult) resultResponse {
	resp := resultResponse{
		ID:        r.ID,
		ServiceID: r.ServiceID,
		OrgID:     r.OrgID,
		CheckedAt: r.CheckedAt,
		OK:        r.Ok,
	}
	if r.StatusCode.Valid {
		resp.StatusCode = &r.StatusCode.Int32
	}
	if r.ResponseMs.Valid {
		resp.ResponseMS = &r.ResponseMs.Int32
	}
	if r.Error.Valid {
		resp.Error = &r.Error.String
	}
	return resp
}

// Stream is GET /api/stream?token=<jwt>
// Auth via query param because EventSource doesn't support custom request headers.
func (h *Handler) Stream(w http.ResponseWriter, r *http.Request) {
	orgID, err := h.orgIDFromToken(r.URL.Query().Get("token"))
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "streaming unsupported", http.StatusInternalServerError)
		return
	}

	ch := h.hub.Subscribe(orgID)
	defer h.hub.Unsubscribe(orgID, ch)

	keepalive := time.NewTicker(25 * time.Second)
	defer keepalive.Stop()

	for {
		select {
		case <-r.Context().Done():
			return
		case e, ok := <-ch:
			if !ok {
				return
			}
			data, _ := json.Marshal(e)
			fmt.Fprintf(w, "event: check\ndata: %s\n\n", data)
			flusher.Flush()
		case <-keepalive.C:
			fmt.Fprintf(w, ":\n\n")
			flusher.Flush()
		}
	}
}

// ListResults is GET /api/services/{id}/results
// Query params: range=24h → last 24h ordered ASC; default → last 60 results ordered ASC.
func (h *Handler) ListResults(w http.ResponseWriter, r *http.Request) {
	serviceID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid service id", http.StatusBadRequest)
		return
	}
	orgID, ok := auth.OrgID(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	ctx := r.Context()
	var rows []sqlcdb.CheckResult

	if r.URL.Query().Get("range") == "24h" {
		since := time.Now().UTC().Add(-24 * time.Hour)
		rows, err = h.q.GetResultsSince(ctx, sqlcdb.GetResultsSinceParams{
			ServiceID: serviceID,
			OrgID:     orgID,
			Since:     since,
		})
	} else {
		rows, err = h.q.GetRecentResults(ctx, sqlcdb.GetRecentResultsParams{
			ServiceID:  serviceID,
			OrgID:      orgID,
			LimitCount: 60,
		})
		// GetRecentResults returns DESC; reverse to ASC for consistent chart rendering.
		for i, j := 0, len(rows)-1; i < j; i, j = i+1, j-1 {
			rows[i], rows[j] = rows[j], rows[i]
		}
	}
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	resp := make([]resultResponse, len(rows))
	for i, row := range rows {
		resp[i] = toResultResponse(row)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

type streamClaims struct {
	jwt.RegisteredClaims
	OrgID string `json:"org_id"`
}

func (h *Handler) orgIDFromToken(tokenStr string) (uuid.UUID, error) {
	if tokenStr == "" {
		return uuid.UUID{}, fmt.Errorf("missing token")
	}
	tok, err := jwt.ParseWithClaims(tokenStr, &streamClaims{}, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected alg %v", t.Header["alg"])
		}
		return h.jwtKey, nil
	})
	if err != nil {
		return uuid.UUID{}, err
	}
	c, ok := tok.Claims.(*streamClaims)
	if !ok || !tok.Valid || c.OrgID == "" {
		return uuid.UUID{}, fmt.Errorf("missing org_id claim")
	}
	return uuid.Parse(c.OrgID)
}
