import { getRouteApi } from "@tanstack/react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useUpdateIncident } from "../api/use-update-incident";
import type { IncidentSeverity } from "../types";

const SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

const SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  low: "text-blue-700 dark:text-blue-500",
  medium: "text-amber-700 dark:text-amber-500",
  high: "text-orange-700 dark:text-orange-500",
  critical: "text-red-700 dark:text-red-500",
};

export function IncidentSeveritySelector({
  currentSeverity,
  compact = false,
}: {
  currentSeverity: IncidentSeverity | null;
  compact?: boolean;
}) {
  const routeApi = getRouteApi("/(dashboard)/$teamId/incidents/$incidentId");
  const { teamId, incidentId } = routeApi.useParams();
  const updateIncident = useUpdateIncident();

  const handleChange = (value: string | null) => {
    if (!value) return;

    if (value === "none") {
      updateIncident.mutate({
        teamId: Number(teamId),
        incidentId: Number(incidentId),
        severity: null,
      });
    } else {
      updateIncident.mutate({
        teamId: Number(teamId),
        incidentId: Number(incidentId),
        severity: value as IncidentSeverity,
      });
    }
  };

  const displayValue = currentSeverity
    ? SEVERITY_LABELS[currentSeverity]
    : "Not set";
  const displayColor = currentSeverity
    ? SEVERITY_COLORS[currentSeverity]
    : "text-muted-foreground";

  if (compact) {
    return (
      <Select
        value={currentSeverity || "none"}
        onValueChange={handleChange}
        disabled={updateIncident.isPending}
      >
        <SelectTrigger className="w-auto h-7 text-xs border-0 bg-transparent px-2">
          <SelectValue>
            <span className={displayColor}>{displayValue}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <span className="text-muted-foreground">Not set</span>
          </SelectItem>
          {Object.entries(SEVERITY_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              <span className={SEVERITY_COLORS[value as IncidentSeverity]}>
                {label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Select
      value={currentSeverity || "none"}
      onValueChange={handleChange}
      disabled={updateIncident.isPending}
    >
      <SelectTrigger className="w-45">
        <SelectValue>
          <span className={displayColor}>{displayValue}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">
          <span className="text-muted-foreground">Not set</span>
        </SelectItem>
        {Object.entries(SEVERITY_LABELS).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            <span className={SEVERITY_COLORS[value as IncidentSeverity]}>
              {label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
