<script setup lang="ts">
type Status = 'op' | 'degraded' | 'outage' | 'maint' | 'paused'

const props = withDefaults(defineProps<{
  status?: Status
  label?: string
  size?: 'sm' | 'md'
}>(), {
  status: 'op',
  size: 'md',
})

const labels: Record<Status, string> = {
  op: 'Operational',
  degraded: 'Degraded',
  outage: 'Outage',
  maint: 'Maintenance',
  paused: 'Paused',
}
</script>

<template>
  <span :class="['pulse-badge', status, size === 'sm' ? 'sm' : '']">
    <span
      :class="['pulse-dot', status]"
      :style="{
        width: size === 'sm' ? '6px' : '7px',
        height: size === 'sm' ? '6px' : '7px',
        boxShadow: 'none',
      }"
    />
    {{ label ?? labels[status] }}
  </span>
</template>
