import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Spinner } from "@/components/ui/spinner";
import {
  Empty,
  EmptyDescription,
  EmptyTitle,
} from "@/components/ui/empty";
import fetchMaintenance from "../api/fetch-maintenance";
import MaintenanceForm from "../forms/maintenance-form";
import MaintenanceItem from "./maintenance-item";

export default function MaintenancePage() {
  const { teamId, monitorId } = useParams({
    from: "/(dashboard)/$teamId/monitors/$monitorId/maintenance",
  });

  const { data: maintenanceWindows, isLoading } = useQuery({
    queryKey: ["maintenance", teamId, Number(monitorId)],
    queryFn: () => fetchMaintenance(teamId, monitorId),
  });

  return (
    <div className="space-y-10 w-full lg:max-w-3xl mx-auto">
      <div>
        <h1 className="text-lg font-medium">Maintenance Windows</h1>
        <p className="text-xs text-muted-foreground">
          During a maintenance window, <strong>no checks are performed</strong>{" "}
          and the status page shows "<strong>Under Maintenance</strong>".{" "}
          <strong>No incidents or alerts</strong> are created, and when
          maintenance ends, monitoring <strong>resumes automatically</strong>.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">New Maintenance</h3>
        <MaintenanceForm />
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Scheduled Windows</h3>

        {isLoading && (
          <span className="text-muted-foreground py-8 flex justify-center w-full">
            <Spinner className="animate-spin size-3.5" />
          </span>
        )}

        {!isLoading && maintenanceWindows && maintenanceWindows.length > 0 ? (
          maintenanceWindows
            .sort((a, b) => b.startsAt - a.startsAt)
            .map((item) => (
              <MaintenanceItem key={item.id} item={item} />
            ))
        ) : (
          !isLoading && (
            <Empty className="flex-1 pt-36">
              <EmptyTitle>No maintenance windows scheduled.</EmptyTitle>
              <EmptyDescription>
                You haven&apos;t scheduled any maintenance windows yet. Schedule
                your first maintenance window above.
              </EmptyDescription>
            </Empty>
          )
        )}
      </div>
    </div>
  );
}
