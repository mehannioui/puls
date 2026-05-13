# Pulse — Web (Nuxt 4) Context

Applies inside `web/`. Root `CLAUDE.md` still governs the overall project.

---

## Stack
- Nuxt 4, Vue 3 `<script setup>`, TypeScript strict
- Pinia for cross-page state
- Tailwind CSS — no scoped `<style>` blocks
- `@nuxtjs/supabase` for Auth + Realtime only (no direct DB)

## Source layout (`web/app/` is the srcDir)
```
app/
├── pages/          # file-based routing
├── components/     # PascalCase, auto-imported
├── composables/    # useFoo.ts, auto-imported
│   └── api/        # useApi() and per-resource wrappers
├── stores/         # Pinia — defineStore('name', ...)
└── middleware/     # tenant.global.ts, auth.ts
```

## Rules

### Components
- `<script setup lang="ts">` on every component, no exceptions.
- Props: `defineProps<{ foo: string }>()`. Emits: `defineEmits<{ change: [val: string] }>()`.
- Split if > 200 lines.

### Data fetching
- Pages: `useFetch` / `useAsyncData` with explicit keys.
- Never `$fetch` directly in a component — go through `useApi()`.
- Never call Supabase DB from Nuxt. Only `useSupabaseClient()` for Auth + Realtime.
- No fetching in `mounted()` — use `useAsyncData` for SSR-correct hydration.

### State
- Server data → `useAsyncData`. Cross-page state → Pinia. Local → `ref`/`reactive`.
- No global event bus. Props down, emits up, or Pinia.

### Routing
- `app/middleware/tenant.global.ts` resolves subdomain → tenant slug.
- Protected pages: `definePageMeta({ middleware: 'auth' })`.

### TypeScript
- No `any` without a comment explaining why.
- No direct `localStorage` access — wrap in a composable (SSR safety).

## DO NOT
- No Supabase DB queries from Nuxt. Auth + Realtime only.
- No `<style scoped>` unless Tailwind genuinely can't express it.
- No secrets or API keys in `web/`. All third-party calls go through the Go backend.
