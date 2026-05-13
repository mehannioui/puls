<script setup lang="ts">
definePageMeta({ layout: 'app' })

const integrations = [
  { id: 'slack',     name: 'Slack',           desc: 'Channel + DM alerts, rich incident cards.',  cat: 'Chat',          fg: '#E01E5A', connected: true,  channels: '#ops-alerts · #status' },
  { id: 'discord',   name: 'Discord',         desc: 'Webhook posts to a channel or thread.',      cat: 'Chat',          fg: '#5865F2', connected: true,  channels: 'ops · status' },
  { id: 'pagerduty', name: 'PagerDuty',       desc: 'Page on-call rotations with severity.',      cat: 'On-call',       fg: '#06AC38', connected: false },
  { id: 'opsgenie',  name: 'Opsgenie',        desc: 'Route alerts through schedules.',            cat: 'On-call',       fg: '#172B4D', connected: false },
  { id: 'webhook',   name: 'Webhooks',        desc: 'POST JSON to any endpoint. Signed.',         cat: 'Custom',        fg: 'var(--pulse-brand)', connected: true, channels: '2 endpoints' },
  { id: 'email',     name: 'Email',           desc: 'Per-user routing + digest mode.',            cat: 'Notify',        fg: '#7C7CC2', connected: true,  channels: '3 recipients' },
  { id: 'sms',       name: 'SMS · Twilio',    desc: 'Critical-only by default. Pro plan.',        cat: 'Notify',        fg: '#F22F46', connected: false, pro: true },
  { id: 'telegram',  name: 'Telegram',        desc: 'Bot posts to a channel.',                   cat: 'Chat',          fg: '#26A5E4', connected: false },
  { id: 'teams',     name: 'Microsoft Teams', desc: 'Adaptive cards in any channel.',            cat: 'Chat',          fg: '#5059C9', connected: false },
  { id: 'datadog',   name: 'Datadog',         desc: 'Mirror Pulse metrics into Datadog.',        cat: 'Observability', fg: '#632CA6', connected: false, pro: true },
  { id: 'grafana',   name: 'Grafana Cloud',   desc: 'Pulse as a Grafana data source.',           cat: 'Observability', fg: '#F46800', connected: false, pro: true },
  { id: 'github',    name: 'GitHub',          desc: 'Open issues on incident, link PRs.',        cat: 'Workflow',      fg: '#8b949e', connected: false },
]

const activeFilter = ref('All')
const filters = ['All', 'Chat', 'On-call', 'Notify', 'Observability', 'Custom']

const filtered = computed(() =>
  activeFilter.value === 'All'
    ? integrations
    : integrations.filter(i => i.cat === activeFilter.value)
)

const connected = computed(() => integrations.filter(i => i.connected).length)

function tileStyle(fg: string) {
  const isVar = fg.startsWith('var(')
  return {
    background: isVar ? 'var(--pulse-brand-faint)' : fg + '22',
    border: '1px solid var(--border-subtle)',
  }
}
</script>

<template>
  <div class="flex flex-col min-h-0 flex-1 overflow-hidden">
    <PulseTopbar
      title="Integrations"
      :crumbs="[{ label: 'Settings' }, { label: 'Integrations' }]"
    >
      <button class="pulse-btn hidden md:flex"><PulseIcon name="plug" :size="12"/>Build custom</button>
      <button class="pulse-btn primary hidden md:flex"><PulseIcon name="plus" :size="12"/>New integration</button>
    </PulseTopbar>

    <div class="flex-1 overflow-auto pb-24 md:pb-6">
      <div class="max-w-[1400px] mx-auto p-4 md:p-6 flex flex-col gap-4 md:gap-[18px]">

        <!-- Summary strip -->
        <div class="pulse-card hidden md:grid" style="padding: 16px; grid-template-columns: repeat(4, 1fr);">
          <div
            v-for="(s, i) in [
              { label: 'Connected',         value: String(connected), sub: `of ${integrations.length} available` },
              { label: 'Last alert routed', value: '13:38',     sub: 'webhook-503 → 3 channels' },
              { label: 'Delivery rate · 24h',value: '99.6%',   sub: '212 / 213 succeeded' },
              { label: 'On-call schedule',  value: 'sam',       sub: 'until tomorrow 09:00' },
            ]"
            :key="i"
            class="px-4"
            :style="i > 0 ? 'border-left: 1px solid var(--border-subtle);' : ''"
          >
            <div class="t-eyebrow">{{ s.label }}</div>
            <div class="t-mono fg-pri" style="font-size: 22px; margin-top: 4px;">{{ s.value }}</div>
            <div class="t-sm fg-qui" style="margin-top: 2px;">{{ s.sub }}</div>
          </div>
        </div>

        <!-- Filter bar -->
        <div class="flex items-center gap-2 flex-wrap">
          <span class="t-mono fg-ter hidden md:inline" style="font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;">FILTER</span>
          <button
            v-for="f in filters"
            :key="f"
            class="pulse-btn sm"
            :class="activeFilter === f ? '' : 'ghost'"
            @click="activeFilter = f"
          >{{ f }}</button>
          <div class="flex-1"/>
          <span class="t-mono fg-qui" style="font-size: 11px;">{{ filtered.length }} integrations</span>
        </div>

        <!-- Integration grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <div
            v-for="it in filtered"
            :key="it.id"
            class="pulse-card flex flex-col gap-3"
            style="padding: 16px; min-height: 160px;"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="grid place-items-center rounded-[8px]" style="width: 36px; height: 36px;" :style="tileStyle(it.fg)">
                <div class="rounded-[4px]" style="width: 16px; height: 16px;" :style="{ background: it.fg }"/>
              </div>
              <span v-if="it.connected" class="flex items-center gap-[5px] font-mono" style="font-size: 11px; padding: 2px 7px; border-radius: 999px; background: var(--status-op-bg); color: var(--status-op); border: 1px solid oklch(0.45 0.13 152 / 0.4);">
                <span class="pulse-dot op" style="width: 5px; height: 5px; box-shadow: none;"/>Connected
              </span>
              <span v-else-if="(it as any).pro" class="font-mono" style="font-size: 10px; padding: 2px 6px; border-radius: 999px; background: var(--pulse-brand-faint); color: var(--pulse-brand); border: 1px solid var(--pulse-brand-quiet); letter-spacing: 0.08em;">PRO</span>
            </div>
            <div class="flex-1">
              <div style="font-weight: 500; font-size: 14px;">{{ it.name }}</div>
              <div class="t-mono fg-qui" style="font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 1px;">{{ it.cat }}</div>
              <div class="t-sm fg-sec mt-2">{{ it.desc }}</div>
            </div>
            <div class="flex items-center justify-between">
              <span v-if="(it as any).channels" class="t-mono fg-ter" style="font-size: 11px;">{{ (it as any).channels }}</span>
              <span v-else/>
              <button class="pulse-btn sm" :class="it.connected ? 'ghost' : ''">{{ it.connected ? 'Configure' : 'Connect' }}</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
