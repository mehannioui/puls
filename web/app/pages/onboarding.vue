<script setup lang="ts">
const api = useApi();
const name = ref("");
const error = ref("");
const loading = ref(false);
const supabase = useSupabaseClient();

async function createOrg() {
  error.value = "";
  loading.value = true;
  try {
    await api("/api/orgs", { method: "POST", body: { name: name.value } });
    // Refresh the session so the new org_id lands in the JWT via the Auth Hook.
    await supabase.auth.refreshSession();
    await navigateTo("/dashboard");
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to create org";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50">
    <div class="w-full max-w-sm rounded-lg bg-white p-8 shadow">
      <h1 class="mb-2 text-2xl font-semibold text-gray-900">Create your workspace</h1>
      <p class="mb-6 text-sm text-gray-500">Give your team a name to get started.</p>
      <form class="space-y-4" @submit.prevent="createOrg">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Workspace name</label>
          <input
            v-model="name"
            type="text"
            required
            placeholder="Acme Inc."
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <button
          type="submit"
          :disabled="loading || !name.trim()"
          class="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {{ loading ? "Creating…" : "Create workspace" }}
        </button>
      </form>
    </div>
  </div>
</template>
