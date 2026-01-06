import DashboardHeader from "@/components/dashboard-header";
import FloatingMenu from "@/components/floating-menu";
import { fetchTeams } from "@/features/teams/api/use-teams";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

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
});

function TeamLayoutComponent() {
  return (
    <div className="h-screen">
      <DashboardHeader />
      <div className="pt-[calc(env(safe-area-inset-top)+64px)]">
        <main className="p-4 lg:p-6 pb-24">
          <Outlet />
          <FloatingMenu />
        </main>
      </div>
    </div>
  );
}
