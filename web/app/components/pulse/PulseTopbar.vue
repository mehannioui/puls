<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  crumbs?: Array<{ label: string; to?: string }>
  wave?: boolean
}>(), {
  wave: true,
})
</script>

<template>
  <div
    class="relative flex items-center justify-between shrink-0 px-4 md:px-6"
    style="height: 56px; border-bottom: 1px solid var(--border-subtle); background: var(--bg-canvas);"
  >
    <!-- Ambient wave -->
    <div
      v-if="wave"
      class="absolute inset-0 pointer-events-none"
      style="opacity: 0.20; mask-image: linear-gradient(90deg, transparent 0%, black 25%, black 75%, transparent 100%);"
    >
      <PulseLiveWave :width="1200" :height="56" :beats="6" :spike="0.35" :show-fill="false" :show-marker="false"/>
    </div>

    <!-- Left: title + crumbs -->
    <div class="flex flex-col gap-[2px] relative">
      <div
        v-if="crumbs?.length"
        class="t-mono fg-qui flex items-center gap-1"
        style="font-size: 11px;"
      >
        <template v-for="(crumb, i) in crumbs" :key="i">
          <NuxtLink v-if="crumb.to" :to="crumb.to" class="hover:text-ink-sec transition-colors">{{ crumb.label }}</NuxtLink>
          <span v-else style="color: var(--fg-secondary);">{{ crumb.label }}</span>
          <PulseIcon v-if="i < crumbs.length - 1" name="chev" :size="10"/>
        </template>
      </div>
      <div class="font-semibold" style="font-size: 17px; letter-spacing: -0.01em;">
        <slot name="title">{{ title }}</slot>
      </div>
    </div>

    <!-- Right: actions -->
    <div class="flex items-center gap-2 relative">
      <slot/>
    </div>
  </div>
</template>
