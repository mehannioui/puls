<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const user = useSupabaseUser();

// Redirect authenticated users with an org to the dashboard.
watchEffect(() => {
  if (user.value) {
    navigateTo("/dashboard");
  }
});
</script>

<template>
  <div class="flex min-h-screen items-center justify-center">
    <p class="text-gray-500">Redirecting…</p>
  </div>
</template>
