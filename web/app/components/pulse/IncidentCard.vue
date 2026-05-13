<script setup lang="ts">
export interface IncidentUpdate {
  id: string
  status: string
  body: string
  created_at: string
}

export interface Incident {
  id: string
  title: string
  status: string
  severity: string
  started_at: string
  resolved_at?: string | null
  updates: IncidentUpdate[]
}

const props = defineProps<{ incident: Incident }>()

const isOpen = computed(() => props.incident.status !== 'resolved')

const severityLabel: Record<string, string> = {
  minor: 'Minor', major: 'Major', critical: 'Critical',
}

const timelineItems = computed(() =>
  props.incident.updates.map(u => ({
    time: formatTime(u.created_at),
    status: u.status as 'op' | 'degraded' | 'outage' | 'maint',
    statusLabel: u.status,
    title: u.body,
  }))
)

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'UTC', timeZoneName: 'short',
  })
}

function formatStart(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'UTC', timeZoneName: 'short',
  })
}
</script>

<template>
  <div class="pulse-card" style="padding: 20px;">
    <!-- Header -->
    <div class="flex items-start justify-between gap-3 mb-3">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          <PulseStatusBadge
            :status="isOpen ? (incident.status === 'investigating' ? 'outage' : 'degraded') : 'op'"
            :label="incident.status"
            size="sm"
          />
          <span
            class="t-mono"
            style="font-size: 10px; padding: 1px 6px; border-radius: 999px; letter-spacing: 0.08em; text-transform: uppercase;"
            :style="{
              background: incident.severity === 'critical' ? 'var(--status-outage-bg)' :
                          incident.severity === 'major'    ? 'var(--status-degraded-bg)' :
                          'var(--bg-raised)',
              color: incident.severity === 'critical' ? 'var(--status-outage)' :
                     incident.severity === 'major'    ? 'var(--status-degraded)' :
                     'var(--fg-tertiary)',
            }"
          >{{ severityLabel[incident.severity] ?? incident.severity }}</span>
        </div>
        <div class="font-semibold" style="font-size: 16px; letter-spacing: -0.008em;">{{ incident.title }}</div>
      </div>
      <div class="t-mono fg-qui shrink-0 text-right" style="font-size: 11px;">
        <div>{{ formatStart(incident.started_at) }}</div>
        <div v-if="incident.resolved_at" class="t-mono" style="color: var(--status-op); margin-top: 2px;">Resolved</div>
        <div v-else style="color: var(--status-outage); margin-top: 2px;">Ongoing</div>
      </div>
    </div>

    <!-- Updates timeline -->
    <div v-if="incident.updates.length > 0" style="margin-top: 14px;">
      <PulseIncidentTimeline :items="timelineItems"/>
    </div>
    <div v-else class="t-sm fg-ter" style="margin-top: 8px;">No updates yet.</div>
  </div>
</template>
