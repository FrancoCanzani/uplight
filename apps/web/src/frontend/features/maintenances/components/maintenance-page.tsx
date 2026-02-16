import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { format } from "date-fns";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import fetchMonitors from "@/features/monitors/api/fetch-monitors";
import fetchMaintenance from "../api/fetch-maintenance";
import type { Maintenance } from "../schemas";
import MaintenanceItem from "./maintenance-item";

export default function MaintenancePage() {
  const { teamId } = useParams({
    from: "/(dashboard)/$teamId/maintenances",
  });

  const { data: maintenanceWindows, isLoading } = useQuery({
    queryKey: ["maintenance", teamId],
    queryFn: () => fetchMaintenance(teamId),
  });

  const { data: monitors, isLoading: isLoadingMonitors } = useQuery({
    queryKey: ["monitors", teamId],
    queryFn: () => fetchMonitors(teamId),
  });

  const groupedByDay = useMemo(() => {
    const grouped = new Map<string, Maintenance[]>();

    for (const window of maintenanceWindows ?? []) {
      const key = format(new Date(window.startsAt), "yyyy-MM-dd");
      const existing = grouped.get(key) ?? [];
      existing.push(window);
      grouped.set(key, existing);
    }

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, items]) => ({
        day,
        items: [...items].sort((a, b) => a.startsAt - b.startsAt),
      }));
  }, [maintenanceWindows]);

  const loading = isLoading || isLoadingMonitors;
  const monitorOptions = monitors ?? [];
  const hasWindows = (maintenanceWindows?.length ?? 0) > 0;

  if (!loading && monitorOptions.length === 0) {
    return (
      <div className="space-y-8 w-full lg:max-w-5xl mx-auto px-4 lg:px-6 pb-20 md:pb-6">
        <PageHeader title="Maintenances" />
        <Empty className="flex-1 pt-24">
          <EmptyTitle>No monitors available</EmptyTitle>
          <EmptyDescription>
            Create a monitor first, then schedule maintenance windows.
          </EmptyDescription>
        </Empty>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full lg:max-w-5xl mx-auto px-4 lg:px-6 pb-20 md:pb-6">
      <PageHeader
        title="Maintenances"
        actions={
          <Button
            variant="outline"
            size="xs"
            render={
              <Link to="/$teamId/maintenances-new" params={{ teamId }}>
                Schedule Maintenance
              </Link>
            }
          />
        }
      />

      {loading && (
        <span className="text-muted-foreground py-8 flex justify-center w-full">
          <Spinner className="animate-spin size-3.5" />
        </span>
      )}

      {!loading && hasWindows ? (
        <div className="space-y-6">
          {groupedByDay.map((group) => (
            <div
              key={group.day}
              className="grid grid-cols-1 gap-3 md:grid-cols-[140px_1fr]"
            >
              <div className="text-xs text-muted-foreground md:pt-2">
                <p className="text-foreground font-medium">
                  {format(new Date(group.day), "EEE")}
                </p>
                <p>{format(new Date(group.day), "MMM d, yyyy")}</p>
              </div>

              <div className="border-l pl-4 space-y-3">
                {group.items.map((item) => (
                  <MaintenanceItem
                    key={item.id}
                    teamId={teamId}
                    monitors={monitorOptions}
                    item={item}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <Empty className="flex-1 pt-36">
            <EmptyTitle>No maintenance windows scheduled.</EmptyTitle>
            <EmptyDescription>
              You haven&apos;t scheduled any maintenance windows yet. Create one
              to mark selected monitors as under maintenance.
            </EmptyDescription>
            <EmptyContent>
              <Button
                variant="outline"
                size="xs"
                render={
                  <Link to="/$teamId/maintenances-new" params={{ teamId }}>
                    Schedule Maintenance
                  </Link>
                }
              />
            </EmptyContent>
          </Empty>
        )
      )}
    </div>
  );
}
