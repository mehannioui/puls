<script setup lang="ts">
// 90-element bool array from the API → coloured day segments.
// Wraps PulseUptimeBar with the right data shape for the public status page.

const props = withDefaults(defineProps<{
  buckets?: boolean[]  // 90 bools, index 0 = oldest (90d ago), index 89 = today
  height?: number
}>(), {
  height: 28,
})

// Convert bool[] → UptimeSeg[] that PulseUptimeBar understands
const segs = computed(() =>
  (props.buckets ?? Array(90).fill(null)).map((ok, i) => ({
    day: i,
    status: ok === null ? 'nodata' : ok ? 'op' : 'outage',
  }))
)
</script>

<template>
  <PulseUptimeBar :data="segs" :height="height" :days="90"/>
</template>
