import { Suspense } from "react";
import HomeClient from "./HomeClient";

// Stack Auth's useUser() reads client-only session state, which bails out of
// static prerendering — it needs a Suspense boundary above it (this is that
// boundary; the root layout can't provide one itself).
export default function Page() {
  return (
    <Suspense>
      <HomeClient />
    </Suspense>
  );
}
