<script setup lang="ts">
withDefaults(defineProps<{
  size?: number
  withWordmark?: boolean
  color?: string
}>(), {
  size: 18,
  withWordmark: true,
})
</script>

<template>
  <span
    class="inline-flex items-center gap-2"
    :style="{ color: color || 'var(--fg-primary)' }"
  >
    <svg :width="size" :height="size" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="1" y="1" width="22" height="22" rx="6" fill="var(--bg-raised)" stroke="var(--border-default)"/>
      <path d="M3 12 H7 L9.5 6 L14 18 L16.5 12 H21" fill="none" stroke="var(--pulse-brand)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    </svg>
    <span
      v-if="withWordmark"
      class="font-semibold"
      :style="{ fontSize: size * 0.9 + 'px', letterSpacing: '-0.01em' }"
    >Pulse</span>
  </span>
</template>
