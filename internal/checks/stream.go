package checks

import (
	"sync"
	"time"

	"github.com/google/uuid"
)

// Event is the payload sent to SSE subscribers on each completed check.
type Event struct {
	ServiceID  uuid.UUID `json:"service_id"`
	OrgID      uuid.UUID `json:"org_id"`
	OK         bool      `json:"ok"`
	StatusCode int       `json:"status_code"`
	ResponseMS int       `json:"response_ms"`
	CheckedAt  time.Time `json:"checked_at"`
}

// Hub is an in-process pub/sub broker keyed by org_id.
// The Postgres LISTEN goroutine publishes events; SSE handlers subscribe per org.
type Hub struct {
	mu   sync.RWMutex
	subs map[uuid.UUID][]chan Event
}

// NewHub creates a Hub.
func NewHub() *Hub {
	return &Hub{subs: make(map[uuid.UUID][]chan Event)}
}

// Subscribe returns a buffered channel that receives events for orgID.
func (h *Hub) Subscribe(orgID uuid.UUID) chan Event {
	ch := make(chan Event, 16)
	h.mu.Lock()
	h.subs[orgID] = append(h.subs[orgID], ch)
	h.mu.Unlock()
	return ch
}

// Unsubscribe removes ch from orgID's subscriber list and closes it.
func (h *Hub) Unsubscribe(orgID uuid.UUID, ch chan Event) {
	h.mu.Lock()
	defer h.mu.Unlock()
	list := h.subs[orgID]
	for i, c := range list {
		if c == ch {
			h.subs[orgID] = append(list[:i], list[i+1:]...)
			close(ch)
			return
		}
	}
}

// Publish sends e to all subscribers of e.OrgID. Slow consumers are skipped.
func (h *Hub) Publish(e Event) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	for _, ch := range h.subs[e.OrgID] {
		select {
		case ch <- e:
		default:
		}
	}
}
