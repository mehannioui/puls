// Reads org_id from the JWT payload (set by the Supabase Auth Hook).
const parseOrgId = (token: string): string | null => {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return payload.org_id ?? null;
  } catch {
    return null;
  }
};

export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser();
  const session = useSupabaseSession();

  if (!user.value) {
    if (to.path !== "/login" && to.path !== "/signup") {
      return navigateTo("/login");
    }
    return;
  }

  // Authenticated but no org yet → onboarding
  if (to.path !== "/onboarding") {
    const token = session.value?.access_token;
    if (!token || !parseOrgId(token)) {
      return navigateTo("/onboarding");
    }
  }
});
