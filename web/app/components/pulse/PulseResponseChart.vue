<script setup lang="ts">
export interface ChartPoint {
  checked_at: string
  response_ms: number | null
  ok: boolean
}

const props = withDefaults(defineProps<{
  width?: number
  height?: number
  seed?: number
  color?: string
  data?: ChartPoint[]
}>(), {
  width: 720,
  height: 200,
  seed: 11,
  color: 'var(--pulse-brand)',
})

function makeMockSeries(seed: number, n = 90, base = 220, amp = 80): number[] {
  const out: number[] = []
  let r = seed
  for (let i = 0; i < n; i++) {
    r = (r * 9301 + 49297) % 233280
    out.push(base + (r / 233280 - 0.5) * amp + Math.sin(i * 0.4) * 15)
  }
  return out
}

const chart = computed(() => {
  // Use real data when provided; fall back to seeded mock.
  const values: number[] = props.data
    ? props.data.map(p => p.response_ms ?? 0)
    : makeMockSeries(props.seed!, 90)

  const failedIndices = new Set<number>(
    props.data
      ? props.data.flatMap((p, i) => (!p.ok ? [i] : []))
      : [],
  )

  const min = Math.min(...values) - 20
  const max = Math.max(...values) + 20
  const range = max - min || 1
  const pad = { l: 36, r: 8, t: 12, b: 22 }
  const w = props.width! - pad.l - pad.r
  const h = props.height! - pad.t - pad.b
  const step = values.length > 1 ? w / (values.length - 1) : w
  const pts = values.map((v, i) => [pad.l + i * step, pad.t + h - ((v - min) / range) * h])
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ')
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => min + range * (1 - t))

  // X-axis labels: show time range when real data exists
  let xLabels: string[]
  const firstPt = props.data?.at(0)
  const lastPt = props.data?.at(-1)
  if (firstPt && lastPt && props.data && props.data.length >= 2) {
    const fmt = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    xLabels = [fmt(firstPt.checked_at), '', '', fmt(lastPt.checked_at)]
  } else {
    xLabels = ['24h ago', '', '', 'now']
  }

  // Pre-compute failed check points so the template doesn't need unsafe indexing.
  const failedPts = [...failedIndices]
    .map(i => pts[i])
    .filter((p): p is [number, number] => p !== undefined)

  return { d, dFill: `${d} L${pad.l + w},${pad.t + h} L${pad.l},${pad.t + h} Z`, yTicks, pad, w, h, failedPts, xLabels }
})
</script>

<template>
  <svg :width="width" :height="height" aria-hidden="true">
    <!-- grid -->
    <g>
      <line
        v-for="(_, i) in chart.yTicks"
        :key="i"
        :x1="chart.pad.l" :x2="chart.pad.l + chart.w"
        :y1="chart.pad.t + (chart.h * i) / 4"
        :y2="chart.pad.t + (chart.h * i) / 4"
        stroke="var(--border-subtle, #e5e7eb)"
        stroke-width="1"
      />
    </g>
    <!-- y labels -->
    <g font-size="10" fill="var(--fg-quiet, #9ca3af)" :font-family="'var(--font-mono, monospace)'">
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
    <!-- failed check markers (red dots) -->
    <circle
      v-for="(pt, i) in chart.failedPts"
      :key="i"
      :cx="pt[0]"
      :cy="pt[1]"
      r="3"
      fill="#ef4444"
    />
    <!-- x labels -->
    <g font-size="10" fill="var(--fg-quiet, #9ca3af)" :font-family="'var(--font-mono, monospace)'">
      <text
        v-for="(label, i) in chart.xLabels"
        :key="label + i"
        :x="chart.pad.l + (chart.w * i) / 3"
        :y="height! - 4"
      >{{ label }}</text>
    </g>
  </svg>
</template>
