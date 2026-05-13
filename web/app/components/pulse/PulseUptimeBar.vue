<script setup lang="ts">
export interface UptimeSeg { day: number; status: string }

const props = withDefaults(defineProps<{
  data?: UptimeSeg[]
  days?: number
  height?: number
  seed?: number
}>(), {
  days: 90,
  height: 28,
  seed: 3,
})

function makeUptime(seed: number, days: number): UptimeSeg[] {
  const out: UptimeSeg[] = []
  let r = seed
  for (let i = 0; i < days; i++) {
    r = (r * 9301 + 49297) % 233280
    const v = r / 233280
    let status = 'op'
    if (v < 0.012) status = 'outage'
    else if (v < 0.05) status = 'degraded'
    out.push({ day: i, status })
  }
  return out
}

const segs = computed(() => props.data ?? makeUptime(props.seed!, props.days!))
</script>

<template>
  <div class="pulse-uptime" :style="{ height: height + 'px' }">
    <div
      v-for="(seg, i) in segs"
      :key="i"
      :class="['seg', seg.status]"
      :title="`Day -${segs.length - i}`"
    />
  </div>
</template>
