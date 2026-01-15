import { getRouteApi } from "@tanstack/react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useUpdateIncident } from "../api/use-update-incident";
import type { IncidentType } from "../types";

const TYPE_LABELS: Record<IncidentType, string> = {
  availability: "Availability",
  performance: "Performance",
  security: "Security",
  data: "Data",
  other: "Other",
};

export function IncidentTypeSelector({
  currentType,
  compact = false,
}: {
  currentType: IncidentType | null;
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
        incidentType: null,
      });
    } else {
      updateIncident.mutate({
        teamId: Number(teamId),
        incidentId: Number(incidentId),
        incidentType: value as IncidentType,
      });
    }
  };

  const displayValue = currentType ? TYPE_LABELS[currentType] : "Not set";

  if (compact) {
    return (
      <Select
        value={currentType || "none"}
        onValueChange={handleChange}
        disabled={updateIncident.isPending}
      >
        <SelectTrigger className="w-auto h-7 text-xs border-0 bg-transparent px-2">
          <SelectValue>
            <span className={currentType ? "" : "text-muted-foreground"}>
              {displayValue}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <span className="text-muted-foreground">Not set</span>
          </SelectItem>
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Select
      value={currentType || "none"}
      onValueChange={handleChange}
      disabled={updateIncident.isPending}
    >
      <SelectTrigger className="w-45">
        <SelectValue>{displayValue}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">
          <span className="text-muted-foreground">Not set</span>
        </SelectItem>
        {Object.entries(TYPE_LABELS).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
