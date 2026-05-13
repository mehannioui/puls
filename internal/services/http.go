package services

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

// Handler exposes service endpoints.
type Handler struct {
	svc *Svc
}

// NewHandler constructs an HTTP handler backed by svc.
func NewHandler(svc *Svc) *Handler {
	return &Handler{svc: svc}
}

// CreateService handles POST /api/services.
func (h *Handler) CreateService(w http.ResponseWriter, r *http.Request) {
	var input CreateInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	svc, err := h.svc.Create(r.Context(), input)
	if err != nil {
		h.writeError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(svc)
}

// ListServices handles GET /api/services.
func (h *Handler) ListServices(w http.ResponseWriter, r *http.Request) {
	svcs, err := h.svc.List(r.Context())
	if err != nil {
		slog.Error("list services", "err", err)
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(svcs)
}

// GetService handles GET /api/services/{id}.
func (h *Handler) GetService(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid service id", http.StatusBadRequest)
		return
	}

	svc, err := h.svc.Get(r.Context(), id)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			http.Error(w, "not found", http.StatusNotFound)
			return
		}
		slog.Error("get service", "err", err)
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(svc)
}

// UpdateService handles PATCH /api/services/{id}.
func (h *Handler) UpdateService(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid service id", http.StatusBadRequest)
		return
	}

	var input UpdateInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	svc, err := h.svc.Update(r.Context(), id, input)
	if err != nil {
		h.writeError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(svc)
}

// DeleteService handles DELETE /api/services/{id}.
func (h *Handler) DeleteService(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid service id", http.StatusBadRequest)
		return
	}

	if err := h.svc.Delete(r.Context(), id); err != nil {
		slog.Error("delete service", "err", err)
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) writeError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, ErrPlanLimit):
		http.Error(w, err.Error(), http.StatusPaymentRequired)
	case errors.Is(err, ErrNotFound):
		http.Error(w, "not found", http.StatusNotFound)
	case errors.Is(err, ErrInvalidURL),
		errors.Is(err, ErrInvalidStatus),
		errors.Is(err, ErrInvalidMethod),
		errors.Is(err, ErrIntervalTooLow):
		http.Error(w, err.Error(), http.StatusUnprocessableEntity)
	default:
		slog.Error("service operation", "err", err)
		http.Error(w, "internal error", http.StatusInternalServerError)
	}
}
