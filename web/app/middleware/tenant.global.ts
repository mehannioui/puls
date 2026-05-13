import { getRequestHeader } from 'h3'

export default defineNuxtRouteMiddleware((to) => {
  const tenantState = useState<string | null>('tenant', () => null)

  if (import.meta.server) {
    const event = useRequestEvent()
    if (!event) return

    const host = getRequestHeader(event, 'host') ?? ''

    // Production: <slug>.pulse.io
    const match = host.match(/^([a-z0-9][a-z0-9-]{0,61})\.pulse\.io(?::\d+)?$/)
    const slugFromHost = match?.[1]

    if (slugFromHost && slugFromHost !== 'www') {
      tenantState.value = slugFromHost
      return
    }

    // Local dev: ?tenant=<slug> query param also works server-side
    const slugFromQuery = to.query.tenant as string | undefined
    if (slugFromQuery) {
      tenantState.value = slugFromQuery
    }
  }

  // Client-side: keep state in sync when navigating
  if (import.meta.client) {
    const slugFromQuery = to.query.tenant as string | undefined
    if (slugFromQuery) {
      tenantState.value = slugFromQuery
    }
  }
})
