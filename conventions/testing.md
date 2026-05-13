# Testing conventions

## Go
- `_test.go` next to the code under test. Same package.
- Table-driven where the cases are similar. Subtests via `t.Run(name, ...)`.
- One assertion library: stdlib `testing`. No testify unless we adopt it deliberately.
- Use `t.Helper()` in helpers. Use `t.Cleanup()` for teardown, not `defer`.
- Run with `-race`. `go test ./... -race -count=1` is the command.

## Integration tests (Go)
- Hit a real Postgres. Spin up via `docker-compose` or `testcontainers-go`.
- Reset state per test with `TRUNCATE ... CASCADE` in a `t.Cleanup`. No shared fixtures.
- Tag with `//go:build integration` so unit tests stay fast.

## Frontend (Vitest)
- Component tests: `*.test.ts` next to the component.
- Mock the API layer (`useApi`), not `$fetch`. Test the component, not the network.
- E2E (Playwright) for critical flows only: signup → add service → see status. Don't E2E everything.

## What we test
- Public package APIs in Go (the exported functions).
- HTTP handlers via `httptest`. Real router, fake auth.
- Components that own logic (forms, charts). Skip pure-render components.
- Critical user flows end-to-end.

## What we don't test
- Generated code (sqlc output, Nuxt-generated types).
- Trivial getters/setters.
- Implementation details (private methods, internal state).

## Coverage
- No coverage threshold gate. We aim for "what would break in production is tested."
- If a bug ships and there was no test for it, add the test in the fix PR.
