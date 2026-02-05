import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
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
    <div className="space-y-8 w-full lg:max-w-4xl mx-auto px-4 lg:px-6 pb-20 md:pb-6">
      <PageHeader title="Maintenance" />

      <MaintenanceForm />

      {isLoading && (
        <span className="text-muted-foreground py-8 flex justify-center w-full">
          <Spinner className="animate-spin size-3.5" />
        </span>
      )}

      {!isLoading && maintenanceWindows && maintenanceWindows.length > 0 ? (
        <div className="space-y-4">
          {maintenanceWindows
            .sort((a, b) => b.startsAt - a.startsAt)
            .map((item) => (
              <MaintenanceItem key={item.id} item={item} />
            ))}
        </div>
      ) : (
        !isLoading && (
          <Empty className="flex-1 pt-36">
            <EmptyTitle>No maintenance windows scheduled.</EmptyTitle>
            <EmptyDescription>
              Schedule your first maintenance window above.
            </EmptyDescription>
          </Empty>
        )
      )}
    </div>
  );
}
