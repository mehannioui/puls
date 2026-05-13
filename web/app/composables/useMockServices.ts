export type ServiceStatus = 'op' | 'degraded' | 'outage' | 'paused'

export interface MockService {
  id: string
  name: string
  url: string
  status: ServiceStatus
  uptime: number | null
  p95: number | null
  last: string
  seed: number
  method: string
  interval: string
  regions: string[]
}

const SERVICES: MockService[] = [
  { id: '1', name: 'pulse-api',        url: 'https://api.pulse.dev/health',       status: 'op',       uptime: 99.998, p95: 142,  last: '12s ago', seed: 3,  method: 'GET', interval: '30s', regions: ['us-east','us-west','eu-west','ap-south'] },
  { id: '2', name: 'pulse-dashboard',  url: 'https://app.pulse.dev',              status: 'op',       uptime: 99.982, p95: 268,  last: '8s ago',  seed: 7,  method: 'GET', interval: '30s', regions: ['us-east','us-west','eu-west','ap-south'] },
  { id: '3', name: 'pulse-webhooks',   url: 'https://hooks.pulse.dev/v1/deliver', status: 'outage',   uptime: 98.412, p95: 1820, last: '3s ago',  seed: 1,  method: 'GET', interval: '30s', regions: ['us-east','us-west','eu-west','ap-south'] },
  { id: '4', name: 'pulse-cdn',        url: 'https://cdn.pulse.dev',              status: 'degraded', uptime: 99.804, p95: 412,  last: '5s ago',  seed: 5,  method: 'GET', interval: '1m',  regions: ['us-east','eu-west'] },
  { id: '5', name: 'docs.pulse.dev',   url: 'https://docs.pulse.dev',             status: 'op',       uptime: 99.999, p95: 88,   last: '11s ago', seed: 9,  method: 'GET', interval: '5m',  regions: ['us-east'] },
  { id: '6', name: 'status.pulse.dev', url: 'https://status.pulse.dev',           status: 'op',       uptime: 100.000, p95: 64,  last: '14s ago', seed: 11, method: 'GET', interval: '1m',  regions: ['us-east','eu-west'] },
  { id: '7', name: 'auth.pulse.dev',   url: 'https://auth.pulse.dev',             status: 'op',       uptime: 99.961, p95: 196,  last: '7s ago',  seed: 13, method: 'GET', interval: '30s', regions: ['us-east','us-west','eu-west','ap-south'] },
  { id: '8', name: 'billing-service',  url: 'https://billing.internal',           status: 'paused',   uptime: null,   p95: null, last: 'paused',  seed: 15, method: 'GET', interval: '5m',  regions: ['us-east'] },
]

export function useMockServices() {
  const services = ref<MockService[]>(SERVICES)

  function getById(id: string) {
    return services.value.find(s => s.id === id)
  }

  return { services, getById }
}
