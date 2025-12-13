import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TeamProvider } from "@/features/teams/context/team-context";
import { useSession } from "@/lib/auth/client";
import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayoutComponent,
  beforeLoad: ({ context, location }) => {
    const { auth } = context;

    if (auth.isPending) {
      return;
    }

    if (!auth.data?.user || auth.error) {
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
  const navigate = useNavigate();
  const { data: session, isPending, error } = useSession();

  useEffect(() => {
    if (!isPending && (!session?.user || error)) {
      navigate({
        to: "/login",
        search: {
          redirect: window.location.href,
        },
      });
    }
  }, [isPending, session, error, navigate]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session?.user || error) {
    return null;
  }

  return (
    <TeamProvider>
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset className="p-4 xl:p-6">
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </TeamProvider>
  );
}
