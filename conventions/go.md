# Go conventions

Tight rules. Read before writing Go in this project.

## Package layout
- One package per `internal/<name>/` directory.
- Public API in `service.go` (or named file). Wire types in `types.go`. SQL adapter in `repo.go`.
- No `util/` or `common/` packages. Put helpers where they're used.

## Dependencies
- Pass dependencies via struct, not globals. Constructor takes the deps it needs.
- `New(...) *T` constructors. No `Init()` patterns.
- Pass `context.Context` as the first param to anything that does I/O.

## Errors
- Wrap with `fmt.Errorf("doing X: %w", err)`. No bare `return err` at boundaries — add context.
- Sentinel errors with `var ErrNotFound = errors.New("not found")`. Check with `errors.Is`.
- Don't log + return — pick one. Library code returns; HTTP handlers log + respond.

## HTTP handlers
- Live in `internal/<feature>/http.go` as methods on the feature struct.
- Routes registered in `internal/server/routes.go` only. No route registration scattered elsewhere.
- Request shape: decode → validate → call service → respond. Keep handlers thin.

## Database
- Repository pattern over `*pgxpool.Pool`. One repo struct per feature.
- All queries go through sqlc. No ad-hoc `db.Query(...)`.
- Every insert/update on a tenant table must include `org_id`. RLS doesn't save you in the worker.

## Concurrency
- Don't goroutine fire-and-forget. Use `errgroup.Group` or River jobs.
- `context.Context` for cancellation. Respect `ctx.Done()` in loops.
- No mutexes if a channel works. No channels if a mutex works.

## Logging
- `log/slog` only. Structured fields, not Printf.
- Levels: `Debug` (dev only), `Info` (lifecycle), `Warn` (recoverable), `Error` (action needed).
- Never log secrets, JWTs, or raw request bodies.

## What we don't do
- No `any` (interface{}) without a one-line comment explaining why.
- No init() functions. Explicit setup in `main.go`.
- No package-level mutable state.
- No naked returns in functions longer than ~5 lines.
