<script setup lang="ts">
definePageMeta({ layout: 'app' })

const { services } = useMockServices()

const metrics = computed(() => {
  const live = services.value.filter(s => s.status !== 'paused')
  const up = live.filter(s => s.status === 'op').length
  const incidents = services.value.filter(s => s.status === 'outage' || s.status === 'degraded').length
  const avgP95 = Math.round(live.filter(s => s.p95).reduce((a, s) => a + s.p95!, 0) / live.filter(s => s.p95).length)
  return { total: services.value.length, live: live.length, up, incidents, avgP95 }
})

function p95Color(p95: number | null) {
  if (!p95) return 'var(--fg-secondary)'
  if (p95 > 500) return 'var(--status-outage)'
  if (p95 > 300) return 'var(--status-degraded)'
  return 'var(--fg-secondary)'
}

function sparkColor(status: string) {
  if (status === 'outage') return 'var(--status-outage)'
  if (status === 'degraded') return 'var(--status-degraded)'
  return 'var(--pulse-brand)'
}
</script>

<template>
  <div class="flex flex-col min-h-0 flex-1 overflow-hidden">
    <!-- Topbar -->
    <PulseTopbar title="Services">
      <!-- Desktop actions -->
      <div class="hidden md:flex items-center gap-2">
        <button class="pulse-btn"><PulseIcon name="filter" :size="12"/>Filter</button>
        <button class="pulse-btn">
          <PulseIcon name="region" :size="12"/>All regions<PulseIcon name="chevDown" :size="10"/>
        </button>
        <NuxtLink to="/app/services/new" class="pulse-btn primary">
          <PulseIcon name="plus" :size="12"/>Add monitor
        </NuxtLink>
      </div>
      <!-- Mobile: just an add button -->
      <NuxtLink
        to="/app/services/new"
        class="md:hidden pulse-btn sm primary"
        style="padding: 0 10px;"
      >
        <PulseIcon name="plus" :size="13"/>Add
      </NuxtLink>
    </PulseTopbar>

    <!-- Scrollable content area -->
    <div class="flex-1 overflow-auto pb-24 md:pb-6" style="padding: 16px; md:padding: 24px;">
      <div class="max-w-[1400px] mx-auto flex flex-col gap-4 md:gap-[18px]">

        <!-- Metrics row -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <PulseMetricCard
            label="Monitors"
            :value="String(metrics.total)"
            :unit="`/25`"
            :spark="false"
          />
          <PulseMetricCard
            label="Up"
            :value="String(metrics.up)"
            delta=""
            delta-dir="up"
            delta-color="op"
            :spark-seed="3"
          />
          <PulseMetricCard
            label="Incidents · 24h"
            :value="String(metrics.incidents)"
            delta="1"
            delta-dir="down"
            delta-color="op"
            spark-color="var(--status-degraded)"
            :spark-seed="5"
          />
          <PulseMetricCard
            label="Avg response"
            :value="String(metrics.avgP95)"
            unit="ms"
            delta="12"
            delta-dir="up"
            delta-color="outage"
            :spark-seed="9"
          />
        </div>

        <!-- Services table (desktop) -->
        <div class="pulse-card overflow-hidden hidden md:block">
          <div class="flex items-center justify-between px-4 py-3">
            <div class="flex items-center gap-[10px]">
              <span class="t-h4">All services</span>
              <span class="t-mono fg-qui" style="font-size: 11px;">· {{ services.length }} monitors</span>
            </div>
            <div class="flex gap-[6px]">
              <button class="pulse-btn sm">Live</button>
              <button class="pulse-btn sm ghost">Paused</button>
              <button class="pulse-btn sm ghost">All</button>
            </div>
          </div>
          <table class="pulse-table">
            <thead>
              <tr>
                <th style="width: 28px;"/>
                <th>Service</th>
                <th style="width: 240px;">Uptime · 90d</th>
                <th style="width: 160px;">Response · 24h</th>
                <th style="width: 80px;">p95</th>
                <th style="width: 90px;">Last check</th>
                <th style="width: 28px;"/>
              </tr>
            </thead>
            <tbody>
              <tr v-for="svc in services" :key="svc.id">
                <td><span :class="['pulse-dot', svc.status]"/></td>
                <td>
                  <NuxtLink :to="`/app/services/${svc.id}`" class="hover:text-brand transition-colors">
                    <div style="font-weight: 500; font-size: 13px;">{{ svc.name }}</div>
                    <div class="t-mono fg-qui" style="font-size: 11px;">{{ svc.url }}</div>
                  </NuxtLink>
                </td>
                <td>
                  <span v-if="svc.status === 'paused'" class="t-mono fg-qui" style="font-size: 11px;">—</span>
                  <div v-else class="flex flex-col gap-1">
                    <PulseUptimeBar :height="18" :seed="svc.seed"/>
                    <span class="t-mono fg-ter" style="font-size: 10px;">{{ svc.uptime?.toFixed(3) }}%</span>
                  </div>
                </td>
                <td>
                  <PulseSparkline
                    v-if="svc.status !== 'paused'"
                    :width="140"
                    :height="26"
                    :seed="svc.seed + 20"
                    :color="sparkColor(svc.status)"
                  />
                </td>
                <td>
                  <span
                    class="t-mono"
                    style="font-size: 12px;"
                    :style="{ color: p95Color(svc.p95) }"
                  >{{ svc.p95 ? `${svc.p95}ms` : '—' }}</span>
                </td>
                <td><span class="t-mono fg-ter" style="font-size: 11px;">{{ svc.last }}</span></td>
                <td>
                  <button class="pulse-btn ghost sm" style="padding: 0 4px;">
                    <PulseIcon name="more"/>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile: service cards -->
        <div class="md:hidden flex flex-col gap-3">
          <!-- Incident banner if applicable -->
          <div
            v-if="services.some(s => s.status === 'outage')"
            class="flex items-center gap-3 rounded-lg p-3"
            style="background: var(--status-outage-bg); border: 1px solid oklch(0.50 0.15 22 / 0.5);"
          >
            <span class="pulse-dot outage" style="width: 10px; height: 10px;"/>
            <div class="flex-1">
              <div style="font-size: 13px; font-weight: 500;">Active incident · webhooks</div>
              <div class="t-mono fg-ter" style="font-size: 11px;">started 24 min ago</div>
            </div>
            <NuxtLink to="/app/incidents/inc-001">
              <PulseIcon name="chev" :size="12" color="var(--fg-tertiary)"/>
            </NuxtLink>
          </div>

          <!-- Service cards -->
          <NuxtLink
            v-for="svc in services"
            :key="svc.id"
            :to="`/app/services/${svc.id}`"
            class="pulse-card block"
            style="padding: 14px;"
          >
            <div class="flex items-center gap-3 mb-3">
              <span :class="['pulse-dot', svc.status]"/>
              <div class="flex-1 min-w-0">
                <div style="font-size: 14px; font-weight: 500;">{{ svc.name }}</div>
                <div class="t-mono fg-qui truncate" style="font-size: 11px;">{{ svc.url }}</div>
              </div>
              <PulseIcon name="chev" :size="11" color="var(--fg-quiet)"/>
            </div>
            <PulseUptimeBar v-if="svc.status !== 'paused'" :height="16" :seed="svc.seed"/>
            <div class="flex justify-between mt-2">
              <span class="t-mono" style="font-size: 11px;">
                <span class="fg-qui">uptime · </span>
                <span :style="{ color: svc.uptime ? (svc.uptime > 99.9 ? 'var(--fg-secondary)' : 'var(--status-degraded)') : 'var(--fg-quiet)' }">
                  {{ svc.uptime ? `${svc.uptime.toFixed(3)}%` : '—' }}
                </span>
              </span>
              <span class="t-mono fg-qui" style="font-size: 11px;">{{ svc.last }}</span>
            </div>
          </NuxtLink>
        </div>

      </div>
    </div>
  </div>
</template>
