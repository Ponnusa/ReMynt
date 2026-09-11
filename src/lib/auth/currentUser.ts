import "server-only";
import { auth } from "@/lib/auth/server";
import { GUEST_USER_ID, GUEST_USER_EMAIL } from "@/lib/users";

/**
 * TEMPORARY: Neon Auth's session proxy is currently throwing
 * ("Unexpected proxy error ... detail: 'Invalid URL'") on this deployment,
 * so auth.getSession() itself fails. Until that's fixed, any failed/missing
 * session falls back to a shared guest account so the core upload -> style ->
 * generate -> download flow stays testable. Remove this fallback (and go
 * back to a plain 401) once sign-in works again.
 */
export async function getCurrentUser(): Promise<{ id: string; email: string }> {
  try {
    const { data: session } = await auth.getSession();
    if (session?.user) {
      return { id: session.user.id, email: session.user.email };
    }
  } catch (err) {
    console.error("[auth] getSession failed, falling back to guest user:", err);
  }

  return { id: GUEST_USER_ID, email: GUEST_USER_EMAIL };
}
