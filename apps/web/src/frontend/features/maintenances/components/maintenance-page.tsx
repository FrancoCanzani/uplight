import NoDataMessage from "@/components/no-data-message";
import { Spinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
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
    <div className="space-y-12 w-full lg:max-w-3xl mx-auto">
      <div>
        <Link
          to="/$teamId/monitors/$monitorId"
          params={{ teamId, monitorId }}
          className="text-xs hover:underline text-muted-foreground hover:text-primary"
        >
          ← Back to Monitor
        </Link>
      </div>

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

        {!isLoading && maintenanceWindows?.length === 0 && (
          <NoDataMessage text="No maintenance windows scheduled." />
        )}

        {maintenanceWindows
          ?.sort((a, b) => b.startsAt - a.startsAt)
          .map((item) => (
            <MaintenanceItem key={item.id} item={item} />
          ))}
      </div>
    </div>
  );
}
