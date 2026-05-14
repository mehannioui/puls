<script setup lang="ts">
import type { Service } from "~/composables/api/useServices";
import type { ResultResponse } from "~/composables/useStatusStream";

definePageMeta({ middleware: "auth" });

const api = useApi();
const { list, remove } = useServices();
const { latest, sparklines, init } = useStatusStream();

const { data: services, refresh, error } = useAsyncData<Service[]>(
  "services",
  () => list(),
  { default: () => [] }
);

// Pre-fetch last 60 results per service to seed status dots + sparklines.
const { data: initialResults } = useAsyncData<Record<string, ResultResponse[]>>(
  "services-initial-results",
  async () => {
    if (!services.value?.length) return {}
    const pairs = await Promise.all(
      services.value.map(svc =>
        api<ResultResponse[]>(`/api/services/${svc.id}/results`)
          .then(r => [svc.id, r] as [string, ResultResponse[]])
          .catch(() => [svc.id, []] as [string, ResultResponse[]])
      )
    )
    return Object.fromEntries(pairs)
  },
  { watch: [services], default: () => ({}) }
);

watch(initialResults, r => { if (r) init(r) }, { immediate: true })

const deleting = ref<string | null>(null);
const deleteError = ref("");

async function handleDelete(id: string) {
  deleting.value = id;
  deleteError.value = "";
  try {
    await remove(id);
    await refresh();
  } catch {
    deleteError.value = "Failed to delete service.";
  } finally {
    deleting.value = null;
  }
}

function intervalLabel(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  return `${seconds / 60}m`;
}

function statusDotClass(serviceId: string) {
  const event = latest[serviceId];
  if (!event) return "bg-gray-300";
  return event.ok ? "bg-green-500" : "bg-red-500";
}

function statusLabel(serviceId: string) {
  const event = latest[serviceId];
  if (!event) return "—";
  return event.ok ? "OK" : "Down";
}

function statusTextClass(serviceId: string) {
  const event = latest[serviceId];
  if (!event) return "text-gray-400";
  return event.ok ? "text-green-700" : "text-red-700";
}

function lastResponseMs(serviceId: string): string {
  const event = latest[serviceId];
  if (!event || !event.response_ms) return "—";
  return `${event.response_ms}ms`;
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-5xl px-4 py-8">
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-gray-900">Services</h1>
        <NuxtLink
          to="/dashboard/services/new"
          class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Add service
        </NuxtLink>
      </div>

      <p v-if="error" class="mb-4 text-sm text-red-600">Failed to load services.</p>
      <p v-if="deleteError" class="mb-4 text-sm text-red-600">{{ deleteError }}</p>

      <div v-if="services && services.length > 0" class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">URL</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Interval</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Response</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Last 60 checks</th>
              <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="svc in services" :key="svc.id">
              <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                <NuxtLink :to="`/dashboard/services/${svc.id}`" class="hover:text-indigo-600">
                  {{ svc.name }}
                </NuxtLink>
              </td>
              <td class="max-w-xs truncate px-6 py-4 text-sm text-gray-500">{{ svc.url }}</td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ intervalLabel(svc.interval_seconds) }}</td>
              <td class="whitespace-nowrap px-6 py-4">
                <span :class="['inline-flex items-center gap-1.5 text-sm', statusTextClass(svc.id)]">
                  <span :class="['h-2 w-2 rounded-full', statusDotClass(svc.id)]" />
                  {{ statusLabel(svc.id) }}
                </span>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500 tabular-nums">
                {{ lastResponseMs(svc.id) }}
              </td>
              <td class="px-6 py-4">
                <PulseSparkline
                  :data="sparklines[svc.id]"
                  :width="96"
                  :height="24"
                  :color="latest[svc.id]?.ok === false ? 'var(--status-outage, #ef4444)' : 'var(--pulse-brand, #6366f1)'"
                />
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-right text-sm">
                <NuxtLink
                  :to="`/dashboard/services/${svc.id}/edit`"
                  class="mr-3 font-medium text-indigo-600 hover:text-indigo-900"
                >
                  Edit
                </NuxtLink>
                <button
                  :disabled="deleting === svc.id"
                  class="font-medium text-red-600 hover:text-red-900 disabled:opacity-50"
                  @click="handleDelete(svc.id)"
                >
                  {{ deleting === svc.id ? "Deleting…" : "Delete" }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-else-if="!error"
        class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white py-16"
      >
        <p class="mb-4 text-gray-500">No services yet. Add one to start monitoring.</p>
        <NuxtLink
          to="/dashboard/services/new"
          class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Add your first service
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
