<script setup lang="ts">
const props = withDefaults(defineProps<{
  active?: string
}>(), {
  active: '',
})

const navItems = [
  { key: 'services',     label: 'Services',      icon: 'list',  to: '/app' },
  { key: 'statuspages',  label: 'Status pages',  icon: 'globe', to: '/app/status-pages' },
  { key: 'alerts',       label: 'Alerts',        icon: 'bell',  to: '/app/incidents/inc-001', badge: '1' },
  { key: 'integrations', label: 'Integrations',  icon: 'plug',  to: '/app/integrations' },
]
</script>

<template>
  <!-- fills 100% of its parent container; parent controls width and visibility -->
  <div class="h-full flex flex-col py-[18px] gap-[6px]" style="padding-left: 12px; padding-right: 12px;">
    <!-- Logo -->
    <div style="padding: 0 4px 10px;">
      <NuxtLink to="/app" class="block">
        <PulseLogo :with-wordmark="false" class="lg:hidden"/>
        <PulseLogo class="hidden lg:inline-flex"/>
      </NuxtLink>
    </div>

    <!-- Search button (desktop only) -->
    <button
      class="hidden lg:flex items-center justify-between w-full rounded-[4px] px-2 mb-2"
      style="height: 28px; background: var(--bg-input); border: 1px solid var(--border-subtle); font-size: 13px; cursor: pointer;"
    >
      <span class="flex items-center gap-2" style="color: var(--fg-quiet); font-size: 12px;">
        <PulseIcon name="search" :size="12"/>
        Search...
      </span>
      <span class="pulse-kbd">⌘K</span>
    </button>

    <!-- Nav items -->
    <nav class="flex-1 flex flex-col gap-[2px]">
      <NuxtLink
        v-for="item in navItems"
        :key="item.key"
        :to="item.to"
        class="flex items-center rounded-[6px] cursor-pointer transition-colors justify-center lg:justify-start"
        :class="active === item.key
          ? 'text-ink'
          : 'text-ink-sec hover:text-ink'"
        :style="active === item.key
          ? 'height:30px; padding: 0 10px; background: var(--bg-raised); box-shadow: inset 0 0 0 1px var(--border-subtle); gap: 10px; font-size: 13px;'
          : 'height:30px; padding: 0 10px; gap: 10px; font-size: 13px;'"
      >
        <PulseIcon :name="item.icon" :size="14" style="opacity: 0.85; flex-shrink: 0;"/>
        <span class="hidden lg:inline truncate flex-1">{{ item.label }}</span>
        <span
          v-if="item.badge && active !== item.key"
          class="hidden lg:flex ml-auto font-mono items-center justify-center"
          style="font-size: 10px; padding: 1px 5px; border-radius: 999px; background: var(--status-degraded-bg); color: var(--status-degraded);"
        >{{ item.badge }}</span>
      </NuxtLink>
    </nav>

    <!-- Bottom section -->
    <div>
      <NuxtLink
        to="/app/settings"
        class="flex items-center rounded-[6px] cursor-pointer transition-colors text-ink-sec hover:text-ink justify-center lg:justify-start"
        style="height: 30px; padding: 0 10px; gap: 10px; font-size: 13px;"
      >
        <PulseIcon name="cog" :size="14" style="opacity: 0.85; flex-shrink: 0;"/>
        <span class="hidden lg:inline">Settings</span>
      </NuxtLink>

      <hr class="pulse-hr" style="margin: 8px 0;"/>

      <div class="flex items-center gap-[10px] px-2 justify-center lg:justify-start">
        <div
          class="shrink-0 grid place-items-center rounded-full font-semibold"
          style="width: 24px; height: 24px; background: oklch(0.55 0.1 30); font-size: 11px; color: var(--fg-on-accent);"
        >RT</div>
        <div class="hidden lg:flex flex-col min-w-0" style="line-height: 1.2;">
          <span style="font-size: 12px; font-weight: 500;">Rivertide</span>
          <span class="t-mono fg-qui" style="font-size: 10px;">Pro · 12/25 monitors</span>
        </div>
      </div>
    </div>
  </div>
</template>
