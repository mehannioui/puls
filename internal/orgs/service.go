package orgs

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"strings"

	"github.com/google/uuid"
	"github.com/mehannioui/pulse/internal/auth"
	sqlcdb "github.com/mehannioui/pulse/db/sqlc"
)

var (
	ErrForbidden = errors.New("forbidden")
	slugClean    = regexp.MustCompile(`[^a-z0-9-]+`)
)

// Org is the public representation returned by the service layer.
type Org struct {
	ID   uuid.UUID `json:"id"`
	Slug string    `json:"slug"`
	Name string    `json:"name"`
	Plan string    `json:"plan"`
}

// Service handles org business logic.
type Service struct {
	repo *repo
}

// NewService constructs a Service backed by the given sqlc Queries.
func NewService(q *sqlcdb.Queries) *Service {
	return &Service{repo: newRepo(q)}
}

// CreateOrg creates a new org and adds the calling user as owner.
// The org gets a URL-safe slug derived from name.
func (s *Service) CreateOrg(ctx context.Context, name string) (Org, error) {
	userID, ok := auth.UserID(ctx)
	if !ok {
		return Org{}, fmt.Errorf("creating org: no authenticated user")
	}

	org, err := s.repo.createOrg(ctx, toSlug(name), name)
	if err != nil {
		return Org{}, fmt.Errorf("creating org: %w", err)
	}

	if err := s.repo.addMember(ctx, org.ID, userID, "owner", true); err != nil {
		return Org{}, fmt.Errorf("adding org member: %w", err)
	}

	return toOrg(org), nil
}

// ListOrgsForUser returns all orgs the calling user belongs to.
func (s *Service) ListOrgsForUser(ctx context.Context) ([]Org, error) {
	userID, ok := auth.UserID(ctx)
	if !ok {
		return nil, fmt.Errorf("listing orgs: no authenticated user")
	}

	rows, err := s.repo.listForUser(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("listing orgs: %w", err)
	}

	orgs := make([]Org, len(rows))
	for i, r := range rows {
		orgs[i] = toOrg(r)
	}
	return orgs, nil
}

// SwitchOrg marks orgID as the user's active org so the next JWT refresh picks it up.
func (s *Service) SwitchOrg(ctx context.Context, orgID uuid.UUID) error {
	userID, ok := auth.UserID(ctx)
	if !ok {
		return fmt.Errorf("switching org: no authenticated user")
	}

	ok, err := s.repo.isMember(ctx, orgID, userID)
	if err != nil {
		return fmt.Errorf("checking membership: %w", err)
	}
	if !ok {
		return ErrForbidden
	}

	if err := s.repo.setDefault(ctx, orgID, userID); err != nil {
		return fmt.Errorf("setting default org: %w", err)
	}
	return nil
}

func toOrg(o sqlcdb.Org) Org {
	return Org{ID: o.ID, Slug: o.Slug, Name: o.Name, Plan: o.Plan}
}

func toSlug(name string) string {
	s := strings.ToLower(strings.TrimSpace(name))
	s = strings.ReplaceAll(s, " ", "-")
	s = slugClean.ReplaceAllString(s, "")
	if s == "" {
		s = "org"
	}
	return s
}
