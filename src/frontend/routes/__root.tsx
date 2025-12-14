import { Toaster } from "@/components/ui/sonner";
import type { useSession } from "@/lib/auth/client";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export interface RouterContext {
  auth: ReturnType<typeof useSession>;
}

function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});
