package auth

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type contextKey string

const (
	ctxUserID contextKey = "user_id"
	ctxOrgID  contextKey = "org_id"
)

type claims struct {
	jwt.RegisteredClaims
	OrgID string `json:"org_id"`
}

// Middleware validates a Supabase-issued HS256 JWT and puts user_id + org_id on the context.
func Middleware(secret string) func(http.Handler) http.Handler {
	key := []byte(secret)
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token := extractBearer(r)
			if token == "" {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}

			c, err := parseJWT(token, key)
			if err != nil {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}

			userID, err := uuid.Parse(c.Subject)
			if err != nil {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), ctxUserID, userID)
			if c.OrgID != "" {
				if orgID, err := uuid.Parse(c.OrgID); err == nil {
					ctx = context.WithValue(ctx, ctxOrgID, orgID)
				}
			}

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// UserID extracts the authenticated user's UUID from the context.
func UserID(ctx context.Context) (uuid.UUID, bool) {
	v, ok := ctx.Value(ctxUserID).(uuid.UUID)
	return v, ok
}

// OrgID extracts the active org UUID from the context.
func OrgID(ctx context.Context) (uuid.UUID, bool) {
	v, ok := ctx.Value(ctxOrgID).(uuid.UUID)
	return v, ok
}

func extractBearer(r *http.Request) string {
	h := r.Header.Get("Authorization")
	if !strings.HasPrefix(h, "Bearer ") {
		return ""
	}
	return strings.TrimPrefix(h, "Bearer ")
}

func parseJWT(tokenStr string, key []byte) (*claims, error) {
	tok, err := jwt.ParseWithClaims(tokenStr, &claims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return key, nil
	})
	if err != nil {
		return nil, fmt.Errorf("parse jwt: %w", err)
	}
	c, ok := tok.Claims.(*claims)
	if !ok || !tok.Valid {
		return nil, fmt.Errorf("invalid claims")
	}
	return c, nil
}
