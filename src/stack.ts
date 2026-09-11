import "server-only";
import { StackServerApp } from "@stackframe/stack";

// Neon Auth (Stack Auth). Requires NEXT_PUBLIC_STACK_PROJECT_ID,
// NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY, and STACK_SECRET_SERVER_KEY —
// generated from the Neon console once Neon Auth is enabled on the project.
export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
});
