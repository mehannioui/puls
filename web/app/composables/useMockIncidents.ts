export interface IncidentUpdate {
  time: string
  status: 'op' | 'degraded' | 'outage' | 'maint'
  statusLabel: string
  title: string
  body?: string
}

export interface MockIncident {
  id: string
  title: string
  serviceId: string
  serviceName: string
  severity: 'critical' | 'high' | 'medium'
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved'
  startedAt: string
  duration: string
  updates: IncidentUpdate[]
}

const INCIDENTS: MockIncident[] = [
  {
    id: 'inc-001',
    title: 'Webhook delivery is failing',
    serviceId: '3',
    serviceName: 'pulse-webhooks',
    severity: 'critical',
    status: 'investigating',
    startedAt: '13:38 UTC',
    duration: '00:24:17',
    updates: [
      {
        time: '14:18 UTC',
        status: 'degraded',
        statusLabel: 'identified',
        title: 'Root cause identified',
        body: 'Stuck connection pool in queue worker. Rolling restart in progress.',
      },
      {
        time: '14:08 UTC',
        status: 'outage',
        statusLabel: 'investigating',
        title: 'Engineers paged',
        body: 'On-call acknowledged. Looking at metrics now.',
      },
      {
        time: '14:02 UTC',
        status: 'outage',
        statusLabel: 'detected',
        title: 'Automated detection',
        body: '3 consecutive failures across 3 regions.',
      },
    ],
  },
  {
    id: 'inc-002',
    title: 'Brief 5xx spike — auto-resolved',
    serviceId: '3',
    serviceName: 'pulse-webhooks',
    severity: 'medium',
    status: 'resolved',
    startedAt: '09:02 UTC · yesterday',
    duration: '00:04:30',
    updates: [
      {
        time: '09:06 UTC',
        status: 'op',
        statusLabel: 'resolved',
        title: 'Auto-resolved',
        body: 'All checks passing. Spike was transient.',
      },
      {
        time: '09:02 UTC',
        status: 'outage',
        statusLabel: 'detected',
        title: 'Elevated 5xx rate detected',
      },
    ],
  },
]

export function useMockIncidents() {
  const incidents = ref<MockIncident[]>(INCIDENTS)

  function getById(id: string) {
    return incidents.value.find(inc => inc.id === id)
  }

  return { incidents, getById }
}
