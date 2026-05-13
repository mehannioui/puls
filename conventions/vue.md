# Vue / Nuxt conventions

## File layout (Nuxt 4 — `web/app/` is the srcDir)
- Pages: `app/pages/`. File-based routing. Use `<NuxtPage />` not `<NuxtWelcome />`.
- Components: `app/components/`. PascalCase filenames. Auto-imported.
- Composables: `app/composables/`. `useFoo.ts` named exports. Auto-imported.
- Stores: `app/stores/`. Pinia. `defineStore('name', ...)`.
- API calls: `app/composables/api/`. Wrap `$fetch` once; never call `$fetch` in components.

## Components
- `<script setup lang="ts">` always.
- Props typed via `defineProps<{ foo: string }>()`.
- Emits typed via `defineEmits<{ change: [value: string] }>()`.
- One concern per component. If it's > 200 lines, split it.
- Tailwind for styling. No scoped `<style>` blocks unless absolutely needed.

## State
- Server data: `useFetch` / `useAsyncData` in pages. Keys explicit.
- Cross-page client state: Pinia store.
- Component-local state: `ref` / `reactive` inline.
- No global event bus. Use props down, emits up, or Pinia.

## API access
- Never call Supabase DB directly from Nuxt. Only `useSupabaseClient` for Auth + Realtime.
- All data flows through the Go API via `$fetch` with the JWT attached.
- Wrap the API base + auth header in one composable: `useApi()`.

## Routing
- Subdomain routing handled by `app/middleware/tenant.global.ts` — reads `useRequestHeaders().host`.
- Protected pages use `definePageMeta({ middleware: 'auth' })`.

## What we don't do
- No `any` in TS without justification.
- No `<style scoped>` unless Tailwind can't express the case.
- No fetching in `mounted()`. Use `useAsyncData` for SSR-correct hydration.
- No direct `localStorage` access — wrap in a composable so it's SSR-safe.
