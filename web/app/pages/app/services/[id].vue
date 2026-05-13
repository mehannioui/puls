<script setup lang="ts">
definePageMeta({ layout: 'app' })

const route = useRoute()
const { getById } = useMockServices()
const { getById: getIncident } = useMockIncidents()
const { checks } = useMockChecks(computed(() => route.params.id as string))

const service = computed(() => getById(route.params.id as string))

const incidents = computed(() => {
  if (!service.value) return []
  return [
    { time: '13:38 UTC · today',    status: 'outage'   as const, statusLabel: 'investigating', title: 'Webhook delivery failing',     body: 'Detected 503s from queue worker pool. On-call paged.' },
    { time: '09:02 UTC · yesterday',status: 'op'       as const, statusLabel: 'resolved',      title: 'Brief 5xx spike — auto-resolved' },
    { time: 'May 10 · 22:18',       status: 'degraded' as const, statusLabel: 'resolved',      title: 'Elevated p95 in eu-west',      body: '11-minute degradation. Single region.' },
    { time: 'May 04 · 02:00',       status: 'maint'    as const, statusLabel: 'scheduled',     title: 'Postgres failover · 5 min window' },
  ]
})

const chartColor = computed(() => {
  const s = service.value?.status
  if (s === 'outage') return 'var(--status-outage)'
  if (s === 'degraded') return 'var(--status-degraded)'
  return 'var(--pulse-brand)'
})
</script>

