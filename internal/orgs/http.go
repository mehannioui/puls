package orgs

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

// Handler exposes org endpoints.
type Handler struct {
	svc *Service
}

// NewHandler constructs an HTTP handler backed by svc.
func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

// CreateOrg handles POST /api/orgs.
func (h *Handler) CreateOrg(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Name string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Name == "" {
		http.Error(w, "name is required", http.StatusBadRequest)
		return
	}

	org, err := h.svc.CreateOrg(r.Context(), body.Name)
	if err != nil {
		slog.Error("create org", "err", err)
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(org)
}

// ListOrgs handles GET /api/orgs.
func (h *Handler) ListOrgs(w http.ResponseWriter, r *http.Request) {
	orgs, err := h.svc.ListOrgsForUser(r.Context())
	if err != nil {
		slog.Error("list orgs", "err", err)
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(orgs)
}

// SwitchOrg handles POST /api/orgs/{id}/switch.
func (h *Handler) SwitchOrg(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid org id", http.StatusBadRequest)
		return
	}

	if err := h.svc.SwitchOrg(r.Context(), id); err != nil {
		if errors.Is(err, ErrForbidden) {
			http.Error(w, "forbidden", http.StatusForbidden)
			return
		}
		slog.Error("switch org", "err", err)
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
