<script setup lang="ts">
withDefaults(defineProps<{
  active?: string
}>(), {
  active: '',
})

const tabs = [
  { key: 'services',    label: 'Services',  icon: 'list',  to: '/app' },
  { key: 'statuspages', label: 'Status',    icon: 'globe', to: '/app/status-pages' },
  { key: 'alerts',      label: 'Alerts',    icon: 'bell',  to: '/app/incidents/inc-001' },
  { key: 'settings',   label: 'Settings',  icon: 'cog',   to: '/app/settings' },
]
</script>

<template>
  <!-- visible only on mobile -->
  <nav
    class="md:hidden fixed bottom-0 left-0 right-0 z-50 grid"
    style="
      grid-template-columns: repeat(4, 1fr);
      gap: 4px;
      padding: 8px 24px 28px;
      background: oklch(0.16 0.008 240 / 0.92);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-top: 1px solid var(--border-subtle);
    "
  >
    <NuxtLink
      v-for="tab in tabs"
      :key="tab.key"
      :to="tab.to"
      class="flex flex-col items-center gap-1"
      :style="{
        color: active === tab.key ? 'var(--pulse-brand)' : 'var(--fg-tertiary)',
      }"
    >
      <PulseIcon :name="tab.icon" :size="18"/>
      <span style="font-size: 10px; font-weight: 500;">{{ tab.label }}</span>
    </NuxtLink>
  </nav>
</template>
