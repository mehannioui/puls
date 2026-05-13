<script setup lang="ts">
const props = withDefaults(defineProps<{
  data?: number[]
  width?: number
  height?: number
  color?: string
  fill?: boolean
  seed?: number
}>(), {
  width: 96,
  height: 24,
  color: 'var(--pulse-brand)',
  fill: true,
  seed: 2,
})

function makeSeries(seed: number, n = 32, base = 180, amp = 40): number[] {
  const out: number[] = []
  let r = seed
  for (let i = 0; i < n; i++) {
    r = (r * 9301 + 49297) % 233280
    out.push(base + (r / 233280 - 0.5) * amp + Math.sin(i * 0.6) * 8)
  }
  return out
}

const paths = computed(() => {
  const series = props.data ?? makeSeries(props.seed!, 32)
  const min = Math.min(...series)
  const max = Math.max(...series)
  const range = max - min || 1
  const step = props.width! / (series.length - 1)
  const pts = series.map((v, i) => [
    i * step,
    props.height! - ((v - min) / range) * (props.height! - 4) - 2,
  ])
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ')
  return { line: d, fill: `${d} L${props.width},${props.height} L0,${props.height} Z` }
})
</script>

<template>
  <svg
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    style="display: block"
    aria-hidden="true"
  >
    <path v-if="fill" :d="paths.fill" :fill="color" opacity="0.12"/>
    <path
      :d="paths.line"
      fill="none"
      :stroke="color"
      stroke-width="1.2"
      stroke-linejoin="round"
      stroke-linecap="round"
    />
  </svg>
</template>
