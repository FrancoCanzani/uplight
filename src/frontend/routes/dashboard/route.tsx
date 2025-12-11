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
    <div>
      <h1>Dashboard Layout</h1>
      <Outlet />
    </div>
  );
}
