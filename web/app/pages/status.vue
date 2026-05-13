<script setup lang="ts">
definePageMeta({ layout: 'default' })

const components = [
  { name: 'API',              desc: 'Public REST API · api.acme.dev',         status: 'op'       as const, uptime: 99.998, seed: 3 },
  { name: 'Dashboard',        desc: 'Web app · app.acme.dev',                 status: 'op'       as const, uptime: 99.982, seed: 7 },
  { name: 'Webhook delivery', desc: 'Outbound webhooks to customer endpoints', status: 'outage'   as const, uptime: 98.412, seed: 1 },
  { name: 'Asset CDN',        desc: 'Static assets · cdn.acme.dev',           status: 'degraded' as const, uptime: 99.804, seed: 5 },
  { name: 'Authentication',   desc: 'OAuth & sessions',                       status: 'op'       as const, uptime: 99.961, seed: 13 },
]

const worst = computed(() => {
  if (components.some(c => c.status === 'outage')) return 'outage'
  if (components.some(c => c.status === 'degraded')) return 'degraded'
  return 'op'
})

const headline = computed(() => ({
  op:       'All systems operational',
  degraded: 'Partial degradation',
  outage:   'Active incident in progress',
}[worst.value]))

const bannerBorder = computed(() => ({
  outage:   'oklch(0.50 0.15 22 / 0.5)',
  degraded: 'oklch(0.50 0.12 84 / 0.5)',
  op:       'oklch(0.45 0.13 152 / 0.5)',
}[worst.value]))

const bannerBg = computed(() => ({
  outage:   'var(--status-outage-bg)',
  degraded: 'var(--status-degraded-bg)',
  op:       'var(--status-op-bg)',
}[worst.value]))

const activeIncident = {
  time: '14:02 UTC',
  title: 'Webhook delivery is failing',
  body: "We're seeing elevated 503 responses from our queue worker pool. Outbound webhooks may be delayed or fail. The dashboard and API are unaffected. Engineers are investigating.",
  updates: [
    { time: '14:18 UTC', status: 'degraded' as const, statusLabel: 'identified',    title: 'Root cause identified', body: 'Stuck connection pool in queue worker. Rolling restart in progress.' },
    { time: '14:08 UTC', status: 'outage'   as const, statusLabel: 'investigating', title: 'Engineers paged',       body: 'On-call acknowledged. Looking at metrics now.' },
    { time: '14:02 UTC', status: 'outage'   as const, statusLabel: 'detected',      title: 'Automated detection',   body: '3 consecutive failures across 3 regions.' },
  ],
}
</script>

<template>
  <div class="min-h-screen font-sans" style="background: var(--bg-canvas); color: var(--fg-primary);">
    <div class="mx-auto px-4 md:px-8" style="max-width: 880px; padding-top: 40px; padding-bottom: 64px;">

      <!-- Header -->
      <header class="flex items-center justify-between mb-7">
        <div class="flex items-center gap-3">
          <div
            class="grid place-items-center rounded-lg font-bold"
            style="width: 28px; height: 28px; background: oklch(0.55 0.1 30); color: var(--fg-on-accent); font-size: 13px;"
          >A</div>
          <div>
            <div style="font-weight: 600; font-size: 15px;">Acme</div>
            <div class="t-mono fg-qui" style="font-size: 11px;">status.acme.dev</div>
          </div>
        </div>
        <div class="flex gap-2">
          <button class="pulse-btn sm"><PulseIcon name="bell" :size="11"/>Subscribe</button>
          <button class="pulse-btn sm ghost">History</button>
        </div>
      </header>

      <!-- Big status banner -->
      <div
        class="pulse-card flex items-center gap-4 mb-8"
        style="padding: 22px;"
        :style="{ border: `1px solid ${bannerBorder}`, background: bannerBg }"
      >
        <span
          :class="['pulse-dot', worst]"
          style="width: 14px; height: 14px;"
          :style="{ boxShadow: `0 0 0 6px ${bannerBg}` }"
        />
        <div class="flex-1">
          <div class="t-h2" style="font-size: 22px;">{{ headline }}</div>
          <div class="t-sm fg-sec mt-1">Updated May 13, 2026 · 14:02 UTC · refreshes every 60s</div>
        </div>
        <div class="t-mono text-right hidden sm:block">
          <div style="font-size: 24px; color: var(--fg-primary);">
            99.842<span class="fg-qui" style="font-size: 13px;">%</span>
          </div>
          <div class="t-eyebrow">UPTIME · 90d</div>
        </div>
      </div>

      <!-- Components list -->
      <section class="mb-8">
        <div class="flex items-baseline justify-between mb-4">
          <h3 class="t-h3">Components</h3>
          <span class="t-mono fg-qui" style="font-size: 11px;">last 90 days</span>
        </div>
        <div class="pulse-card" style="padding: 0;">
          <div
            v-for="(comp, i) in components"
            :key="comp.name"
            class="flex items-center gap-4 md:gap-[18px] px-4 py-4"
            :style="i < components.length - 1 ? 'border-bottom: 1px solid var(--border-subtle);' : ''"
          >
            <span :class="['pulse-dot', comp.status]"/>
            <div class="w-[140px] md:w-[200px] shrink-0">
              <div style="font-weight: 500; font-size: 14px;">{{ comp.name }}</div>
              <div class="t-sm fg-qui hidden sm:block">{{ comp.desc }}</div>
            </div>
            <div class="flex-1">
              <PulseUptimeBar :height="22" :seed="comp.seed"/>
            </div>
            <div class="text-right shrink-0" style="min-width: 80px;">
              <div class="t-mono" style="font-size: 13px;">{{ comp.uptime.toFixed(2) }}%</div>
              <div class="t-mono fg-qui" style="font-size: 10px;">{{ comp.status === 'op' ? 'operational' : comp.status }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Active incident -->
      <section class="mb-8">
        <div class="flex items-baseline justify-between mb-4">
          <h3 class="t-h3">Active incident</h3>
          <a class="t-mono fg-ter cursor-pointer" style="font-size: 11px;">View full history →</a>
        </div>
        <div class="pulse-card" style="padding: 22px;">
          <div class="flex items-center gap-[10px] mb-3">
            <PulseStatusBadge status="outage" label="Investigating" size="sm"/>
            <span class="t-mono fg-qui" style="font-size: 11px;">started {{ activeIncident.time }} · 24 min ago</span>
          </div>
          <div class="t-h3 mb-2" style="font-size: 18px;">{{ activeIncident.title }}</div>
          <p class="t-sm fg-sec mb-4" style="max-width: 620px;">{{ activeIncident.body }}</p>
          <PulseIncidentTimeline :items="activeIncident.updates"/>
        </div>
      </section>

      <!-- Footer -->
      <footer class="flex justify-between pt-4" style="border-top: 1px solid var(--border-subtle);">
        <span class="t-mono fg-qui" style="font-size: 11px;">© Acme · status page powered by <NuxtLink to="/" class="hover:text-brand transition-colors">Pulse</NuxtLink></span>
        <span class="t-mono fg-qui" style="font-size: 11px;">Atom · RSS · JSON</span>
      </footer>

    </div>
  </div>
</template>
