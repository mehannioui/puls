<script setup lang="ts">
interface Org {
  id: string;
  slug: string;
  name: string;
  plan: string;
}

const supabase = useSupabaseClient();
const api = useApi();
const open = ref(false);
const switching = ref(false);

const { data: orgs, refresh } = useAsyncData<Org[]>("orgs", () => api("/api/orgs"));

async function switchOrg(id: string) {
  if (switching.value) return;
  switching.value = true;
  try {
    await api(`/api/orgs/${id}/switch`, { method: "POST" });
    await supabase.auth.refreshSession();
    await refresh();
    open.value = false;
  } finally {
    switching.value = false;
  }
}
</script>

<template>
  <div class="relative">
    <button
      class="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
      @click="open = !open"
    >
      <span>{{ orgs?.[0]?.name ?? "Select org" }}</span>
      <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div
      v-if="open"
      class="absolute left-0 z-10 mt-1 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg"
    >
      <button
        v-for="org in orgs"
        :key="org.id"
        class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        :disabled="switching"
        @click="switchOrg(org.id)"
      >
        {{ org.name }}
        <span class="ml-1 text-xs text-gray-400">{{ org.plan }}</span>
      </button>
    </div>
  </div>
</template>
