import { getRouteApi } from "@tanstack/react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useUpdateIncidentStatus } from "../api/use-update-incident-status";
import type { IncidentStatus } from "../types";

const STATUS_LABELS: Record<IncidentStatus, string> = {
  ongoing: "Ongoing",
  acknowledged: "Acknowledged",
  fixing: "Fixing",
  recovered: "Recovered",
  resolved: "Resolved",
};

const STATUS_COLORS: Record<IncidentStatus, string> = {
  ongoing: "text-red-700 dark:text-red-500",
  acknowledged: "text-amber-700 dark:text-amber-500",
  fixing: "text-blue-700 dark:text-blue-500",
  recovered: "text-green-700 dark:text-green-500",
  resolved: "text-muted-foreground",
};

export function IncidentStatusSelector({
  currentStatus,
}: {
  currentStatus: IncidentStatus;
}) {
  const routeApi = getRouteApi("/(dashboard)/$teamId/incidents/$incidentId");
  const { teamId, incidentId } = routeApi.useParams();
  const updateStatus = useUpdateIncidentStatus();

  const handleChange = (value: string) => {
    if (!value || value === currentStatus) return;

    updateStatus.mutate({
      teamId: Number(teamId),
      incidentId: Number(incidentId),
      status: value as IncidentStatus,
    });
  };

  return (
    <Select
      value={currentStatus}
      onValueChange={handleChange}
      disabled={updateStatus.isPending}
    >
      <SelectTrigger className="w-full h-8 text-xs">
        <SelectValue>
          <span className={STATUS_COLORS[currentStatus]}>
            {STATUS_LABELS[currentStatus]}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            <span className={STATUS_COLORS[value as IncidentStatus]}>
              {label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
