import { getRouteApi, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import type { CheckResult } from "../api/fetch-checks";
import LogsTable from "./logs-table";

const routeApi = getRouteApi("/(dashboard)/$teamId/monitors/$monitorId/");

export function RecentLogsPreview({ checks }: { checks: CheckResult[] }) {
  const { teamId, monitorId } = routeApi.useParams();
  const { monitor } = routeApi.useLoaderData();

  const recentChecks = checks.slice(0, 5);

  return (
    <div className="relative">
      <LogsTable
        checks={recentChecks}
        monitor={monitor}
        onRowClick={() => {}}
        preview
      />

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-linear-to-t from-background from-10% via-background/60 via-50% to-transparent flex items-end justify-center pb-4">
        <Button
          size={"xs"}
          render={
            <Link
              to="/$teamId/monitors/$monitorId/logs"
              params={{ teamId, monitorId }}
            >
              View all logs
            </Link>
          }
        />
      </div>
    </div>
  );
}
