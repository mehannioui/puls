<script setup lang="ts">
definePageMeta({ layout: 'default' })

// ── Tenant detection ─────────────────────────────────────────────────────────
// The tenant.global middleware sets this on SSR when the host is <slug>.pulse.io
const tenant = useState<string | null>('tenant', () => null)

const config = useRuntimeConfig()

interface StatusResponse {
  org:       { slug: string; name: string }
  services:  Array<{
    id: string; name: string; url: string
    current_status: string
    uptime_percent_30d: number
    uptime_buckets_90d: boolean[]
  }>
  incidents: Array<{
    id: string; title: string; status: string; severity: string
    started_at: string; resolved_at: string | null
    updates: Array<{ id: string; status: string; body: string; created_at: string }>
  }>
}

// Fetch real data when on a tenant subdomain.
// useAsyncData is SSG-compatible — Nuxt serialises the payload.
const { data: statusData, error: statusError } = await useAsyncData<StatusResponse | null>(
  () => `status-${tenant.value}`,
  async () => {
    if (!tenant.value) return null
    return $fetch<StatusResponse>(
      `${config.public.apiBase}/public/status?slug=${tenant.value}`
    )
  },
  { server: true, watch: [tenant] }
)

// Derive overall status from service states
const overallStatus = computed(() => {
  const services = statusData.value?.services ?? []
  if (services.some(s => s.current_status === 'down'))     return 'outage'
  if (services.some(s => s.current_status === 'unknown'))  return 'degraded'
  return 'op'
})

const statusHeadline = computed(() => ({
  op:       'All systems operational',
  degraded: 'Partial degradation',
  outage:   'Active incident in progress',
}[overallStatus.value]))

// ── Landing page data ─────────────────────────────────────────────────────────
const navLinks = ['Product', 'Status pages', 'Pricing', 'Docs', 'Changelog']

const features = [
  {
    icon: 'globe',
    title: 'Check from 4 regions',
    body: 'Every 30s from us-east, us-west, eu-west, and ap-south. We only alert when 2 of 3 agree a service is down — no false pages from flaky internet.',
    footer: { type: 'uptime', seed: 2 },
  },
  {
    icon: 'chart',
    title: 'Status pages on your domain',
    body: 'status.yourapp.com, no Pulse branding, embeddable widget. Subscribers get email/RSS updates the moment you post.',
    footer: { type: 'domain' },
  },
  {
    icon: 'bell',
    title: 'Alerts you can read at 3am',
    body: 'Slack, Discord, email, webhooks, SMS (Pro). Group flapping checks into a single incident. Auto-resolves when checks recover.',
    footer: { type: 'alert' },
  },
]

const freePlan = [
  '10 HTTP monitors', '3-minute check interval', '1 region',
  'Email alerts', '1 public status page · Pulse subdomain', '90 days of history',
]
const proPlan = [
  'Unlimited HTTP & TCP monitors', '30-second check interval',
  '4 regions, multi-region quorum', 'Slack, Discord, SMS, webhooks',
  'Status pages on your domain · no branding', 'Unlimited team seats', '2 years of history',
]

// Banner colour helpers
function bannerBg(s: string) {
  return { outage: 'var(--status-outage-bg)', degraded: 'var(--status-degraded-bg)', op: 'var(--status-op-bg)' }[s] ?? 'var(--status-op-bg)'
}
function bannerBorder(s: string) {
  return { outage: 'oklch(0.50 0.15 22 / 0.5)', degraded: 'oklch(0.50 0.12 84 / 0.5)', op: 'oklch(0.45 0.13 152 / 0.5)' }[s] ?? 'oklch(0.45 0.13 152 / 0.5)'
}
function serviceStatus(s: string): 'op' | 'degraded' | 'outage' | 'paused' {
  return ({ ok: 'op', down: 'outage', unknown: 'degraded' } as Record<string, 'op' | 'outage' | 'degraded'>)[s] ?? 'paused'
}
</script>

