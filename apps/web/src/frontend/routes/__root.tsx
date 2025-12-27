import { Toaster } from "@/components/ui/sonner";
import type { useSession } from "@/lib/auth/client";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

export interface RouterContext {
  auth: ReturnType<typeof useSession>;
}

function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});
