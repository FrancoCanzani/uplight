import { useHotkeys } from "react-hotkeys-hook";
import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { BottomNav } from "@/components/bottom-nav";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { fetchTeams } from "@/features/teams/api/use-teams";

export const Route = createFileRoute("/(dashboard)/$teamId")({
  beforeLoad: async ({ context, location }) => {
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
  loader: async ({ params }) => {
    const teams = await fetchTeams();
    const currentTeam = teams.find((t) => t.id === Number(params.teamId));

    if (!currentTeam) {
      throw redirect({ to: "/" });
    }

    return { teams, currentTeam };
  },
  component: TeamLayoutComponent,
  pendingComponent: () => (
    <div className="h-screen w-full flex items-center justify-center">
      <Spinner />
    </div>
  ),
});

function TeamLayoutComponent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { teamId } = Route.useParams();

  useHotkeys(
    "mod+k",
    (e) => {
      e.preventDefault();

      if (location.pathname.includes("/monitors")) {
        navigate({ to: "/$teamId/monitors/new", params: { teamId } });
      } else if (location.pathname.includes("/heartbeats")) {
        navigate({ to: "/$teamId/heartbeats/new", params: { teamId } });
      } else if (location.pathname.includes("/status-pages")) {
        navigate({ to: "/$teamId/status-pages/new", params: { teamId } });
      }
    },
    [location.pathname, teamId],
  );

  return (
    <SidebarProvider>
      <div className="h-screen flex w-full">
        <DashboardSidebar />
        <SidebarInset className="flex-1 overflow-auto">
          <main className="flex-1 pb-20 md:pb-6">
            <Outlet />
          </main>
        </SidebarInset>
        <BottomNav />
      </div>
    </SidebarProvider>
  );
}
