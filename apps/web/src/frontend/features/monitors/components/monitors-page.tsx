import { getRouteApi, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import MonitorQuickstart from "./monitor-quickstart";
import MonitorsList from "./monitors-list";

export default function MonitorsPage() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/monitors/");
  const { teamId } = routeApi.useParams();

  return (
    <div className="space-y-8 w-full lg:max-w-3xl mx-auto">
      <PageHeader
        title="Monitors"
        actions={
          <div className="flex items-center gap-2">
            <MonitorQuickstart />
            <Button
              variant="outline"
              size="xs"
              render={
                <Link to="/$teamId/monitors/new" params={{ teamId }}>
                  New Monitor
                </Link>
              }
            />
          </div>
        }
      />
      <MonitorsList />
    </div>
  );
}
