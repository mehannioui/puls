package status

import (
	"sync"
	"time"
)

// ipRateLimiter is a fixed-window per-IP limiter.
// For multi-instance deployments, replace with Redis-backed sliding window.
type ipRateLimiter struct {
	mu      sync.Map
	limit   int
	window  time.Duration
}

type ipEntry struct {
	mu    sync.Mutex
	count int
	reset time.Time
}

func newIPRateLimiter(limit int, window time.Duration) *ipRateLimiter {
	return &ipRateLimiter{limit: limit, window: window}
}

// Allow returns true if the request is within the rate limit.
func (rl *ipRateLimiter) Allow(ip string) bool {
	now := time.Now()
	val, _ := rl.mu.LoadOrStore(ip, &ipEntry{reset: now.Add(rl.window)})
	e := val.(*ipEntry)
	e.mu.Lock()
	defer e.mu.Unlock()
	if now.After(e.reset) {
		e.count = 0
		e.reset = now.Add(rl.window)
	}
	e.count++
	return e.count <= rl.limit
}
