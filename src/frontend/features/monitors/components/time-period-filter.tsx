import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRouteApi, useNavigate } from "@tanstack/react-router";

const TIME_PERIODS = [
  { value: "1", label: "Last day" },
  { value: "7", label: "Last week" },
  { value: "14", label: "Last 14 days" },
] as const;

export default function TimePeriodFilter({
  teamId,
  monitorId,
  currentPeriod,
}: {
  teamId: string;
  monitorId: string;
  currentPeriod?: string;
}) {
  const navigate = useNavigate();
  const routeApi = getRouteApi("/(dashboard)/$teamId/monitors/$monitorId/");
  const currentSearch = routeApi.useSearch() || {};

  const handleChange = (value: string | null) => {
    if (!value) return;
    navigate({
      to: "/$teamId/monitors/$monitorId",
      params: { teamId, monitorId },
      search: {
        ...currentSearch,
        period: value,
      },
    });
  };

  const currentLabel =
    TIME_PERIODS.find((p) => p.value === currentPeriod)?.label ?? "Last week";

  return (
    <Select value={currentPeriod || "7"} onValueChange={handleChange}>
      <SelectTrigger size="xs">
        <SelectValue>{currentLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {TIME_PERIODS.map((period) => (
          <SelectItem key={period.value} value={period.value}>
            {period.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
