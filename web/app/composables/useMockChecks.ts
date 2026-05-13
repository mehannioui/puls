export interface CheckResult {
  t: string
  region: string
  code: number
  ms: string
  err?: string
  degraded?: boolean
}

function makeChecks(serviceId: string): CheckResult[] {
  if (serviceId === '3') {
    return [
      { t: '14:02:08', region: 'us-east-1',  code: 503, ms: '—',   err: 'upstream timeout' },
      { t: '14:02:08', region: 'us-west-2',  code: 503, ms: '—',   err: 'upstream timeout' },
      { t: '14:02:08', region: 'eu-west-1',  code: 503, ms: '—',   err: 'upstream timeout' },
      { t: '14:02:08', region: 'ap-south-1', code: 200, ms: '186' },
      { t: '14:01:38', region: 'us-east-1',  code: 503, ms: '—',   err: 'upstream timeout' },
      { t: '14:01:38', region: 'us-west-2',  code: 503, ms: '—',   err: 'upstream timeout' },
      { t: '14:01:38', region: 'eu-west-1',  code: 200, ms: '2418', degraded: true },
      { t: '14:01:38', region: 'ap-south-1', code: 200, ms: '178' },
    ]
  }
  return [
    { t: '14:02:08', region: 'us-east-1',  code: 200, ms: '142' },
    { t: '14:02:08', region: 'us-west-2',  code: 200, ms: '168' },
    { t: '14:02:08', region: 'eu-west-1',  code: 200, ms: '224' },
    { t: '14:02:08', region: 'ap-south-1', code: 200, ms: '312' },
    { t: '14:01:38', region: 'us-east-1',  code: 200, ms: '138' },
    { t: '14:01:38', region: 'us-west-2',  code: 200, ms: '152' },
    { t: '14:01:38', region: 'eu-west-1',  code: 200, ms: '198' },
    { t: '14:01:38', region: 'ap-south-1', code: 200, ms: '287' },
  ]
}

export function useMockChecks(serviceId: MaybeRef<string>) {
  const checks = computed(() => makeChecks(toValue(serviceId)))
  return { checks }
}
