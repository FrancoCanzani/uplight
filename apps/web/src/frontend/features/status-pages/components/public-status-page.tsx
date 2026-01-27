import { getRouteApi } from "@tanstack/react-router";
import { cn } from "@lib/utils";
import {
  MONITOR_STATUS_COLORS,
  OVERALL_STATUS_COLORS,
  OVERALL_STATUS_LABELS,
} from "../constants";
import type { PublicMonitor } from "../types";
import { SEOHead, createStatusPageSchema } from "@/components/seo";

const routeApi = getRouteApi("/status/$slug");

function StatusIndicator({ status }: { status: string }) {
  const colorClass =
    MONITOR_STATUS_COLORS[status as keyof typeof MONITOR_STATUS_COLORS] ||
    "bg-gray-400";
  return <div className={cn("size-2", colorClass)} />;
}

function UptimeBar({ uptime }: { uptime: number }) {
  const segments = 50;
  const filledSegments = Math.round((uptime / 100) * segments);

  return (
    <div className="flex gap-px h-3">
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex-1",
            i < filledSegments ? "bg-green-700" : "bg-muted"
          )}
          style={{ minWidth: "2px" }}
        />
      ))}
    </div>
  );
}

function MonitorRow({
  monitor,
  showUptime,
}: {
  monitor: PublicMonitor;
  showUptime: boolean;
}) {
  return (
    <div className="border border-border/30 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusIndicator status={monitor.status} />
          <span className="text-sm">{monitor.name}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {monitor.lastCheck && <span>{monitor.lastCheck.responseTime}ms</span>}
        </div>
      </div>
      {showUptime && (
        <div className="space-y-1">
          <UptimeBar uptime={monitor.uptime} />
          <div className="text-xs text-muted-foreground text-right">
            {monitor.uptime.toFixed(2)}% uptime
          </div>
        </div>
      )}
    </div>
  );
}

export default function PublicStatusPage() {
  const data = routeApi.useLoaderData();
  const { page, overallStatus, stats, groups, ungroupedMonitors } = data;
  const { slug } = routeApi.useParams();

  const hasMonitors =
    groups.some((g) => g.monitors.length > 0) || ungroupedMonitors.length > 0;

  // Collect all monitors for structured data
  const allMonitors = [
    ...groups.flatMap((g) => g.monitors),
    ...ungroupedMonitors,
  ];

  const statusSchema = createStatusPageSchema({
    name: page.name,
    description: page.description,
    url: `https://uplight.dev/status/${slug}`,
    status: overallStatus,
    services: allMonitors.map((m) => ({
      name: m.name,
      status: m.status,
      uptime: m.uptime,
    })),
  });

  const description =
    page.description ||
    `Current status for ${page.name}. ${stats.operational} of ${stats.total} services operational.`;

  return (
    <>
      <SEOHead
        title={`${page.name} Status`}
        description={description}
        canonical={`https://uplight.dev/status/${slug}`}
        jsonLd={statusSchema}
      />
      <div className="min-h-screen font-mono antialiased">
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
        <header className="space-y-4">
          <div className="flex items-center gap-4">
            {page.logoKey && (
              <img
                src={`/api/public/status/logo/${page.logoKey}`}
                alt={page.name}
                className="h-10"
              />
            )}
            <h1 className="text-xl font-medium">{page.name}</h1>
          </div>
          {page.description && (
            <p className="text-sm text-muted-foreground">{page.description}</p>
          )}
        </header>

        <div className="border-y border-border/30 py-6">
          <div
            className={cn(
              "text-lg font-medium mb-1",
              OVERALL_STATUS_COLORS[overallStatus]
            )}
          >
            {OVERALL_STATUS_LABELS[overallStatus]}
          </div>
          <div className="text-xs text-muted-foreground">
            {stats.operational} of {stats.total} services operational
          </div>
        </div>

        {!hasMonitors ? (
          <div className="py-12 text-center border border-dashed border-border">
            <p className="text-sm text-muted-foreground">
              No services configured for this status page.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {groups.map(
              (group) =>
                group.monitors.length > 0 && (
                  <div key={group.id} className="space-y-3">
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      {group.label}
                    </h2>
                    <div className="space-y-2">
                      {group.monitors.map((monitor) => (
                        <MonitorRow
                          key={monitor.monitorId}
                          monitor={monitor}
                          showUptime={page.showHistoricalUptime}
                        />
                      ))}
                    </div>
                  </div>
                )
            )}

            {ungroupedMonitors.length > 0 && (
              <div className="space-y-3">
                {groups.length > 0 && (
                  <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Services
                  </h2>
                )}
                <div className="space-y-2">
                  {ungroupedMonitors.map((monitor) => (
                    <MonitorRow
                      key={monitor.monitorId}
                      monitor={monitor}
                      showUptime={page.showHistoricalUptime}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <footer className="pt-8 border-t border-border/30">
          <p className="text-xs text-muted-foreground text-center">
            Powered by Uplight
          </p>
        </footer>
      </div>
    </div>
    </>
  );
}
