import { getRouteApi } from "@tanstack/react-router";
import {
    MONITOR_STATUS_COLORS,
    OVERALL_STATUS_COLORS,
    OVERALL_STATUS_LABELS,
} from "../constants";

const routeApi = getRouteApi("/status/$slug");

export default function PublicStatusPage() {
  const data = routeApi.useLoaderData();
  const { page, overallStatus, stats, groups, ungroupedMonitors } = data;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        {page.logoKey && (
          <img
            src={`/api/public/status/logo/${page.logoKey}`}
            alt={page.name}
            className="h-16 mx-auto mb-4"
          />
        )}
        <h1 className="text-3xl font-bold mb-2">{page.name}</h1>
        {page.description && (
          <p className="text-muted-foreground">{page.description}</p>
        )}
      </div>

      <div className="mb-8 p-6 border rounded-lg text-center">
        <div className={`text-2xl font-semibold mb-2 ${OVERALL_STATUS_COLORS[overallStatus]}`}>
          {OVERALL_STATUS_LABELS[overallStatus]}
        </div>
        <div className="text-sm text-muted-foreground">
          {stats.operational} of {stats.total} services operational
        </div>
      </div>

      {groups.map((group) => (
        <div key={group.id} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{group.label}</h2>
          <div className="space-y-3">
            {group.monitors.map((monitor) => (
              <div
                key={monitor.monitorId}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${MONITOR_STATUS_COLORS[monitor.status as keyof typeof MONITOR_STATUS_COLORS]}`} />
                  <span className="font-medium">{monitor.name}</span>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  {page.showHistoricalUptime && (
                    <span>{monitor.uptime.toFixed(2)}% uptime</span>
                  )}
                  {monitor.lastCheck && (
                    <span>{monitor.lastCheck.responseTime}ms</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {ungroupedMonitors.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Services</h2>
          <div className="space-y-3">
            {ungroupedMonitors.map((monitor) => (
              <div
                key={monitor.monitorId}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${MONITOR_STATUS_COLORS[monitor.status as keyof typeof MONITOR_STATUS_COLORS]}`} />
                  <span className="font-medium">{monitor.name}</span>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  {page.showHistoricalUptime && (
                    <span>{monitor.uptime.toFixed(2)}% uptime</span>
                  )}
                  {monitor.lastCheck && (
                    <span>{monitor.lastCheck.responseTime}ms</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
