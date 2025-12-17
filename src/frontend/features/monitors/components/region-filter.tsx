import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import { LOCATIONS } from "../constants";

export default function RegionFilter({
  teamId,
  monitorId,
  currentRegion,
  availableRegions,
}: {
  teamId: string;
  monitorId: string;
  currentRegion?: string;
  availableRegions: string[];
}) {
  const navigate = useNavigate();

  const handleChange = (value: string | null) => {
    if (!value) return;
    navigate({
      to: "/$teamId/monitors/$monitorId",
      params: { teamId, monitorId },
      search: value === "all" ? {} : { region: value },
    });
  };

  const filteredLocations = LOCATIONS.filter((loc) =>
    availableRegions.includes(loc.id),
  );

  const currentLabel = currentRegion
    ? (LOCATIONS.find((loc) => loc.id === currentRegion)?.label ??
      currentRegion)
    : "All regions";

  return (
    <Select value={currentRegion || "all"} onValueChange={handleChange}>
      <SelectTrigger size="xs">
        <SelectValue>{currentLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All regions</SelectItem>
        {filteredLocations.map((loc) => (
          <SelectItem key={loc.id} value={loc.id}>
            {loc.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
