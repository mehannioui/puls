<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const { create } = useServices();
const api = useApi();

interface OrgInfo { id: string; plan: string }

const { data: orgs } = useAsyncData<OrgInfo[]>("orgs-plan", () => api("/api/orgs"), { default: () => [] });

const currentPlan = computed(() => {
  const session = useSupabaseSession();
  const token = session.value?.access_token;
  if (!token) return "free";
  try {
    const b64 = token.split(".")[1];
    if (!b64) return "free";
    const payload = JSON.parse(atob(b64.replace(/-/g, "+").replace(/_/g, "/")));
    const orgId = payload.org_id;
    return orgs.value?.find((o) => o.id === orgId)?.plan ?? "free";
  } catch {
    return "free";
  }
});

const intervalOptions = computed(() => {
  const all = [
    { label: "1 minute", value: 60 },
    { label: "2 minutes", value: 120 },
    { label: "5 minutes", value: 300 },
    { label: "10 minutes", value: 600 },
    { label: "30 minutes", value: 1800 },
    { label: "1 hour", value: 3600 },
  ];
  const min = currentPlan.value === "pro" ? 60 : 300;
  return all.filter((o) => o.value >= min);
});

const form = reactive({
  name: "",
  url: "",
  method: "GET",
  expected_status: 200,
  interval_seconds: 300,
  timeout_seconds: 30,
});

const error = ref("");
const loading = ref(false);

const urlError = computed(() => {
  if (!form.url) return "";
  try {
    const u = new URL(form.url);
    return u.protocol === "http:" || u.protocol === "https:" ? "" : "URL must use http or https";
  } catch {
    return "Must be a valid URL";
  }
});

const statusError = computed(() => {
  const s = form.expected_status;
  return s >= 100 && s <= 599 ? "" : "Must be between 100 and 599";
});

const isValid = computed(
  () => form.name.trim() && !urlError.value && !statusError.value && form.url
);

async function submit() {
  error.value = "";
  loading.value = true;
  try {
    await create({
      name: form.name.trim(),
      url: form.url.trim(),
      method: form.method,
      expected_status: form.expected_status,
      interval_seconds: form.interval_seconds,
      timeout_seconds: form.timeout_seconds,
    });
    await navigateTo("/dashboard");
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to create service";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-lg px-4 py-8">
      <div class="mb-6 flex items-center gap-3">
        <NuxtLink to="/dashboard" class="text-sm text-indigo-600 hover:text-indigo-900">← Back</NuxtLink>
        <h1 class="text-2xl font-semibold text-gray-900">Add service</h1>
      </div>

      <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <form class="space-y-5" @submit.prevent="submit">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="My API"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">URL</label>
            <input
              v-model="form.url"
              type="url"
              required
              placeholder="https://example.com/health"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :class="{ 'border-red-400': urlError }"
            />
            <p v-if="urlError" class="mt-1 text-xs text-red-600">{{ urlError }}</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Method</label>
              <select
                v-model="form.method"
                class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="GET">GET</option>
                <option value="HEAD">HEAD</option>
                <option value="POST">POST</option>
              </select>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Expected status</label>
              <input
                v-model.number="form.expected_status"
                type="number"
                min="100"
                max="599"
                class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                :class="{ 'border-red-400': statusError }"
              />
              <p v-if="statusError" class="mt-1 text-xs text-red-600">{{ statusError }}</p>
            </div>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700">Check interval</label>
            <select
              v-model.number="form.interval_seconds"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option v-for="opt in intervalOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>

          <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

          <button
            type="submit"
            :disabled="loading || !isValid"
            class="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {{ loading ? "Creating…" : "Create service" }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
