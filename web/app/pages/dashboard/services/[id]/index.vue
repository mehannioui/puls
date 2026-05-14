<script setup lang="ts">
import type { Service } from "~/composables/api/useServices";
import type { ResultResponse } from "~/composables/useStatusStream";

definePageMeta({ middleware: "auth" });

const route = useRoute();
const api = useApi();
const id = route.params.id as string;

const { data: svc, error: svcError } = useAsyncData<Service>(
  `service-detail-${id}`,
  () => api(`/api/services/${id}`),
);

const { data: results, error: resultsError } = useAsyncData<ResultResponse[]>(
  `service-results-${id}`,
  () => api(`/api/services/${id}/results?range=24h`),
  { default: () => [] },
);

const chartData = computed(() =>
  (results.value ?? []).map(r => ({
    checked_at: r.checked_at,
    response_ms: r.response_ms,
    ok: r.ok,
  }))
);

const avgResponseMs = computed(() => {
  const valid = (results.value ?? []).filter(r => r.response_ms != null);
  if (!valid.length) return null;
  return Math.round(valid.reduce((sum, r) => sum + (r.response_ms ?? 0), 0) / valid.length);
});

const uptimePercent = computed(() => {
  const all = results.value ?? [];
  if (!all.length) return null;
  return ((all.filter(r => r.ok).length / all.length) * 100).toFixed(2);
});

const lastCheck = computed(() => {
  const all = results.value ?? [];
  if (!all.length) return null;
  return all[all.length - 1];
});

const currentStatusOk = computed(() => lastCheck.value?.ok ?? null);

function intervalLabel(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  return `${seconds / 60}m`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-5xl px-4 py-8">

      <!-- Back + title -->
      <div class="mb-6 flex items-center gap-3">
        <NuxtLink to="/dashboard" class="text-sm text-indigo-600 hover:text-indigo-900">← Dashboard</NuxtLink>
        <h1 class="text-2xl font-semibold text-gray-900">
          {{ svc?.name ?? 'Service' }}
        </h1>
        <span v-if="currentStatusOk !== null" :class="['inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', currentStatusOk ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
          <span :class="['h-1.5 w-1.5 rounded-full', currentStatusOk ? 'bg-green-500' : 'bg-red-500']" />
          {{ currentStatusOk ? 'Operational' : 'Down' }}
        </span>
      </div>

      <p v-if="svcError" class="mb-4 text-sm text-red-600">Failed to load service.</p>

      <!-- Config strip -->
      <div v-if="svc" class="mb-6 flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
        <span class="font-medium text-gray-700">{{ svc.method }}</span>
        <span class="font-mono text-gray-700">{{ svc.url }}</span>
        <span>Every {{ intervalLabel(svc.interval_seconds) }}</span>
        <span>Timeout {{ svc.timeout_seconds }}s</span>
        <span>Expect {{ svc.expected_status }}</span>
        <NuxtLink :to="`/dashboard/services/${id}/edit`" class="ml-auto text-indigo-600 hover:text-indigo-900">Edit</NuxtLink>
      </div>

      <!-- Metric cards -->
      <div class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-medium uppercase tracking-wider text-gray-500">Uptime · 24h</p>
          <p class="mt-1 text-2xl font-semibold text-gray-900">
            {{ uptimePercent != null ? `${uptimePercent}%` : '—' }}
          </p>
        </div>
        <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-medium uppercase tracking-wider text-gray-500">Avg response · 24h</p>
          <p class="mt-1 text-2xl font-semibold text-gray-900">
            {{ avgResponseMs != null ? `${avgResponseMs}ms` : '—' }}
          </p>
        </div>
        <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-medium uppercase tracking-wider text-gray-500">Checks · 24h</p>
          <p class="mt-1 text-2xl font-semibold text-gray-900">{{ (results ?? []).length }}</p>
        </div>
      </div>

      <!-- Response time chart -->
      <div class="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div class="mb-3 flex items-baseline justify-between">
          <h2 class="text-sm font-semibold text-gray-900">Response time · last 24h</h2>
          <span class="text-xs text-gray-400">ms · failed checks marked red</span>
        </div>
        <p v-if="resultsError" class="text-sm text-red-600">Failed to load results.</p>
        <div v-else class="w-full overflow-hidden">
          <PulseResponseChart
            :data="chartData"
            :width="860"
            :height="180"
            :color="currentStatusOk === false ? '#ef4444' : 'var(--pulse-brand, #6366f1)'"
          />
        </div>
      </div>

      <!-- Recent check log -->
      <div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div class="border-b border-gray-200 px-4 py-3">
          <h2 class="text-sm font-semibold text-gray-900">Recent checks · 24h</h2>
        </div>
        <div v-if="(results ?? []).length === 0" class="px-4 py-8 text-center text-sm text-gray-400">
          No checks recorded yet.
        </div>
        <table v-else class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Time</th>
              <th class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
              <th class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">HTTP</th>
              <th class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Response</th>
              <th class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Error</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="r in [...(results ?? [])].reverse().slice(0, 50)" :key="r.id">
              <td class="whitespace-nowrap px-4 py-2 font-mono text-gray-500">{{ formatTime(r.checked_at) }}</td>
              <td class="whitespace-nowrap px-4 py-2">
                <span :class="['inline-flex items-center gap-1 font-medium', r.ok ? 'text-green-700' : 'text-red-600']">
                  <span :class="['h-1.5 w-1.5 rounded-full', r.ok ? 'bg-green-500' : 'bg-red-500']" />
                  {{ r.ok ? 'OK' : 'Down' }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-2 font-mono text-gray-500">{{ r.status_code ?? '—' }}</td>
              <td class="whitespace-nowrap px-4 py-2 font-mono text-gray-500">{{ r.response_ms != null ? `${r.response_ms}ms` : '—' }}</td>
              <td class="px-4 py-2 text-gray-400">{{ r.error ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>
