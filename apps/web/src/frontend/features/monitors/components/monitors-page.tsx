import { Button } from "@/components/ui/button";
import { getRouteApi, Link } from "@tanstack/react-router";
import MonitorQuickstart from "./monitor-quickstart";
import MonitorsTable from "./monitors-table";

export default function MonitorsPage() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/monitors/");
  const { teamId } = routeApi.useParams();

  return (
    <div className="space-y-12 w-full lg:max-w-4xl mx-auto">
      <div className="w-full">
        <div className="flex items-center justify-end gap-4">
          <div className="flex items-center gap-2 flex-1 justify-end max-w-2xl">
            <MonitorQuickstart />
            <span className="italic text-xs">or</span>
            <Button
              variant="outline"
              size="xs"
              render={
                <Link to="/$teamId/monitors/new" params={{ teamId }}>
                  Config a New Monitor
                </Link>
              }
            />
          </div>
        </div>
      </div>
      <MonitorsTable />
    </div>
  );
}