<template>
  <div v-if="service" class="flex flex-col min-h-0 flex-1 overflow-hidden">
    <!-- Topbar -->
    <PulseTopbar
      :crumbs="[{ label: 'Services', to: '/app' }, { label: service.name }]"
    >
      <template #title>
        <span class="flex items-center gap-3">
          {{ service.name }}
          <PulseStatusBadge :status="service.status"/>
        </span>
      </template>
      <div class="hidden md:flex items-center gap-2">
        <button class="pulse-btn"><PulseIcon name="ext" :size="12"/>Open URL</button>
        <button class="pulse-btn"><PulseIcon name="bell" :size="12"/>Pause alerts</button>
        <button class="pulse-btn"><PulseIcon name="cog" :size="12"/>Settings</button>
      </div>
    </PulseTopbar>

    <!-- Scrollable body -->
    <div class="flex-1 overflow-auto pb-24 md:pb-6" style="padding: 16px md:24px;">
      <div class="max-w-[1400px] mx-auto" style="padding: 16px; display: flex; flex-direction: column; gap: 18px;">

        <!-- Config row -->
        <div class="hidden md:flex items-center gap-3" style="font-size: 12px;">
          <PulseIcon name="globe" :size="13" color="var(--fg-tertiary)"/>
          <span class="t-mono fg-sec">{{ service.method }}</span>
          <span class="t-mono fg-pri">{{ service.url }}</span>
          <span class="t-mono fg-qui">·</span>
          <span class="t-mono fg-ter">every {{ service.interval }} · {{ service.regions.length }} regions</span>
          <span class="flex-1"/>
          <span class="t-mono fg-qui">monitor · mon_{{ service.id.padStart(8, '0') }}</span>
        </div>

        <!-- Metrics row -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <PulseMetricCard
            label="Uptime · 90d"
            :value="service.uptime?.toFixed(3) ?? '—'"
            unit="%"
            delta="0.6"
            delta-dir="down"
            delta-color="outage"
            :spark-seed="service.seed"
          />
          <PulseMetricCard
            label="Avg response"
            :value="service.p95 ? (service.p95 / 1000).toFixed(2) : '—'"
            unit="s"
            delta="1.4"
            delta-dir="up"
            delta-color="outage"
            spark-color="var(--status-outage)"
            :spark-seed="service.seed + 1"
          />
          <PulseMetricCard
            label="p95 response"
            :value="service.p95 ? (service.p95 * 1.75 / 1000).toFixed(2) : '—'"
            unit="s"
            delta="2.1"
            delta-dir="up"
            delta-color="outage"
            spark-color="var(--status-degraded)"
            :spark-seed="service.seed + 2"
          />
          <PulseMetricCard
            label="MTTR · 30d"
            value="6"
            unit="min"
            delta="2"
            delta-dir="up"
            delta-color="outage"
            spark-color="var(--status-degraded)"
            :spark-seed="service.seed + 3"
          />
        </div>

        <!-- Charts + incident history (desktop grid, mobile stack) -->
        <div class="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-4">
          <!-- Left: uptime + response chart -->
          <div class="pulse-card" style="padding: 18px;">
            <div class="flex justify-between items-baseline mb-3">
              <div class="t-h4">Uptime</div>
              <div class="flex gap-[6px]">
                <button class="pulse-btn sm ghost">24h</button>
                <button class="pulse-btn sm ghost">7d</button>
                <button class="pulse-btn sm">90d</button>
              </div>
            </div>
            <PulseUptimeBar :height="48" :seed="service.seed"/>
            <div class="flex justify-between mt-2">
              <span class="t-mono fg-qui" style="font-size: 10px;">Feb 12, 2026</span>
              <span class="t-mono fg-qui" style="font-size: 10px;">May 13, 2026</span>
            </div>
            <hr class="pulse-hr" style="margin: 14px 0;"/>
            <div class="t-h4 mb-2">Response time</div>
            <!-- responsive chart width -->
            <div class="w-full overflow-hidden">
              <PulseResponseChart :width="620" :height="170" :seed="service.seed + 10" :color="chartColor"/>
            </div>
          </div>

          <!-- Right: incident history -->
          <div class="pulse-card flex flex-col" style="padding: 18px;">
            <div class="t-h4 mb-3">Incident history</div>
            <PulseIncidentTimeline :items="incidents"/>
          </div>
        </div>

        <!-- Check log (mobile-first) -->
        <div class="pulse-card overflow-hidden">
          <div class="flex justify-between items-center px-4 py-3" style="border-bottom: 1px solid var(--border-subtle);">
            <span class="t-h4" style="font-size: 13px;">Recent checks</span>
            <span class="t-mono fg-qui" style="font-size: 11px;">30s interval</span>
          </div>
          <!-- desktop columns -->
          <div class="hidden md:block">
            <div
              v-for="(c, i) in checks"
              :key="i"
              class="font-mono"
              style="display: grid; grid-template-columns: 88px 96px 56px 70px 1fr; gap: 12px; padding: 4px 16px; align-items: center; font-size: 12px;"
            >
              <span class="fg-qui">{{ c.t }}</span>
              <span class="fg-sec">{{ c.region }}</span>
              <span :style="{ color: c.code >= 500 ? 'var(--status-outage)' : c.degraded ? 'var(--status-degraded)' : 'var(--status-op)' }">{{ c.code }}</span>
              <span class="fg-pri">{{ c.ms }}{{ c.ms !== '—' ? 'ms' : '' }}</span>
              <span class="fg-ter" style="font-size: 11px;">{{ c.err ?? '—' }}</span>
            </div>
          </div>
          <!-- mobile stacked -->
          <div class="md:hidden divide-y" style="--tw-divide-opacity: 1;">
            <div
              v-for="(c, i) in checks.slice(0, 4)"
              :key="i"
              class="flex items-center gap-3 px-4 py-3 font-mono text-xs"
            >
              <span :style="{ color: c.code >= 500 ? 'var(--status-outage)' : c.degraded ? 'var(--status-degraded)' : 'var(--status-op)' }">{{ c.code }}</span>
              <span class="fg-sec">{{ c.region }}</span>
              <span class="fg-qui">{{ c.t }}</span>
              <span class="ml-auto fg-pri">{{ c.ms }}{{ c.ms !== '—' ? 'ms' : '' }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>

  <div v-else class="flex-1 flex items-center justify-center">
    <p class="t-sm fg-ter">Service not found.</p>
  </div>
</template>
