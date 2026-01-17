import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { ErrorComponent } from "@/components/error-component";
import { NotFound } from "@/components/not-found";
import type { useSession } from "@/lib/auth/client";

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
  notFoundComponent: NotFound,
  errorComponent: ErrorComponent,
});
