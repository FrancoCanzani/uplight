import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import fetchMonitors from "@/features/monitors/api/fetch-monitors";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useSearch } from "@tanstack/react-router";
import MaintenanceForm from "../forms/maintenance-form";

export default function MaintenanceNewPage() {
  const { teamId } = useParams({
    from: "/(dashboard)/$teamId/maintenances-new",
  });
  const { monitorId } = useSearch({
    from: "/(dashboard)/$teamId/maintenances-new",
  });

  const { data: monitors, isLoading } = useQuery({
    queryKey: ["monitors", teamId],
    queryFn: () => fetchMonitors(teamId),
  });

  const monitorOptions = monitors ?? [];
  const preselectedMonitorIds = monitorId ? [Number(monitorId)] : [];

  return (
    <div className="space-y-8 w-full lg:max-w-5xl mx-auto px-4 lg:px-6 pb-20 md:pb-6">
      <PageHeader
        title="Schedule Maintenance"
        actions={
          <Button
            variant="outline"
            size="xs"
            render={
              <Link to="/$teamId/maintenances" params={{ teamId }}>
                View Scheduled
              </Link>
            }
          />
        }
      />

      {isLoading && (
        <span className="text-muted-foreground py-8 flex justify-center w-full">
          <Spinner className="animate-spin size-3.5" />
        </span>
      )}

      {!isLoading && monitorOptions.length === 0 ? (
        <Empty className="flex-1 pt-24">
          <EmptyTitle>No monitors available</EmptyTitle>
          <EmptyDescription>
            Create a monitor first, then schedule maintenance windows.
          </EmptyDescription>
        </Empty>
      ) : (
        <MaintenanceForm
          teamId={teamId}
          monitors={monitorOptions}
          preselectedMonitorIds={preselectedMonitorIds}
        />
      )}
    </div>
  );
}
