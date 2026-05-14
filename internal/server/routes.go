package server

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/mehannioui/pulse/internal/auth"
)

// Routes builds and returns the full HTTP router.
func (s *Server) Routes() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	// Public — no auth, rate-limited at 60 req/min per IP
	r.Get("/public/status", s.statusHandler.GetStatus)

	// SSE stream — auth via ?token= query param (EventSource can't set headers)
	r.Get("/api/stream", s.checksHandler.Stream)

	r.Group(func(r chi.Router) {
		r.Use(auth.Middleware(s.jwtSecret))

		r.Get("/api/orgs", s.orgsHandler.ListOrgs)
		r.Post("/api/orgs", s.orgsHandler.CreateOrg)
		r.Post("/api/orgs/{id}/switch", s.orgsHandler.SwitchOrg)

		r.Get("/api/services", s.servicesHandler.ListServices)
		r.Post("/api/services", s.servicesHandler.CreateService)
		r.Get("/api/services/{id}", s.servicesHandler.GetService)
		r.Patch("/api/services/{id}", s.servicesHandler.UpdateService)
		r.Delete("/api/services/{id}", s.servicesHandler.DeleteService)

		r.Get("/api/services/{id}/results", s.checksHandler.ListResults)
	})

	return r
}
