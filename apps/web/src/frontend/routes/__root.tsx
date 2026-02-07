import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { ErrorComponent } from "@/components/error-component";
import { NotFound } from "@/components/not-found";
import { Toaster } from "@/components/ui/sonner";
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
  loader: () => void 0, // this triggers the spinner
  component: RootLayout,
  notFoundComponent: NotFound,
  errorComponent: ErrorComponent,
});
