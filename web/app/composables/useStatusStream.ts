export interface CheckEvent {
  service_id: string
  org_id: string
  ok: boolean
  status_code: number
  response_ms: number
  checked_at: string
}

export interface ResultResponse {
  id: number
  service_id: string
  org_id: string
  checked_at: string
  ok: boolean
  status_code: number | null
  response_ms: number | null
  error: string | null
}

export const useStatusStream = () => {
  const session = useSupabaseSession()
  const config = useRuntimeConfig()

  // serviceId → latest check event from SSE
  const latest = reactive<Record<string, CheckEvent>>({})
  // serviceId → last ≤60 response_ms values, oldest-first
  const sparklines = reactive<Record<string, number[]>>({})

  let es: EventSource | null = null

  const connect = () => {
    if (!import.meta.client) return
    const token = session.value?.access_token
    if (!token) return

    const apiBase = (config.public.apiBase as string) || ''
    es = new EventSource(`${apiBase}/api/stream?token=${encodeURIComponent(token)}`)

    es.addEventListener('check', (raw: MessageEvent) => {
      const e: CheckEvent = JSON.parse(raw.data)
      latest[e.service_id] = e

      const arr = sparklines[e.service_id] ?? []
      arr.push(e.response_ms)
      if (arr.length > 60) arr.shift()
      sparklines[e.service_id] = arr
    })

    // EventSource reconnects automatically on network errors
    es.onerror = () => {}
  }

  // Pre-populate latest + sparklines from a batch of pre-fetched results.
  // Call this after fetching initial results from /api/services/{id}/results.
  const init = (resultsByService: Record<string, ResultResponse[]>) => {
    for (const [serviceId, results] of Object.entries(resultsByService)) {
      // results are ASC (oldest → newest)
      const last = results.at(-1)
      if (last) {
        latest[serviceId] = {
          service_id: serviceId,
          org_id: last.org_id,
          ok: last.ok,
          status_code: last.status_code ?? 0,
          response_ms: last.response_ms ?? 0,
          checked_at: last.checked_at,
        }
      }
      sparklines[serviceId] = results.map(r => r.response_ms ?? 0)
    }
  }

  onMounted(() => connect())

  onScopeDispose(() => {
    es?.close()
    es = null
  })

  // Reconnect when the session token changes (e.g. after refresh)
  watch(
    () => session.value?.access_token,
    (next, prev) => {
      if (next !== prev) {
        es?.close()
        connect()
      }
    },
  )

  return { latest, sparklines, init }
}
