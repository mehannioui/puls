export const useApi = () => {
  const session = useSupabaseSession();
  const config = useRuntimeConfig();

  return <T>(path: string, options?: Parameters<typeof $fetch<T>>[1]) => {
    const headers: Record<string, string> = {};
    if (session.value?.access_token) {
      headers["Authorization"] = `Bearer ${session.value.access_token}`;
    }
    return $fetch<T>(path, {
      baseURL: config.public.apiBase,
      headers,
      ...options,
    });
  };
};
