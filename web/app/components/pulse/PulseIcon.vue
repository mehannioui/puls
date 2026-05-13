<script setup lang="ts">
const props = defineProps<{
  name: string
  size?: number
  color?: string
}>()

const icons: Record<string, string> = {
  pulse:    `<path d="M1 8 H4 L6 3 L10 13 L12 8 H15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>`,
  home:     `<path d="M2 7 L8 2 L14 7 V14 H10 V10 H6 V14 H2 Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>`,
  list:     `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M5 4h9M5 8h9M5 12h9"/><circle cx="2.5" cy="4" r=".6" fill="currentColor"/><circle cx="2.5" cy="8" r=".6" fill="currentColor"/><circle cx="2.5" cy="12" r=".6" fill="currentColor"/></g>`,
  globe:    `<g fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="5.5"/><path d="M2.5 8h11M8 2.5c2 2 2 9 0 11M8 2.5c-2 2-2 9 0 11"/></g>`,
  bell:     `<path d="M8 2 C6 2 4.5 3.5 4.5 6 V9 L3 11h10L11.5 9V6C11.5 3.5 10 2 8 2 Z M6.5 13a1.5 1.5 0 0 0 3 0" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>`,
  plug:     `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M5 2v3M11 2v3M3.5 5h9v3a4.5 4.5 0 0 1-9 0z"/><path d="M8 12.5V14.5"/></g>`,
  cog:      `<g fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="2"/><path d="M8 1.5v2M8 12.5v2M14.5 8h-2M3.5 8h-2M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4M12.6 12.6l-1.4-1.4M4.8 4.8L3.4 3.4"/></g>`,
  search:   `<g fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></g>`,
  plus:     `<path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
  arrowUp:  `<path d="M8 13V3M4 7l4-4 4 4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/>`,
  arrowDown:`<path d="M8 3v10M4 9l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/>`,
  check:    `<path d="M3 8.5l3.5 3 7-7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>`,
  copy:     `<g fill="none" stroke="currentColor" stroke-width="1.4"><rect x="5" y="5" width="9" height="9" rx="1.5"/><path d="M3 11V3a1 1 0 0 1 1-1h7"/></g>`,
  ext:      `<g fill="none" stroke="currentColor" stroke-width="1.4"><path d="M9 3h4v4M13 3l-6 6M7 4H3v9h9V9"/></g>`,
  more:     `<g fill="currentColor"><circle cx="3" cy="8" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="13" cy="8" r="1.2"/></g>`,
  filter:   `<path d="M2 3h12l-4.5 6v4l-3 1.5V9z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>`,
  bolt:     `<path d="M9 2 L3 9 H7 L7 14 L13 7 H9 Z" fill="currentColor"/>`,
  chev:     `<path d="M5 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  chart:    `<g fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 14V2"/><path d="M2 14h12"/><path d="M5 11l3-4 2 2 4-5"/></g>`,
  ssl:      `<g fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5 7V4.5a3 3 0 0 1 6 0V7"/></g>`,
  region:   `<g fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="6"/><path d="M8 2v12M2 8h12M8 2c2 2 2 10 0 12M8 2c-2 2-2 10 0 12"/></g>`,
  shield:   `<path d="M8 2 L13 4 V8 C13 11 10.5 13 8 14 C5.5 13 3 11 3 8 V4 Z" fill="none" stroke="currentColor" stroke-width="1.4"/>`,
  close:    `<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
  chevDown: `<path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
}
</script>

<template>
  <svg
    :width="size ?? 14"
    :height="size ?? 14"
    viewBox="0 0 16 16"
    :style="color ? { color } : {}"
    style="flex-shrink: 0"
    aria-hidden="true"
    v-html="icons[name] ?? ''"
  />
</template>
