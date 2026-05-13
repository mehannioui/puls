<script setup lang="ts">
const props = withDefaults(defineProps<{
  width?: number
  height?: number
  status?: 'op' | 'degraded' | 'outage'
  beats?: number
  showFill?: boolean
  showMarker?: boolean
  scroll?: boolean
  spike?: number
}>(), {
  width: 720,
  height: 64,
  status: 'op',
  beats: 4,
  showFill: true,
  showMarker: true,
  scroll: true,
  spike: 0.55,
})

function buildWavePath(w: number, h: number, beats: number, spike: number) {
  const dipBefore = 0.10
  const mid = h / 2
  const beatStep = w / beats
  let d = `M0,${mid}`
  for (let i = 0; i < beats; i++) {
    const x0 = i * beatStep
    d += ` L${x0 + beatStep * 0.20},${mid + (i % 2 ? -1 : 1) * 1}`
    d += ` L${x0 + beatStep * 0.30},${mid}`
    const cx = x0 + beatStep * 0.42
    d += ` L${cx - beatStep * 0.025},${mid}`
    d += ` L${cx - beatStep * 0.015},${mid + h * dipBefore}`
    d += ` L${cx},${mid - h * spike}`
    d += ` L${cx + beatStep * 0.015},${mid + h * dipBefore * 0.6}`
    d += ` L${cx + beatStep * 0.030},${mid}`
    d += ` L${x0 + beatStep},${mid}`
  }
  return d
}

const d = computed(() =>
  buildWavePath(props.width, props.height, props.beats, props.spike)
)

const dDouble = computed(() => {
  const base = d.value
  const second = buildWavePath(props.width, props.height, props.beats, props.spike).slice(1)
  return `${base} M${props.width},${props.height / 2} ${second}`
})

const dFill = computed(() =>
  `${d.value} L${props.width},${props.height} L0,${props.height} Z`
)

const gridLines = computed(() =>
  Array.from({ length: 8 }, (_, i) => (props.width / 8) * i)
)
</script>

<template>
  <svg
    :class="['pulse-wave', status]"
    :viewBox="`0 0 ${width} ${height}`"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <!-- grid -->
    <g opacity="0.4">
      <line
        v-for="x in gridLines"
        :key="x"
        :x1="x" :x2="x"
        y1="0" :y2="height"
        stroke="var(--border-subtle)"
        stroke-width="0.5"
      />
      <line
        x1="0" :x2="width"
        :y1="height / 2" :y2="height / 2"
        stroke="var(--border-subtle)"
        stroke-width="0.5"
        stroke-dasharray="2 4"
      />
    </g>

    <!-- scrolling path group -->
    <g :class="scroll ? 'wave-scroll' : ''">
      <path v-if="showFill" class="wave-fill" :d="dFill"/>
      <path class="wave-line" :d="dDouble"/>
    </g>

    <!-- marker dot -->
    <template v-if="showMarker">
      <circle class="wave-glow"   :cx="width - 12" :cy="height / 2" r="14"/>
      <circle class="wave-marker" :cx="width - 12" :cy="height / 2" r="3"/>
    </template>
  </svg>
</template>
