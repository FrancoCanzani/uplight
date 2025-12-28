import { Toaster } from "@/components/ui/sonner";
import type { useSession } from "@/lib/auth/client";
import { ThemeProvider } from "next-themes";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

export interface RouterContext {
  auth: ReturnType<typeof useSession>;
}

function RootLayout() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Outlet />
      <Toaster />
    </ThemeProvider>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});
