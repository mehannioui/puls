package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	sqlcdb "github.com/mehannioui/pulse/db/sqlc"
	"github.com/mehannioui/pulse/internal/auth"
	"github.com/mehannioui/pulse/internal/orgs"
)

// Service is the public representation returned by the service layer.
type Service struct {
	ID              uuid.UUID `json:"id"`
	OrgID           uuid.UUID `json:"org_id"`
	Name            string    `json:"name"`
	URL             string    `json:"url"`
	Method          string    `json:"method"`
	ExpectedStatus  int32     `json:"expected_status"`
	IntervalSeconds int32     `json:"interval_seconds"`
	TimeoutSeconds  int32     `json:"timeout_seconds"`
	IsActive        bool      `json:"is_active"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// CreateInput holds fields for creating a new monitored service.
type CreateInput struct {
	Name            string `json:"name"`
	URL             string `json:"url"`
	Method          string `json:"method"`
	ExpectedStatus  int32  `json:"expected_status"`
	IntervalSeconds int32  `json:"interval_seconds"`
	TimeoutSeconds  int32  `json:"timeout_seconds"`
}

// UpdateInput holds fields that may be changed on an existing service.
type UpdateInput struct {
	Name            string `json:"name"`
	URL             string `json:"url"`
	Method          string `json:"method"`
	ExpectedStatus  int32  `json:"expected_status"`
	IntervalSeconds int32  `json:"interval_seconds"`
	TimeoutSeconds  int32  `json:"timeout_seconds"`
	IsActive        bool   `json:"is_active"`
}

var ErrNotFound = errors.New("service not found")

// Svc handles service business logic.
type Svc struct {
	repo *repo
}

// NewSvc constructs a Svc backed by the given sqlc Queries.
func NewSvc(q *sqlcdb.Queries) *Svc {
	return &Svc{repo: newRepo(q)}
}

// Create validates input, enforces plan limits, and inserts a new service.
func (s *Svc) Create(ctx context.Context, input CreateInput) (Service, error) {
	orgID, ok := auth.OrgID(ctx)
	if !ok {
		return Service{}, fmt.Errorf("creating service: no org in context")
	}

	org, err := s.repo.getOrgByID(ctx, orgID)
	if err != nil {
		return Service{}, fmt.Errorf("creating service: fetching org: %w", err)
	}

	if err := validateCreateInput(input, org.Plan); err != nil {
		return Service{}, err
	}

	count, err := s.repo.countServices(ctx, orgID)
	if err != nil {
		return Service{}, fmt.Errorf("creating service: counting services: %w", err)
	}

	if int(count) >= orgs.MaxServices(org.Plan) {
		return Service{}, fmt.Errorf("%w: plan %q allows %d services", ErrPlanLimit, org.Plan, orgs.MaxServices(org.Plan))
	}

	row, err := s.repo.createService(ctx, sqlcdb.CreateServiceParams{
		OrgID:           orgID,
		Name:            input.Name,
		Url:             input.URL,
		Method:          input.Method,
		ExpectedStatus:  input.ExpectedStatus,
		IntervalSeconds: input.IntervalSeconds,
		TimeoutSeconds:  input.TimeoutSeconds,
	})
	if err != nil {
		return Service{}, fmt.Errorf("creating service: %w", err)
	}

	return toService(row), nil
}

// List returns all services for the calling org.
func (s *Svc) List(ctx context.Context) ([]Service, error) {
	orgID, ok := auth.OrgID(ctx)
	if !ok {
		return nil, fmt.Errorf("listing services: no org in context")
	}

	rows, err := s.repo.listServices(ctx, orgID)
	if err != nil {
		return nil, fmt.Errorf("listing services: %w", err)
	}

	out := make([]Service, len(rows))
	for i, r := range rows {
		out[i] = toService(r)
	}
	return out, nil
}

// Get returns a single service by ID, scoped to the calling org.
func (s *Svc) Get(ctx context.Context, id uuid.UUID) (Service, error) {
	orgID, ok := auth.OrgID(ctx)
	if !ok {
		return Service{}, fmt.Errorf("getting service: no org in context")
	}

	row, err := s.repo.getService(ctx, id, orgID)
	if err != nil {
		return Service{}, fmt.Errorf("getting service: %w", ErrNotFound)
	}

	return toService(row), nil
}

// Update modifies an existing service after validating input against the plan.
func (s *Svc) Update(ctx context.Context, id uuid.UUID, input UpdateInput) (Service, error) {
	orgID, ok := auth.OrgID(ctx)
	if !ok {
		return Service{}, fmt.Errorf("updating service: no org in context")
	}

	org, err := s.repo.getOrgByID(ctx, orgID)
	if err != nil {
		return Service{}, fmt.Errorf("updating service: fetching org: %w", err)
	}

	if err := validateUpdateInput(input, org.Plan); err != nil {
		return Service{}, err
	}

	row, err := s.repo.updateService(ctx, sqlcdb.UpdateServiceParams{
		ID:              id,
		OrgID:           orgID,
		Name:            input.Name,
		Url:             input.URL,
		Method:          input.Method,
		ExpectedStatus:  input.ExpectedStatus,
		IntervalSeconds: input.IntervalSeconds,
		TimeoutSeconds:  input.TimeoutSeconds,
		IsActive:        input.IsActive,
	})
	if err != nil {
		return Service{}, fmt.Errorf("updating service: %w", ErrNotFound)
	}

	return toService(row), nil
}

// Delete removes a service scoped to the calling org.
func (s *Svc) Delete(ctx context.Context, id uuid.UUID) error {
	orgID, ok := auth.OrgID(ctx)
	if !ok {
		return fmt.Errorf("deleting service: no org in context")
	}

	if err := s.repo.deleteService(ctx, id, orgID); err != nil {
		return fmt.Errorf("deleting service: %w", err)
	}

	return nil
}

func validateCreateInput(input CreateInput, plan string) error {
	if input.Name == "" {
		return fmt.Errorf("name is required")
	}
	if err := validateURL(input.URL); err != nil {
		return err
	}
	if err := validateMethod(input.Method); err != nil {
		return err
	}
	if err := validateStatus(input.ExpectedStatus); err != nil {
		return err
	}
	minInterval := int32(orgs.MinInterval(plan))
	if err := validateInterval(input.IntervalSeconds, minInterval); err != nil {
		return err
	}
	return nil
}

func validateUpdateInput(input UpdateInput, plan string) error {
	if input.Name == "" {
		return fmt.Errorf("name is required")
	}
	if err := validateURL(input.URL); err != nil {
		return err
	}
	if err := validateMethod(input.Method); err != nil {
		return err
	}
	if err := validateStatus(input.ExpectedStatus); err != nil {
		return err
	}
	minInterval := int32(orgs.MinInterval(plan))
	if err := validateInterval(input.IntervalSeconds, minInterval); err != nil {
		return err
	}
	return nil
}

func toService(r sqlcdb.Service) Service {
	return Service{
		ID:              r.ID,
		OrgID:           r.OrgID,
		Name:            r.Name,
		URL:             r.Url,
		Method:          r.Method,
		ExpectedStatus:  r.ExpectedStatus,
		IntervalSeconds: r.IntervalSeconds,
		TimeoutSeconds:  r.TimeoutSeconds,
		IsActive:        r.IsActive,
		CreatedAt:       r.CreatedAt,
		UpdatedAt:       r.UpdatedAt,
	}
}