<template>
  <!-- ═══════════════════════════════════════════════════════════════════════
       PUBLIC STATUS PAGE  (when visiting <slug>.pulse.io)
       ══════════════════════════════════════════════════════════════════════ -->
  <div
    v-if="tenant"
    class="min-h-screen font-sans"
    style="background: var(--bg-canvas); color: var(--fg-primary);"
  >
    <!-- 404 / error state -->
    <div v-if="statusError || !statusData" class="flex items-center justify-center min-h-screen flex-col gap-4">
      <PulseLogo :size="24"/>
      <p class="t-h3" style="color: var(--status-outage);">Status page not found</p>
      <p class="t-sm fg-ter">No org with slug <code class="t-mono">{{ tenant }}</code> exists.</p>
    </div>

    <!-- Status page content -->
    <div v-else class="mx-auto px-4 md:px-8" style="max-width: 880px; padding-top: 40px; padding-bottom: 64px;">

      <!-- Header -->
      <header class="flex items-center justify-between mb-7">
        <div class="flex items-center gap-3">
          <div
            class="grid place-items-center rounded-lg font-bold"
            style="width: 32px; height: 32px; background: var(--pulse-brand-faint); color: var(--pulse-brand); font-size: 15px;"
          >{{ statusData.org.name[0]?.toUpperCase() }}</div>
          <div>
            <div style="font-weight: 600; font-size: 15px;">{{ statusData.org.name }}</div>
            <div class="t-mono fg-qui" style="font-size: 11px;">{{ tenant }}.pulse.io</div>
          </div>
        </div>
        <div class="flex gap-2">
          <button class="pulse-btn sm"><PulseIcon name="bell" :size="11"/>Subscribe</button>
          <button class="pulse-btn sm ghost">History</button>
        </div>
      </header>

      <!-- Overall status banner -->
      <div
        class="pulse-card flex items-center gap-4 mb-8"
        style="padding: 22px;"
        :style="{ border: `1px solid ${bannerBorder(overallStatus)}`, background: bannerBg(overallStatus) }"
      >
        <span
          :class="['pulse-dot', overallStatus]"
          style="width: 14px; height: 14px; flex-shrink: 0;"
          :style="{ boxShadow: `0 0 0 6px ${bannerBg(overallStatus)}` }"
        />
        <div class="flex-1">
          <div class="t-h2" style="font-size: 22px;">{{ statusHeadline }}</div>
          <div class="t-sm fg-sec mt-1">
            Refreshes every 60s · powered by <NuxtLink to="/" class="hover:text-brand transition-colors">Pulse</NuxtLink>
          </div>
        </div>
      </div>

      <!-- Services -->
      <section class="mb-8">
        <div class="flex items-baseline justify-between mb-4">
          <h3 class="t-h3">Components</h3>
          <span class="t-mono fg-qui" style="font-size: 11px;">last 90 days</span>
        </div>
        <div class="pulse-card" style="padding: 0;">
          <div
            v-for="(svc, i) in statusData.services"
            :key="svc.id"
            class="flex items-center gap-4 md:gap-5 px-4 py-4"
            :style="i < statusData.services.length - 1 ? 'border-bottom: 1px solid var(--border-subtle);' : ''"
          >
            <span :class="['pulse-dot', serviceStatus(svc.current_status)]"/>
            <div class="w-[130px] md:w-[200px] shrink-0">
              <div style="font-weight: 500; font-size: 14px;">{{ svc.name }}</div>
              <div class="t-sm fg-qui hidden sm:block truncate" style="max-width: 180px;">{{ svc.url }}</div>
            </div>
            <div class="flex-1">
              <StatusBar :buckets="svc.uptime_buckets_90d" :height="22"/>
            </div>
            <div class="text-right shrink-0" style="min-width: 80px;">
              <div class="t-mono" style="font-size: 13px;">{{ svc.uptime_percent_30d.toFixed(2) }}%</div>
              <div class="t-mono fg-qui" style="font-size: 10px;">{{ svc.current_status }}</div>
            </div>
          </div>
          <div
            v-if="!statusData.services.length"
            class="px-4 py-8 text-center t-sm fg-ter"
          >No services configured.</div>
        </div>
      </section>

      <!-- Active & recent incidents -->
      <section v-if="statusData.incidents.length" class="mb-8">
        <div class="flex items-baseline justify-between mb-4">
          <h3 class="t-h3">
            {{ statusData.incidents.some(i => i.status !== 'resolved') ? 'Active incident' : 'Recent incidents' }}
          </h3>
        </div>
        <div class="flex flex-col gap-4">
          <IncidentCard
            v-for="inc in statusData.incidents"
            :key="inc.id"
            :incident="inc"
          />
        </div>
      </section>

      <!-- Footer -->
      <footer class="flex justify-between pt-4" style="border-top: 1px solid var(--border-subtle);">
        <span class="t-mono fg-qui" style="font-size: 11px;">
          © {{ statusData.org.name }} · status page powered by
          <NuxtLink to="/" class="hover:text-brand transition-colors">Pulse</NuxtLink>
        </span>
        <span class="t-mono fg-qui" style="font-size: 11px;">Atom · RSS · JSON</span>
      </footer>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════════
       MARKETING LANDING PAGE  (pulse.io root domain)
       ══════════════════════════════════════════════════════════════════════ -->
  <div v-else class="min-h-screen font-sans" style="background: var(--bg-canvas); color: var(--fg-primary);">

    <!-- Nav -->
    <nav class="flex items-center justify-between px-4 md:px-8" style="height: 60px; border-bottom: 1px solid var(--border-subtle);">
      <div class="flex items-center gap-4 md:gap-6">
        <PulseLogo :size="20"/>
        <span class="t-mono hidden sm:inline" style="font-size: 11px; padding: 2px 6px; border: 1px solid var(--border-subtle); border-radius: 4px; color: var(--fg-quiet);">v2 · beta</span>
        <div class="hidden lg:flex gap-4 ml-2">
          <a v-for="l in navLinks" :key="l" class="t-sm fg-sec cursor-pointer hover:text-ink transition-colors">{{ l }}</a>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <a class="t-sm fg-sec cursor-pointer hidden sm:inline hover:text-ink transition-colors">Sign in</a>
        <NuxtLink to="/app" class="pulse-btn primary">Start free</NuxtLink>
      </div>
    </nav>

    <!-- Hero -->
    <section class="px-4 md:px-8 mx-auto" style="max-width: 1180px; padding-top: 48px; padding-bottom: 40px;">
      <div class="inline-flex items-center gap-2 rounded-full mb-6" style="padding: 5px 10px 5px 6px; border: 1px solid var(--border-subtle); background: var(--bg-base); font-size: 12px;">
        <span class="pulse-dot op"/>
        <span class="t-mono fg-sec">All Pulse systems operational · 99.998% uptime · 30d</span>
      </div>
      <h1 class="font-semibold" style="font-size: clamp(32px, 6vw, 52px); line-height: 1.05; letter-spacing: -0.025em; max-width: 820px; margin: 0;">
        Uptime monitoring<br/>that <span style="color: var(--pulse-brand);">doesn't shout</span> at you.
      </h1>
      <p class="fg-sec mt-4 mb-7" style="max-width: 560px; font-size: clamp(14px, 2vw, 16px); line-height: 1.55;">
        HTTP checks every 30s from four regions, public status pages on your domain, and alerts that only fire when something is actually wrong. Built for indie devs and small teams.
      </p>
      <div class="flex flex-wrap gap-3 items-center">
        <NuxtLink to="/app/services/new" class="pulse-btn primary lg">Start monitoring — free<PulseIcon name="chev" :size="12" color="var(--fg-on-accent)"/></NuxtLink>
        <NuxtLink to="/status" class="pulse-btn lg">View live demo</NuxtLink>
        <span class="t-sm fg-qui hidden sm:inline" style="margin-left: 4px;">No credit card · 10 monitors free forever</span>
      </div>
      <!-- Hero live-wave card -->
      <div class="pulse-card mt-10 md:mt-14" style="padding: 0; overflow: hidden;">
        <div class="flex items-center justify-between flex-wrap gap-4 px-4 md:px-5 py-4" style="border-bottom: 1px solid var(--border-subtle);">
          <div class="flex items-center gap-3 md:gap-4">
            <span class="t-mono fg-ter flex items-center gap-[6px]" style="font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;"><span class="pulse-dot op" style="width: 6px; height: 6px; box-shadow: none;"/>LIVE FEED</span>
            <span class="t-h4" style="font-size: 14px;">api.acme.dev</span>
            <PulseStatusBadge status="op" size="sm"/>
          </div>
          <div class="flex gap-5 md:gap-7">
            <div class="text-right"><div class="t-mono fg-pri" style="font-size: clamp(14px, 2.5vw, 18px);">99.998<span class="fg-qui" style="font-size: 11px;">%</span></div><div class="t-eyebrow">UPTIME · 30d</div></div>
            <div class="text-right"><div class="t-mono fg-pri" style="font-size: clamp(14px, 2.5vw, 18px);">142<span class="fg-qui" style="font-size: 11px;">ms</span></div><div class="t-eyebrow">AVG · 24h</div></div>
            <div class="text-right"><div class="t-mono fg-pri" style="font-size: clamp(14px, 2.5vw, 18px);">0</div><div class="t-eyebrow">INCIDENTS</div></div>
          </div>
        </div>
        <div class="relative" style="height: clamp(100px, 20vw, 160px); background: linear-gradient(180deg, var(--bg-base), oklch(0.16 0.008 240));">
          <PulseLiveWave :width="1140" :height="160" :beats="5" :spike="0.55" status="op"/>
          <span class="t-mono absolute top-3 left-4" style="font-size: 10px; color: var(--fg-quiet); letter-spacing: 0.08em;">RESPONSE TIME · last 60s</span>
          <span class="t-mono fg-qui absolute bottom-2 right-4" style="font-size: 10px;">now ▸ 142ms · us-east-1</span>
        </div>
        <div class="grid px-4 md:px-5 py-3 gap-4 items-center" style="grid-template-columns: 1fr auto;">
          <PulseUptimeBar :height="20" :seed="4"/>
          <div class="flex gap-6"><span class="t-mono fg-qui" style="font-size: 10px;">90 days</span><span class="t-mono fg-qui" style="font-size: 10px;">today</span></div>
        </div>
      </div>
    </section>

    <!-- Trust logos -->
    <section class="px-4 md:px-8 mx-auto pb-10" style="max-width: 1180px;">
      <div class="t-eyebrow text-center mb-5">TRUSTED BY 4,200+ SMALL TEAMS</div>
      <div class="flex flex-wrap justify-center md:justify-between items-center gap-6 px-0 md:px-10 opacity-50">
        <span v-for="b in ['Rivertide','Halfmoon','Stagework','Notari','Lumen','Patchgrid']" :key="b" class="t-mono fg-ter" style="font-size: 14px; letter-spacing: -0.01em;">{{ b }}</span>
      </div>
    </section>

    <!-- Features -->
    <section class="px-4 md:px-8 mx-auto pb-16" style="max-width: 1180px;">
      <div class="t-eyebrow mb-2">FEATURES</div>
      <h2 class="t-h1 mb-9" style="max-width: 700px;">Built around three honest jobs.</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="feat in features" :key="feat.title" class="pulse-card flex flex-col gap-3" style="padding: 20px;">
          <div class="grid place-items-center rounded-lg" style="width: 32px; height: 32px; background: var(--bg-raised); border: 1px solid var(--border-subtle); color: var(--pulse-brand);">
            <PulseIcon :name="feat.icon" :size="16"/>
          </div>
          <div class="t-h4" style="font-size: 16px;">{{ feat.title }}</div>
          <div class="t-sm fg-sec flex-1">{{ feat.body }}</div>
          <div class="pt-3" style="border-top: 1px solid var(--border-subtle);">
            <PulseUptimeBar v-if="feat.footer.type === 'uptime'" :height="14" :seed="(feat.footer as any).seed"/>
            <div v-else-if="feat.footer.type === 'domain'" class="flex items-center gap-2"><span class="t-mono fg-sec" style="font-size: 11px;">status.yourapp.com</span><span class="pulse-dot op"/></div>
            <div v-else class="t-mono fg-sec flex items-center gap-[6px]" style="font-size: 11px;"><span class="pulse-dot outage"/>503 · webhooks · 13:38 UTC</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section class="px-4 md:px-8 mx-auto pb-24" style="max-width: 1180px;">
      <div class="t-eyebrow mb-2">PRICING</div>
      <h2 class="t-h1 mb-2">Two plans. No seats.</h2>
      <p class="t-body fg-sec mb-8" style="max-width: 500px;">Free tier is genuinely free — no trial, no card. Pro is one flat fee for the whole team.</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4" style="max-width: 820px;">
        <div class="pulse-card flex flex-col gap-4" style="padding: 24px;">
          <div class="flex items-center justify-between"><span class="t-h3">Free</span><span class="t-mono fg-qui" style="font-size: 11px;">for indie devs</span></div>
          <div class="flex items-baseline gap-1"><span class="t-mono" style="font-size: 40px; font-weight: 500;">$0</span><span class="t-mono fg-ter">/forever</span></div>
          <NuxtLink to="/app" class="pulse-btn justify-center" style="width: 100%;">Start free</NuxtLink>
          <hr class="pulse-hr"/>
          <ul class="flex flex-col gap-2" style="list-style: none; padding: 0; margin: 0; font-size: 13px;">
            <li v-for="f in freePlan" :key="f" class="flex items-center gap-2"><PulseIcon name="check" :size="11" color="var(--pulse-brand)"/><span class="fg-sec">{{ f }}</span></li>
          </ul>
        </div>
        <div class="pulse-card flex flex-col gap-4 relative" style="padding: 24px; border-color: var(--pulse-brand-quiet);">
          <span class="absolute font-mono font-semibold" style="top: -10px; right: 16px; background: var(--pulse-brand); color: var(--fg-on-accent); font-size: 10px; padding: 3px 8px; border-radius: 999px; letter-spacing: 0.08em;">POPULAR</span>
          <div class="flex items-center justify-between"><span class="t-h3">Pro</span><span class="t-mono fg-qui" style="font-size: 11px;">for small teams</span></div>
          <div class="flex items-baseline gap-1"><span class="t-mono" style="font-size: 40px; font-weight: 500;">$19</span><span class="t-mono fg-ter">/month, flat</span></div>
          <button class="pulse-btn primary" style="width: 100%; justify-content: center;">Start 14-day trial</button>
          <hr class="pulse-hr"/>
          <ul class="flex flex-col gap-2" style="list-style: none; padding: 0; margin: 0; font-size: 13px;">
            <li v-for="f in proPlan" :key="f" class="flex items-center gap-2"><PulseIcon name="check" :size="11" color="var(--pulse-brand)"/><span class="fg-sec">{{ f }}</span></li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="px-4 md:px-8 py-6 flex flex-wrap items-center justify-between gap-4" style="border-top: 1px solid var(--border-subtle);">
      <PulseLogo :size="16"/>
      <div class="flex gap-5">
        <a class="t-sm fg-ter cursor-pointer hover:text-ink transition-colors">Privacy</a>
        <a class="t-sm fg-ter cursor-pointer hover:text-ink transition-colors">Terms</a>
        <NuxtLink to="/status" class="t-sm fg-ter hover:text-ink transition-colors">Status</NuxtLink>
      </div>
      <span class="t-mono" style="font-size: 11px; color: var(--fg-quiet);">© 2026 Pulse</span>
    </footer>

  </div>
</template>
