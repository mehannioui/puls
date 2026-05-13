<script setup lang="ts">
import type { Service } from "~/composables/api/useServices";

definePageMeta({ middleware: "auth" });

const { list, remove } = useServices();

const { data: services, refresh, error } = useAsyncData<Service[]>(
  "services",
  () => list(),
  { default: () => [] }
);

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
              <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="svc in services" :key="svc.id">
              <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{{ svc.name }}</td>
              <td class="max-w-xs truncate px-6 py-4 text-sm text-gray-500">{{ svc.url }}</td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{{ intervalLabel(svc.interval_seconds) }}</td>
              <td class="whitespace-nowrap px-6 py-4">
                <span class="inline-flex items-center gap-1.5 text-sm text-green-700">
                  <span class="h-2 w-2 rounded-full bg-green-500" />
                  OK
                </span>
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
