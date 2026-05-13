<script setup lang="ts">
const props = withDefaults(defineProps<{
  width?: number
  height?: number
  seed?: number
  color?: string
}>(), {
  width: 720,
  height: 200,
  seed: 11,
  color: 'var(--pulse-brand)',
})

function makeSeries(seed: number, n = 90, base = 220, amp = 80): number[] {
  const out: number[] = []
  let r = seed
  for (let i = 0; i < n; i++) {
    r = (r * 9301 + 49297) % 233280
    out.push(base + (r / 233280 - 0.5) * amp + Math.sin(i * 0.4) * 15)
  }
  return out
}

const chart = computed(() => {
  const data = makeSeries(props.seed!, 90)
  const min = Math.min(...data) - 20
  const max = Math.max(...data) + 20
  const range = max - min
  const pad = { l: 36, r: 8, t: 12, b: 22 }
  const w = props.width! - pad.l - pad.r
  const h = props.height! - pad.t - pad.b
  const step = w / (data.length - 1)
  const pts = data.map((v, i) => [pad.l + i * step, pad.t + h - ((v - min) / range) * h])
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ')
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => min + range * (1 - t))
  return { d, dFill: `${d} L${pad.l + w},${pad.t + h} L${pad.l},${pad.t + h} Z`, yTicks, pad, w, h }
})
</script>

<template>
  <svg :width="width" :height="height" aria-hidden="true">
    <!-- grid -->
    <g class="chart-grid">
      <line
        v-for="(_, i) in chart.yTicks"
        :key="i"
        :x1="chart.pad.l" :x2="chart.pad.l + chart.w"
        :y1="chart.pad.t + (chart.h * i) / 4"
        :y2="chart.pad.t + (chart.h * i) / 4"
      />
    </g>
    <!-- y labels -->
    <g font-size="10" fill="var(--fg-quiet)" :font-family="'var(--font-mono)'">
      <text
        v-for="(v, i) in chart.yTicks"
        :key="i"
        :x="chart.pad.l - 6"
        :y="chart.pad.t + (chart.h * i) / 4 + 3"
        text-anchor="end"
      >{{ Math.round(v) }}</text>
    </g>
    <!-- fill + line -->
    <path :d="chart.dFill" :fill="color" opacity="0.1"/>
    <path :d="chart.d" fill="none" :stroke="color" stroke-width="1.4"/>
    <!-- p95 reference line -->
    <line
      :x1="chart.pad.l" :x2="chart.pad.l + chart.w"
      :y1="chart.pad.t + chart.h * 0.28"
      :y2="chart.pad.t + chart.h * 0.28"
      stroke="var(--status-degraded)"
      stroke-dasharray="3 3"
      stroke-width="1"
      opacity="0.6"
    />
    <text
      :x="chart.pad.l + chart.w - 4"
      :y="chart.pad.t + chart.h * 0.28 - 4"
      text-anchor="end"
      font-size="10"
      :font-family="'var(--font-mono)'"
      fill="var(--status-degraded)"
    >p95 312ms</text>
    <!-- x labels -->
    <g font-size="10" fill="var(--fg-quiet)" :font-family="'var(--font-mono)'">
      <text
        v-for="(label, i) in ['90d','60d','30d','now']"
        :key="label"
        :x="chart.pad.l + (chart.w * i) / 3"
        :y="height! - 4"
      >{{ label }}</text>
    </g>
  </svg>
</template>
