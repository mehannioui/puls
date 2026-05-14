package server

import (
	"database/sql"

	sqlcdb "github.com/mehannioui/pulse/db/sqlc"
	"github.com/mehannioui/pulse/internal/checks"
	"github.com/mehannioui/pulse/internal/orgs"
	"github.com/mehannioui/pulse/internal/services"
	"github.com/mehannioui/pulse/internal/status"
)

// Server holds shared dependencies for all HTTP handlers.
type Server struct {
	orgsHandler     *orgs.Handler
	servicesHandler *services.Handler
	statusHandler   *status.Handler
	checksHandler   *checks.Handler
	hub             *checks.Hub
	jwtSecret       string
}

// New constructs a Server wired to db, the given JWT secret, and the stream hub.
func New(db *sql.DB, jwtSecret string, hub *checks.Hub) *Server {
	q := sqlcdb.New(db)
	orgSvc := orgs.NewService(q)
	svcSvc := services.NewSvc(q)
	return &Server{
		orgsHandler:     orgs.NewHandler(orgSvc),
		servicesHandler: services.NewHandler(svcSvc),
		statusHandler:   status.NewHandler(q),
		checksHandler:   checks.NewHandler(hub, q, jwtSecret),
		hub:             hub,
		jwtSecret:       jwtSecret,
	}
}
