<script setup lang="ts">
definePageMeta({ layout: 'app' })

const route = useRoute()
const { getById } = useMockIncidents()
const incident = computed(() => getById(route.params.id as string))

const commsMessages = [
  { who: 'pulse-bot', t: '13:38', system: true, text: '🔴 incident opened · webhook-503 · 3/3 regions failing' },
  { who: 'sam',  t: '13:39', text: 'On it — opening war-room' },
  { who: 'sam',  t: '13:42', text: 'reproduced from my laptop: connection accepted, then 503 after ~30s' },
  { who: 'maya', t: '13:44', text: 'looks like the queue worker pool. metrics show stuck connections climbing since 13:30' },
  { who: 'pulse-bot', t: '13:51', system: true, text: '⚠️ pulse-cdn now degraded · likely related' },
  { who: 'sam',  t: '13:55', text: 'rolling back d4f2a1 now. eta 4 min.' },
]

const runbook = [
  { done: true,  text: 'Acknowledge page & open war-room', who: 'sam · 13:39' },
  { done: true,  text: 'Confirm via curl from outside Pulse infra', who: 'sam · 13:42' },
  { done: false, text: 'Roll back deploy d4f2a1 (last green)', current: true },
  { done: false, text: 'Drain queue worker pool, restart' },
  { done: false, text: 'Post customer-facing update on status.pulse.dev' },
]

const regions = [
  { name: 'us-east-1',  status: 'outage' as const, code: '503', t: '—' },
  { name: 'us-west-2',  status: 'outage' as const, code: '503', t: '—' },
  { name: 'eu-west-1',  status: 'outage' as const, code: '503', t: '—' },
  { name: 'ap-south-1', status: 'op'     as const, code: '200', t: '186ms' },
]

const { checks } = useMockChecks(computed(() => '3'))
const newMessage = ref('')
</script>

