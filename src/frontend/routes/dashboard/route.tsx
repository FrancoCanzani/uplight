import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayoutComponent,
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isPending && !context.auth.data?.user) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
});

function DashboardLayoutComponent() {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset className="p-4 xl:p-6">
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
