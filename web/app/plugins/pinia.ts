import { createPinia, setActivePinia } from 'pinia'
import { toRaw } from 'vue'

// @pinia/nuxt 0.11.x has a Nuxt 4 bug: `app:rendered` fires before
// the plugin's `provide` values are set on nuxtApp, so $pinia is
// undefined. This plugin runs first (enforce: pre) and sets $pinia
// directly so @pinia/nuxt's hook can read it.
export default defineNuxtPlugin({
  name: 'pinia-fix',
  enforce: 'pre',
  setup(nuxtApp) {
    const pinia = createPinia()
    nuxtApp.vueApp.use(pinia)
    setActivePinia(pinia)
    if (nuxtApp.payload?.pinia) {
      pinia.state.value = nuxtApp.payload.pinia
    }
    // Set directly so @pinia/nuxt's app:rendered hook finds it
    // @ts-expect-error private property
    nuxtApp.$pinia = pinia

    nuxtApp.hook('app:rendered', () => {
      nuxtApp.payload.pinia = toRaw(pinia).state.value
      setActivePinia(undefined)
    })
  },
})
