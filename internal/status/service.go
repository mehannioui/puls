package status

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/google/uuid"
	sqlcdb "github.com/mehannioui/pulse/db/sqlc"
)

// Response is the JSON shape of GET /public/status.
type Response struct {
	Org       OrgInfo       `json:"org"`
	Services  []ServiceInfo `json:"services"`
	Incidents []IncidentInfo `json:"incidents"`
}

type OrgInfo struct {
	Slug string `json:"slug"`
	Name string `json:"name"`
}

type ServiceInfo struct {
	ID               string    `json:"id"`
	Name             string    `json:"name"`
	URL              string    `json:"url"`
	CurrentStatus    string    `json:"current_status"`    // "ok" | "down" | "unknown"
	UptimePercent30d float64   `json:"uptime_percent_30d"`
	UptimeBuckets90d []bool    `json:"uptime_buckets_90d"` // 90 elements, index 0 = oldest
}

type IncidentInfo struct {
	ID         string         `json:"id"`
	Title      string         `json:"title"`
	Status     string         `json:"status"`
	Severity   string         `json:"severity"`
	StartedAt  time.Time      `json:"started_at"`
	ResolvedAt *time.Time     `json:"resolved_at,omitempty"`
	Updates    []UpdateInfo   `json:"updates"`
}

type UpdateInfo struct {
	ID        string    `json:"id"`
	Status    string    `json:"status"`
	Body      string    `json:"body"`
	CreatedAt time.Time `json:"created_at"`
}

type svc struct {
	r *repo
}

func newSvc(r *repo) *svc {
	return &svc{r: r}
}

var ErrNotFound = errors.New("org not found")

func (s *svc) getStatus(ctx context.Context, slug string) (*Response, error) {
	org, err := s.r.getOrgBySlug(ctx, slug)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}

	services, err := s.buildServices(ctx, org.ID)
	if err != nil {
		return nil, err
	}

	incidents, err := s.buildIncidents(ctx, org.ID)
	if err != nil {
		return nil, err
	}

	return &Response{
		Org:       OrgInfo{Slug: org.Slug, Name: org.Name},
		Services:  services,
		Incidents: incidents,
	}, nil
}

func (s *svc) buildServices(ctx context.Context, orgID uuid.UUID) ([]ServiceInfo, error) {
	rows, err := s.r.listPublicServices(ctx, orgID)
	if err != nil {
		return nil, err
	}

	out := make([]ServiceInfo, 0, len(rows))
	for _, row := range rows {
		info := ServiceInfo{
			ID:   row.ID.String(),
			Name: row.Name,
			URL:  row.Url,
		}

		// Current status from most recent check.
		last, err := s.r.getServiceLastCheck(ctx, row.ID)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				info.CurrentStatus = "unknown"
			} else {
				return nil, err
			}
		} else {
			if last.Ok {
				info.CurrentStatus = "ok"
			} else {
				info.CurrentStatus = "down"
			}
		}

		// 30-day uptime %.
		pct, err := s.r.getServiceUptime30d(ctx, row.ID)
		if err != nil {
			return nil, err
		}
		info.UptimePercent30d = pct

		// 90-day buckets.
		info.UptimeBuckets90d = buildBuckets(ctx, s.r, row.ID)

		out = append(out, info)
	}
	return out, nil
}

// buildBuckets returns a 90-element bool slice (index 0 = oldest day).
// Days with no data are represented as false (no data = unknown, shown as empty).
func buildBuckets(_ context.Context, r *repo, serviceID uuid.UUID) []bool {
	buckets := make([]bool, 90)

	rows, err := r.getServiceDailyUptime(context.Background(), serviceID)
	if err != nil || len(rows) == 0 {
		return buckets
	}

	today := time.Now().UTC().Truncate(24 * time.Hour)
	// Index each row by how many days ago it is.
	dailyMap := make(map[int]sqlcdb.GetServiceDailyUptimeRow, len(rows))
	for _, row := range rows {
		day := row.Day.UTC().Truncate(24 * time.Hour)
		daysAgo := int(today.Sub(day).Hours() / 24)
		if daysAgo >= 0 && daysAgo < 90 {
			dailyMap[daysAgo] = row
		}
	}

	for i := 0; i < 90; i++ {
		daysAgo := 89 - i // index 0 = 89 days ago, index 89 = today
		if row, ok := dailyMap[daysAgo]; ok {
			buckets[i] = row.OkCount == row.TotalCount && row.TotalCount > 0
		}
	}
	return buckets
}

func (s *svc) buildIncidents(ctx context.Context, orgID uuid.UUID) ([]IncidentInfo, error) {
	incidents, err := s.r.listPublicIncidents(ctx, orgID)
	if err != nil {
		return nil, err
	}

	out := make([]IncidentInfo, 0, len(incidents))
	for _, inc := range incidents {
		info := IncidentInfo{
			ID:        inc.ID.String(),
			Title:     inc.Title,
			Status:    inc.Status,
			Severity:  inc.Severity,
			StartedAt: inc.StartedAt,
		}
		if inc.ResolvedAt.Valid {
			t := inc.ResolvedAt.Time
			info.ResolvedAt = &t
		}

		updates, err := s.r.listIncidentUpdates(ctx, inc.ID)
		if err != nil {
			return nil, err
		}
		for _, u := range updates {
			info.Updates = append(info.Updates, UpdateInfo{
				ID:        u.ID.String(),
				Status:    u.Status,
				Body:      u.Body,
				CreatedAt: u.CreatedAt,
			})
		}
		out = append(out, info)
	}
	return out, nil
}
