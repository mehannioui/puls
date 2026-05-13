<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  value: string
  unit?: string
  delta?: string
  deltaDir?: 'up' | 'down'
  deltaColor?: 'op' | 'outage' | 'neutral'
  spark?: boolean
  sparkSeed?: number
  sparkColor?: string
}>(), {
  deltaDir: 'up',
  deltaColor: 'op',
  spark: true,
  sparkSeed: 1,
  sparkColor: 'var(--pulse-brand)',
})

const deltaColorMap = {
  op: 'var(--status-op)',
  outage: 'var(--status-outage)',
  neutral: 'var(--fg-tertiary)',
}
</script>

<template>
  <div class="pulse-card" style="padding: 14px 16px; display: flex; flex-direction: column; gap: 6px;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span class="t-eyebrow">{{ label }}</span>
      <span
        v-if="delta"
        class="t-mono"
        style="display: inline-flex; align-items: center; gap: 2px; font-size: 11px;"
        :style="{ color: deltaColorMap[deltaColor!] }"
      >
        <PulseIcon :name="deltaDir === 'up' ? 'arrowUp' : 'arrowDown'" :size="10"/>
        {{ delta }}
      </span>
    </div>
    <div style="display: flex; align-items: baseline; gap: 4px;">
      <span class="t-mono" style="font-size: 26px; font-weight: 500; letter-spacing: -0.01em;">{{ value }}</span>
      <span v-if="unit" class="t-mono fg-ter" style="font-size: 13px;">{{ unit }}</span>
    </div>
    <div v-if="spark" style="margin-top: 2px;">
      <PulseSparkline :width="180" :height="28" :seed="sparkSeed" :color="sparkColor"/>
    </div>
  </div>
</template>
