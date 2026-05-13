<script setup lang="ts">
definePageMeta({ layout: 'default' })

const url = ref('https://api.yourapp.com/health')
const name = ref('Production API')
const interval = ref('30s')
const regions = ref(['us-e', 'us-w', 'eu'])
const alertEmail = ref(true)
const alertSlack = ref(true)

const intervals = ['30s', '1m', '5m', '15m']
const regionOptions = ['us-e', 'us-w', 'eu', 'ap']

function toggleRegion(r: string) {
  const idx = regions.value.indexOf(r)
  if (idx >= 0) regions.value.splice(idx, 1)
  else regions.value.push(r)
}
</script>

<template>
  <div
    class="min-h-screen grid place-items-center px-4 py-8 font-sans"
    style="background: oklch(0.14 0.008 240); color: var(--fg-primary);"
  >
    <div
      class="w-full rounded-xl overflow-hidden"
      style="max-width: 480px; background: var(--bg-overlay); border: 1px solid var(--border-subtle); box-shadow: var(--shadow-pop);"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 pt-5 pb-3">
        <div>
          <div class="t-eyebrow mb-1">STEP 1 OF 3</div>
          <div class="t-h3">Add your first monitor</div>
        </div>
        <NuxtLink to="/app" class="pulse-btn ghost sm" style="padding: 0 6px; font-size: 16px; color: var(--fg-tertiary);">×</NuxtLink>
      </div>
      <hr class="pulse-hr"/>

      <!-- Form body -->
      <div class="px-6 py-[18px] flex flex-col gap-4">
        <!-- URL -->
        <div class="flex flex-col gap-[6px]">
          <label class="t-mono fg-ter" style="font-size: 11px; letter-spacing: 0.05em;">URL</label>
          <div class="relative">
            <span class="t-mono fg-qui absolute left-[10px] top-[9px]" style="font-size: 12px;">GET</span>
            <input
              v-model="url"
              class="pulse-input t-mono"
              style="padding-left: 42px; font-size: 13px;"
              placeholder="https://api.yourapp.com/health"
            />
          </div>
          <span class="t-xs fg-qui">We follow redirects and accept 2xx as healthy.</span>
        </div>

        <!-- Name -->
        <div class="flex flex-col gap-[6px]">
          <label class="t-mono fg-ter" style="font-size: 11px; letter-spacing: 0.05em;">Name</label>
          <input v-model="name" class="pulse-input" placeholder="My API"/>
        </div>

        <!-- Interval + Regions -->
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-[6px]">
            <label class="t-mono fg-ter" style="font-size: 11px; letter-spacing: 0.05em;">Check interval</label>
            <div class="flex gap-1">
              <button
                v-for="iv in intervals"
                :key="iv"
                class="pulse-btn sm flex-1"
                :class="interval === iv ? '' : 'ghost'"
                @click="interval = iv"
              >{{ iv }}</button>
            </div>
          </div>
          <div class="flex flex-col gap-[6px]">
            <label class="t-mono fg-ter" style="font-size: 11px; letter-spacing: 0.05em;">Regions</label>
            <div class="flex gap-1">
              <button
                v-for="r in regionOptions"
                :key="r"
                class="pulse-btn sm flex-1"
                :class="regions.includes(r) ? '' : 'ghost'"
                @click="toggleRegion(r)"
              >
                <PulseIcon v-if="regions.includes(r)" name="check" :size="10" color="var(--pulse-brand)"/>
                {{ r }}
              </button>
            </div>
          </div>
        </div>

        <!-- Alert settings -->
        <div
          class="rounded-lg flex flex-col gap-2"
          style="background: var(--bg-raised); border: 1px solid var(--border-subtle); padding: 12px;"
        >
          <div class="flex items-center justify-between mb-1">
            <span class="t-mono fg-ter" style="font-size: 11px; letter-spacing: 0.05em;">ALERT WHEN</span>
            <span class="t-mono fg-qui" style="font-size: 11px;">2 of 3 checks fail</span>
          </div>
          <label class="flex items-center gap-2 cursor-pointer" style="font-size: 13px;" @click="alertEmail = !alertEmail">
            <span
              class="grid place-items-center rounded-[4px]"
              style="width: 14px; height: 14px; flex-shrink: 0;"
              :style="alertEmail ? 'background: var(--pulse-brand)' : 'border: 1px solid var(--border-default)'"
            >
              <PulseIcon v-if="alertEmail" name="check" :size="10" color="var(--fg-on-accent)"/>
            </span>
            Email <span class="fg-qui">— alex@pulse.dev</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer" style="font-size: 13px;" @click="alertSlack = !alertSlack">
            <span
              class="grid place-items-center rounded-[4px]"
              style="width: 14px; height: 14px; flex-shrink: 0;"
              :style="alertSlack ? 'background: var(--pulse-brand)' : 'border: 1px solid var(--border-default)'"
            >
              <PulseIcon v-if="alertSlack" name="check" :size="10" color="var(--fg-on-accent)"/>
            </span>
            Slack <span class="fg-qui">— #ops-alerts</span>
          </label>
          <label class="flex items-center gap-2 cursor-not-allowed" style="font-size: 13px; color: var(--fg-tertiary);">
            <span class="rounded-[4px]" style="width: 14px; height: 14px; border: 1px solid var(--border-default); flex-shrink: 0;"/>
            SMS <span class="fg-qui">— Pro feature</span>
          </label>
        </div>
      </div>

      <hr class="pulse-hr"/>

      <!-- Footer -->
      <div class="flex items-center justify-between px-6 py-3">
        <!-- Step dots -->
        <div class="flex gap-[6px]">
          <span
            v-for="i in 3"
            :key="i"
            class="rounded-full"
            style="height: 3px; width: 18px;"
            :style="i === 1 ? 'background: var(--pulse-brand)' : 'background: var(--border-subtle)'"
          />
        </div>
        <div class="flex gap-2">
          <NuxtLink to="/app" class="pulse-btn ghost">Skip</NuxtLink>
          <button class="pulse-btn primary">
            Run first check <PulseIcon name="bolt" :size="11"/>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