<template>
  <div v-if="incident" class="flex flex-col min-h-0 flex-1 overflow-hidden">
    <!-- Hot incident topbar -->
    <div
      class="relative flex items-center justify-between px-4 md:px-6 shrink-0 overflow-hidden"
      style="height: 64px; border-bottom: 1px solid oklch(0.50 0.15 22 / 0.5); background: linear-gradient(180deg, var(--status-outage-bg), oklch(0.18 0.04 22 / 0.4));"
    >
      <div class="absolute inset-0 pointer-events-none" style="opacity: 0.35;">
        <PulseLiveWave :width="1200" :height="64" :beats="4" :spike="0.7" status="outage" :show-fill="false" :show-marker="false"/>
      </div>
      <div class="relative flex items-center gap-4">
        <PulseStatusBadge status="outage" label="ACTIVE INCIDENT"/>
        <div class="hidden md:block">
          <div style="font-size: 16px; font-weight: 600;">{{ incident.title }}</div>
          <div class="t-mono fg-ter" style="font-size: 11px;">{{ incident.id }} · {{ incident.serviceName }} · started {{ incident.startedAt }}</div>
        </div>
      </div>
      <div class="relative flex items-center gap-3 md:gap-4">
        <div class="text-right hidden sm:block">
          <div class="t-mono" style="font-size: 22px; color: var(--status-outage);">{{ incident.duration }}</div>
          <div class="t-eyebrow">DURATION</div>
        </div>
        <button class="pulse-btn hidden md:flex"><PulseIcon name="bell" :size="12"/>Page on-call</button>
        <button class="pulse-btn primary"><PulseIcon name="check" :size="12"/>Mark resolved</button>
      </div>
    </div>

    <!-- Mobile incident header -->
    <div class="md:hidden px-4 py-3" style="border-bottom: 1px solid var(--border-subtle);">
      <div style="font-size: 16px; font-weight: 600;">{{ incident.title }}</div>
      <div class="t-mono fg-ter mt-1" style="font-size: 11px;">{{ incident.serviceName }} · started {{ incident.startedAt }}</div>
    </div>

    <!-- Main grid -->
    <div class="flex-1 overflow-auto pb-24 md:pb-4">
      <div class="p-4 flex flex-col gap-4 md:grid md:gap-[14px] md:[grid-template-columns:1.5fr_1fr] md:[grid-template-rows:auto_auto_1fr]">

        <!-- Live response wave -->
        <div class="pulse-card overflow-hidden md:col-[1/2]">
          <div class="flex justify-between items-center px-4 py-3" style="border-bottom: 1px solid var(--border-subtle);">
            <div class="flex items-center gap-[10px]">
              <span class="pulse-dot outage"/>
              <span class="t-h4" style="font-size: 13px;">Response time · live</span>
              <span class="t-mono fg-qui" style="font-size: 11px;">last 5 min</span>
            </div>
            <div class="hidden sm:flex gap-5">
              <span class="t-mono"><span style="color: var(--status-outage);">3.21s</span><span class="fg-qui text-[11px]"> p95</span></span>
              <span class="t-mono"><span style="color: var(--status-degraded);">1.82s</span><span class="fg-qui text-[11px]"> avg</span></span>
              <span class="t-mono"><span class="fg-pri">87</span><span class="fg-qui text-[11px]"> /min</span></span>
            </div>
          </div>
          <div style="height: 160px; position: relative;">
            <PulseLiveWave :width="780" :height="160" :beats="4" :spike="0.75" status="outage"/>
            <span class="t-mono absolute top-[10px] left-[14px]" style="font-size: 10px; color: var(--fg-quiet); letter-spacing: 0.08em;">RTT · ms</span>
          </div>
        </div>

        <!-- Regions grid (stacks on mobile, right col on desktop) -->
        <div class="pulse-card md:col-[2/3] md:row-[1/2]" style="padding: 16px;">
          <div class="flex justify-between items-center mb-3">
            <span class="t-h4" style="font-size: 13px;">Regions <span class="t-mono fg-qui font-normal" style="font-size: 11px;">4 monitoring</span></span>
            <span class="t-mono" style="font-size: 11px; color: var(--status-outage);">3/4 reporting</span>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="r in regions"
              :key="r.name"
              class="rounded-[6px] p-[10px]"
              :style="{
                background: r.status === 'outage' ? 'var(--status-outage-bg)' : 'var(--status-op-bg)',
                border: `1px solid ${r.status === 'outage' ? 'oklch(0.50 0.15 22 / 0.4)' : 'oklch(0.45 0.13 152 / 0.4)'}`,
              }"
            >
              <div class="flex items-center gap-[6px] mb-1">
                <span :class="['pulse-dot', r.status]" style="width: 6px; height: 6px; box-shadow: none;"/>
                <span class="t-mono fg-pri" style="font-size: 11px;">{{ r.name }}</span>
              </div>
              <div class="t-mono" style="font-size: 14px;" :style="{ color: r.status === 'outage' ? 'var(--status-outage)' : 'var(--status-op)' }">
                {{ r.code }} <span style="color: var(--fg-tertiary); font-size: 11px;">· {{ r.t }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Runbook -->
        <div class="pulse-card md:col-[1/2]" style="padding: 16px;">
          <div class="flex items-center justify-between mb-3">
            <span class="t-h4" style="font-size: 13px;">Runbook · webhook-503</span>
            <span class="t-mono fg-qui" style="font-size: 11px;">2 / 5 complete</span>
          </div>
          <div class="flex flex-col gap-2">
            <div
              v-for="(step, i) in runbook"
              :key="i"
              class="flex items-center gap-[10px] rounded-[6px]"
              style="padding: 8px 10px;"
              :style="{
                background: step.current ? 'var(--pulse-brand-faint)' : 'var(--bg-raised)',
                border: `1px solid ${step.current ? 'var(--pulse-brand-quiet)' : 'var(--border-subtle)'}`,
              }"
            >
              <span
                class="grid place-items-center rounded-[4px] shrink-0"
                style="width: 16px; height: 16px;"
                :style="{
                  background: step.done ? 'var(--pulse-brand)' : 'transparent',
                  border: `1px solid ${step.done ? 'var(--pulse-brand)' : 'var(--border-default)'}`,
                }"
              >
                <PulseIcon v-if="step.done" name="check" :size="10" color="var(--pulse-on-brand)"/>
              </span>
              <span
                class="flex-1"
                style="font-size: 13px;"
                :style="{
                  color: step.done ? 'var(--fg-tertiary)' : 'var(--fg-primary)',
                  textDecoration: step.done ? 'line-through' : 'none',
                }"
              >{{ step.text }}</span>
              <span v-if="step.who" class="t-mono fg-qui" style="font-size: 10px;">{{ step.who }}</span>
              <span
                v-if="step.current"
                class="t-mono"
                style="font-size: 10px; padding: 1px 6px; border-radius: 999px; background: var(--pulse-brand-faint); color: var(--pulse-brand); letter-spacing: 0.08em; text-transform: uppercase;"
              >now</span>
            </div>
          </div>
        </div>

        <!-- Comms panel (right col, spans 2 rows on desktop) -->
        <div class="pulse-card flex flex-col md:col-[2/3] md:row-[2/4]" style="min-height: 280px;">
          <div class="flex justify-between items-center px-4 py-3" style="border-bottom: 1px solid var(--border-subtle);">
            <div class="flex items-center gap-[10px]">
              <span class="t-h4" style="font-size: 13px;">Comms</span>
              <span class="t-mono fg-qui" style="font-size: 11px;">· #ops-alerts</span>
            </div>
            <button class="pulse-btn sm ghost"><PulseIcon name="ext" :size="11"/>Open Slack</button>
          </div>
          <div class="flex-1 overflow-auto p-4 flex flex-col gap-[10px]">
            <div v-for="(msg, i) in commsMessages" :key="i" class="flex gap-[10px] items-start">
              <div
                v-if="msg.system"
                class="grid place-items-center rounded-[6px] shrink-0"
                style="width: 22px; height: 22px; background: var(--bg-overlay);"
              >
                <PulseLogo :size="12" :with-wordmark="false"/>
              </div>
              <div
                v-else
                class="grid place-items-center rounded-full shrink-0 font-semibold"
                style="width: 22px; height: 22px; font-size: 10px; color: var(--fg-on-accent);"
                :style="{ background: msg.who === 'sam' ? 'oklch(0.55 0.1 280)' : 'oklch(0.6 0.12 30)' }"
              >{{ msg.who[0].toUpperCase() }}</div>
              <div class="flex-1 min-w-0">
                <div class="flex gap-[6px] items-baseline">
                  <span style="font-size: 12px; font-weight: 500;" :style="{ color: msg.system ? 'var(--fg-tertiary)' : 'var(--fg-primary)' }">{{ msg.who }}</span>
                  <span class="t-mono fg-qui" style="font-size: 10px;">{{ msg.t }}</span>
                </div>
                <div class="t-sm mt-[1px]" :style="{ color: msg.system ? 'var(--fg-tertiary)' : 'var(--fg-secondary)' }">{{ msg.text }}</div>
              </div>
            </div>
          </div>
          <div class="p-3" style="border-top: 1px solid var(--border-subtle);">
            <div class="flex gap-2 items-center">
              <input
                v-model="newMessage"
                class="pulse-input"
                placeholder="Post update to #ops-alerts + status page..."
                style="height: 30px; font-size: 12px;"
              />
              <button class="pulse-btn sm primary">Post</button>
            </div>
          </div>
        </div>

        <!-- Check log -->
        <div class="pulse-card flex flex-col overflow-hidden md:col-[1/2]">
          <div class="flex justify-between items-center px-4 py-3" style="border-bottom: 1px solid var(--border-subtle);">
            <span class="t-h4" style="font-size: 13px;">Recent checks · {{ incident.serviceName }}</span>
            <span class="t-mono fg-qui" style="font-size: 11px;">30s interval</span>
          </div>
          <div class="hidden md:block">
            <div
              v-for="(c, i) in checks"
              :key="i"
              class="font-mono"
              style="display: grid; grid-template-columns: 88px 88px 56px 70px 1fr; gap: 12px; padding: 4px 16px; align-items: center; font-size: 12px;"
            >
              <span class="fg-qui">{{ c.t }}</span>
              <span class="fg-sec">{{ c.region }}</span>
              <span :style="{ color: c.code >= 500 ? 'var(--status-outage)' : c.degraded ? 'var(--status-degraded)' : 'var(--status-op)' }">{{ c.code }}</span>
              <span class="fg-pri">{{ c.ms }}{{ c.ms !== '—' ? 'ms' : '' }}</span>
              <span class="fg-ter" style="font-size: 11px;">{{ c.err ?? '—' }}</span>
            </div>
          </div>
          <div class="md:hidden">
            <div
              v-for="(c, i) in checks.slice(0, 4)"
              :key="i"
              class="flex items-center gap-3 px-4 py-2 font-mono text-xs"
              :style="i < 3 ? 'border-bottom: 1px solid var(--border-subtle);' : ''"
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
    <p class="t-sm fg-ter">Incident not found.</p>
  </div>
</template>
