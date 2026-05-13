<script setup lang="ts">
definePageMeta({ layout: 'default' })

const statusTypes = ['op', 'degraded', 'outage', 'maint', 'paused'] as const

const sampleIncidents = [
  { time: '13:38 UTC · today',    status: 'outage'   as const, statusLabel: 'investigating', title: 'Webhook delivery failing',  body: 'Detected 503s from queue worker pool.' },
  { time: '09:02 UTC · yesterday',status: 'op'       as const, statusLabel: 'resolved',      title: 'Brief 5xx spike — auto-resolved' },
  { time: 'May 10 · 22:18',       status: 'degraded' as const, statusLabel: 'resolved',      title: 'Elevated p95 in eu-west',   body: '11-minute degradation.' },
]
</script>

<template>
  <div class="min-h-screen font-sans px-4 md:px-8 py-10" style="background: var(--bg-canvas); color: var(--fg-primary);">
    <div class="max-w-5xl mx-auto flex flex-col gap-14">

      <!-- Header -->
      <div>
        <div class="t-eyebrow mb-2">COMPONENTS</div>
        <h1 class="t-h1">Pulse Playground</h1>
        <p class="t-body fg-sec mt-2">All design-system primitives in one view.</p>
      </div>

      <!-- StatusBadge -->
      <section>
        <h2 class="t-h3 mb-4">StatusBadge</h2>
        <div class="flex flex-wrap gap-3 items-center">
          <PulseStatusBadge v-for="s in statusTypes" :key="s" :status="s"/>
        </div>
        <div class="flex flex-wrap gap-3 items-center mt-3">
          <PulseStatusBadge v-for="s in statusTypes" :key="s" :status="s" size="sm"/>
        </div>
      </section>

      <!-- Status dots -->
      <section>
        <h2 class="t-h3 mb-4">Status Dots</h2>
        <div class="flex gap-4 items-center">
          <span v-for="s in statusTypes" :key="s" :class="['pulse-dot', s]"/>
        </div>
      </section>

      <!-- UptimeBar -->
      <section>
        <h2 class="t-h3 mb-4">UptimeBar</h2>
        <div class="flex flex-col gap-4">
          <PulseUptimeBar :height="18" :seed="1"/>
          <PulseUptimeBar :height="28" :seed="3"/>
          <PulseUptimeBar :height="40" :seed="5"/>
          <PulseUptimeBar :height="48" :seed="7"/>
        </div>
      </section>

      <!-- Sparkline -->
      <section>
        <h2 class="t-h3 mb-4">Sparkline</h2>
        <div class="flex flex-wrap gap-6 items-end">
          <PulseSparkline :width="96" :height="24" :seed="2"/>
          <PulseSparkline :width="120" :height="32" :seed="5" color="var(--status-outage)"/>
          <PulseSparkline :width="160" :height="40" :seed="9" color="var(--status-degraded)"/>
        </div>
      </section>

      <!-- MetricCard -->
      <section>
        <h2 class="t-h3 mb-4">MetricCard</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <PulseMetricCard label="Monitors" value="12" unit="/25" :spark="false"/>
          <PulseMetricCard label="Up" value="10" delta="" delta-dir="up" delta-color="op" :spark-seed="3"/>
          <PulseMetricCard label="Incidents · 24h" value="2" delta="1" delta-dir="down" delta-color="op" spark-color="var(--status-degraded)" :spark-seed="5"/>
          <PulseMetricCard label="Avg response" value="208" unit="ms" delta="12" delta-dir="up" delta-color="outage" :spark-seed="9"/>
        </div>
      </section>

      <!-- LiveWave -->
      <section>
        <h2 class="t-h3 mb-4">LiveWave</h2>
        <div class="pulse-card overflow-hidden mb-4" style="padding: 0; height: 100px;">
          <PulseLiveWave :width="800" :height="100" status="op" :beats="4" :spike="0.55"/>
        </div>
        <div class="pulse-card overflow-hidden mb-4" style="padding: 0; height: 100px;">
          <PulseLiveWave :width="800" :height="100" status="degraded" :beats="4" :spike="0.6"/>
        </div>
        <div class="pulse-card overflow-hidden" style="padding: 0; height: 100px;">
          <PulseLiveWave :width="800" :height="100" status="outage" :beats="4" :spike="0.75"/>
        </div>
      </section>

      <!-- ResponseChart -->
      <section>
        <h2 class="t-h3 mb-4">ResponseChart</h2>
        <div class="pulse-card" style="padding: 18px; overflow: hidden;">
          <div class="w-full overflow-x-auto">
            <PulseResponseChart :width="720" :height="200" :seed="3"/>
          </div>
        </div>
      </section>

      <!-- IncidentTimeline -->
      <section>
        <h2 class="t-h3 mb-4">IncidentTimeline</h2>
        <div class="pulse-card" style="padding: 18px; max-width: 480px;">
          <PulseIncidentTimeline :items="sampleIncidents"/>
        </div>
      </section>

      <!-- Logo -->
      <section>
        <h2 class="t-h3 mb-4">Logo</h2>
        <div class="flex flex-wrap gap-6 items-center">
          <PulseLogo :size="18"/>
          <PulseLogo :size="24"/>
          <PulseLogo :size="32"/>
          <PulseLogo :size="18" :with-wordmark="false"/>
          <PulseLogo :size="24" :with-wordmark="false"/>
        </div>
      </section>

      <!-- Icons -->
      <section>
        <h2 class="t-h3 mb-4">Icons</h2>
        <div class="flex flex-wrap gap-4 items-center">
          <div
            v-for="name in ['pulse','home','list','globe','bell','plug','cog','search','plus','arrowUp','arrowDown','check','copy','ext','more','filter','bolt','chev','chart','ssl','region','shield']"
            :key="name"
            class="flex flex-col items-center gap-1"
          >
            <div
              class="grid place-items-center rounded-md"
              style="width: 36px; height: 36px; background: var(--bg-raised); border: 1px solid var(--border-subtle);"
            >
              <PulseIcon :name="name" :size="16"/>
            </div>
            <span class="t-mono fg-ter" style="font-size: 9px;">{{ name }}</span>
          </div>
        </div>
      </section>

      <!-- Buttons -->
      <section>
        <h2 class="t-h3 mb-4">Buttons</h2>
        <div class="flex flex-wrap gap-3 items-center mb-3">
          <button class="pulse-btn primary lg"><PulseIcon name="plus" :size="13"/>Add monitor</button>
          <button class="pulse-btn primary">Primary</button>
          <button class="pulse-btn">Default</button>
          <button class="pulse-btn ghost">Ghost</button>
          <button class="pulse-btn sm">Small</button>
          <button class="pulse-btn primary sm">Small primary</button>
        </div>
      </section>

      <!-- Page links -->
      <section class="pb-10">
        <h2 class="t-h3 mb-4">Pages</h2>
        <div class="flex flex-wrap gap-3">
          <NuxtLink to="/" class="pulse-btn"><PulseIcon name="globe" :size="12"/>Landing</NuxtLink>
          <NuxtLink to="/app" class="pulse-btn"><PulseIcon name="list" :size="12"/>Dashboard</NuxtLink>
          <NuxtLink to="/app/services/3" class="pulse-btn"><PulseIcon name="chart" :size="12"/>Service detail</NuxtLink>
          <NuxtLink to="/status" class="pulse-btn"><PulseIcon name="shield" :size="12"/>Status page</NuxtLink>
          <NuxtLink to="/app/services/new" class="pulse-btn"><PulseIcon name="plus" :size="12"/>Add monitor</NuxtLink>
          <NuxtLink to="/app/integrations" class="pulse-btn"><PulseIcon name="plug" :size="12"/>Integrations</NuxtLink>
          <NuxtLink to="/app/incidents/inc-001" class="pulse-btn" style="color: var(--status-outage);"><PulseIcon name="bolt" :size="12"/>War-room</NuxtLink>
        </div>
      </section>

    </div>
  </div>
</template>
