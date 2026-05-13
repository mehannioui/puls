<script setup lang="ts">
const route = useRoute()

const activeKey = computed(() => {
  const path = route.path
  if (path.startsWith('/app/integrations')) return 'integrations'
  if (path.startsWith('/app/incidents'))    return 'alerts'
  if (path.startsWith('/app/services'))     return 'services'
  if (path.startsWith('/app/status-pages')) return 'statuspages'
  return 'services'
})
</script>

<template>
  <div
    class="flex font-sans antialiased overflow-hidden"
    style="height: 100dvh; background: var(--bg-canvas); color: var(--fg-primary);"
  >
    <!-- Sidebar: hidden on mobile, 60px on md, 220px on lg -->
    <div
      class="hidden md:block shrink-0 w-[60px] lg:w-[220px] transition-[width] duration-200"
      style="background: var(--bg-base); border-right: 1px solid var(--border-subtle);"
    >
      <PulseSidebar :active="activeKey"/>
    </div>

    <!-- Main content column -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <slot/>
    </div>

    <!-- Mobile bottom tab bar -->
    <PulseMobileTabBar :active="activeKey"/>
  </div>
</template>
