<script setup lang="ts">
const supabase = useSupabaseClient();
const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

async function signIn() {
  error.value = "";
  loading.value = true;
  const { error: e } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });
  loading.value = false;
  if (e) {
    error.value = e.message;
    return;
  }
  await navigateTo("/");
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50">
    <div class="w-full max-w-sm rounded-lg bg-white p-8 shadow">
      <h1 class="mb-6 text-2xl font-semibold text-gray-900">Sign in to Pulse</h1>
      <form class="space-y-4" @submit.prevent="signIn">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Password</label>
          <input
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {{ loading ? "Signing in…" : "Sign in" }}
        </button>
      </form>
      <p class="mt-4 text-center text-sm text-gray-500">
        No account?
        <NuxtLink to="/signup" class="text-indigo-600 hover:underline">Sign up</NuxtLink>
      </p>
    </div>
  </div>
</template>
