import { Button } from "@/components/ui/button";
import { getRouteApi, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { MonitorResponse } from "../schemas";

export default function MonitorsPage() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/monitors/");
  const monitors = routeApi.useLoaderData();
  const { teamId } = routeApi.useParams();

  return (
    <div className="space-y-6">
      <header className="w-full flex items-center justify-between">
        <h1 className="text-2xl tracking-tight text-balance">Monitors</h1>
        <Button
          variant={"link"}
          render={
            <Link to="/$teamId/monitors/new" params={{ teamId }}>
              New Monitor
            </Link>
          }
        />
      </header>
      <div className="divide-y divide-dashed">
        {monitors.map((monitor: MonitorResponse) => (
          <Link
            to="/$teamId/monitors/$monitorId"
            params={{
              monitorId: monitor.id.toString(),
              teamId: teamId,
            }}
            key={monitor.id}
            className="p-2 hover:bg-surface group flex text-sm items-center justify-between"
          >
            <div className="flex items-center justify-start gap-x-1">
              <span className="uppercase font-medium bg-surface px-1 font-mono">
                {monitor.type}
              </span>

              <h1 className="font-medium text-lg">{monitor.name}</h1>
            </div>
            <div className="flex items-center justify-end gap-x-1.5">
              <p className="font-mono text-xs font-medium tracking-tight uppercase text-blue-800 leading-0">
                {monitor.status}
              </p>
              <ArrowRight className="size-3.5 -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
