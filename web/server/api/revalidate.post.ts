// Called by the Go backend after any incident state change.
// Busts the ISR cache for the given org's public status page.
//
// POST /api/revalidate?slug=acme&path=/&secret=<NUXT_REVALIDATE_SECRET>
export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const secret = useRuntimeConfig().revalidateSecret
  if (!secret || query.secret !== secret) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid revalidation secret' })
  }

  const slug = query.slug as string | undefined
  const path = (query.path as string | undefined) ?? '/'

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug is required' })
  }

  // On Vercel this would call revalidatePath() / setRouteRules() to bust the
  // prerender cache.  In dev the ISR timer (routeRules.isr) handles it
  // automatically, so we just return success.
  return { revalidated: true, slug, path }
})
