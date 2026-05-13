<script setup lang="ts">
export interface TimelineItem {
  time: string
  status: 'op' | 'degraded' | 'outage' | 'maint'
  statusLabel?: string
  title: string
  body?: string
}

defineProps<{ items: TimelineItem[] }>()

const statusColor: Record<string, string> = {
  op:       'var(--status-op)',
  outage:   'var(--status-outage)',
  degraded: 'var(--status-degraded)',
  maint:    'var(--status-maint)',
}
const statusBg: Record<string, string> = {
  op:       'var(--status-op-bg)',
  outage:   'var(--status-outage-bg)',
  degraded: 'var(--status-degraded-bg)',
  maint:    'var(--status-maint-bg)',
}
</script>

<template>
  <ol style="list-style: none; margin: 0; padding: 0; position: relative;">
    <span style="position: absolute; left: 7px; top: 8px; bottom: 8px; width: 1px; background: var(--border-subtle);"/>
    <li
      v-for="(item, i) in items"
      :key="i"
      style="position: relative; padding-left: 26px;"
      :style="{ paddingBottom: i === items.length - 1 ? '0' : '18px' }"
    >
      <span
        :class="['pulse-dot', item.status]"
        style="position: absolute; left: 3px; top: 6px; box-shadow: 0 0 0 3px var(--bg-base);"
      />
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
        <span class="t-mono fg-ter" style="font-size: 11px;">{{ item.time }}</span>
        <span
          class="t-mono"
          style="font-size: 10px; padding: 1px 6px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.08em;"
          :style="{ color: statusColor[item.status], background: statusBg[item.status] }"
        >{{ item.statusLabel || item.status }}</span>
      </div>
      <div style="font-size: 13px; font-weight: 500; color: var(--fg-primary);">{{ item.title }}</div>
      <div v-if="item.body" class="t-sm fg-ter" style="margin-top: 2px;">{{ item.body }}</div>
    </li>
  </ol>
</template>
