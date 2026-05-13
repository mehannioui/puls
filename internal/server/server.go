package server

import (
	"database/sql"

	sqlcdb "github.com/mehannioui/pulse/db/sqlc"
	"github.com/mehannioui/pulse/internal/orgs"
)

// Server holds shared dependencies for all HTTP handlers.
type Server struct {
	orgsHandler *orgs.Handler
	jwtSecret   string
}

// New constructs a Server wired to db and the given JWT secret.
func New(db *sql.DB, jwtSecret string) *Server {
	q := sqlcdb.New(db)
	orgSvc := orgs.NewService(q)
	return &Server{
		orgsHandler: orgs.NewHandler(orgSvc),
		jwtSecret:   jwtSecret,
	}
}
