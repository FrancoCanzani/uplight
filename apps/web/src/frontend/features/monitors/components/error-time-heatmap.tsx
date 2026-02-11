import { useMemo } from "react";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { addHours, addMilliseconds, format, startOfDay, subDays } from "date-fns";
import type { CheckResult } from "../api/fetch-checks";

const routeApi = getRouteApi("/(dashboard)/$teamId/monitors/$monitorId/");

export default function ErrorTimeHeatmap({ checks }: { checks: CheckResult[] }) {
  const { teamId, monitorId } = routeApi.useParams();
  const search = routeApi.useSearch();
  const navigate = useNavigate();
  const region = search.region;
  const period = Number(search.period || "7");

  const { days, slots, maxChecks, totalChecks } = useMemo(() => {
    const dayCount = period > 0 ? period : 7;
    const lastDay = startOfDay(new Date());
    const rows = Array.from({ length: dayCount }, (_, i) => subDays(lastDay, dayCount - 1 - i));
    const matrix = new Map<string, { checks: number }>();

    for (const check of checks) {
      const checkedAt = new Date(check.checkedAt);
      const day = startOfDay(checkedAt).getTime();
      const hour = checkedAt.getHours();
      const key = `${day}-${hour}`;

      const current = matrix.get(key) ?? { checks: 0 };
      current.checks += 1;
      matrix.set(key, current);
    }

    const builtSlots = rows.map((day) => {
      const dayTs = day.getTime();
      return Array.from({ length: 24 }, (_, hour) => {
        const key = `${dayTs}-${hour}`;
        const entry = matrix.get(key) ?? { checks: 0 };
        return {
          dayTs,
          hour,
          checks: entry.checks,
        };
      });
    });

    const checkTotals = builtSlots.flatMap((row) => row.map((slot) => slot.checks));

    return {
      days: rows,
      slots: builtSlots,
      maxChecks: Math.max(...checkTotals, 0),
      totalChecks: checkTotals.reduce((acc, val) => acc + val, 0),
    };
  }, [checks, period]);

  const getIntensityClass = (checkCount: number) => {
    if (checkCount <= 0) return "bg-muted/35 hover:bg-muted/55";
    if (maxChecks <= 1) return "bg-green-700/70 hover:bg-green-700/85";

    const normalized = checkCount / maxChecks;
    if (normalized < 0.2) return "bg-green-700/50 hover:bg-green-700/65";
    if (normalized < 0.4) return "bg-green-700/75 hover:bg-green-700/90";
    if (normalized < 0.6) return "bg-amber-600/80 hover:bg-amber-600/95";
    if (normalized < 0.85) return "bg-red-600/75 hover:bg-red-600/90";
    return "bg-red-700/95 hover:bg-red-700";
  };

  const openLogsAtSlot = (dayTs: number, hour: number, checkCount: number) => {
    if (checkCount <= 0) return;
    const slotStart = addHours(new Date(dayTs), hour).getTime();
    const slotEnd = addMilliseconds(addHours(new Date(dayTs), hour + 1), -1).getTime();

    navigate({
      to: "/$teamId/monitors/$monitorId/logs",
      params: { teamId, monitorId },
      search: (prev) => ({
        ...prev,
        status: undefined,
        date: undefined,
        dateFrom: String(slotStart),
        dateTo: String(slotEnd),
        region: region || undefined,
        search: undefined,
      }),
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Heatmap</h3>
      <div className="text-xs text-muted-foreground">
        {totalChecks} checks over the last {period} day{period === 1 ? "" : "s"}.
        Select a cell to inspect matching logs.
      </div>

      <div className="space-y-1.5">
        <div className="grid grid-cols-[72px_repeat(24,minmax(0,1fr))] gap-1 text-[9px] text-muted-foreground">
          <div />
          {Array.from({ length: 24 }, (_, hour) => (
            <div key={hour} className="text-center tabular-nums">
              {hour}
            </div>
          ))}
        </div>

        <div className="space-y-1">
          {slots.map((row, idx) => (
            <div
              key={days[idx].getTime()}
              className="grid grid-cols-[72px_repeat(24,minmax(0,1fr))] gap-1 items-center"
            >
              <div className="font-mono text-[10px] text-muted-foreground tabular-nums pr-1">
                {format(days[idx], "EEE MM/dd")}
              </div>
              {row.map((slot) => {
                const slotDate = addHours(new Date(slot.dayTs), slot.hour);
                return (
                  <button
                    key={`${slot.dayTs}-${slot.hour}`}
                    type="button"
                    className={`h-3.5 transition-colors ${getIntensityClass(slot.checks)} ${slot.checks > 0 ? "cursor-pointer" : "cursor-default"}`}
                    title={`${format(slotDate, "MMM d, HH:00")} • ${slot.checks} check${slot.checks === 1 ? "" : "s"}`}
                    aria-label={`${format(slotDate, "MMM d, HH:00")}: ${slot.checks} checks`}
                    onClick={() => openLogsAtSlot(slot.dayTs, slot.hour, slot.checks)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span>Less</span>
        <div className="h-3 w-4 bg-muted/35" />
        <div className="h-3 w-4 bg-green-700/50" />
        <div className="h-3 w-4 bg-green-700/75" />
        <div className="h-3 w-4 bg-amber-600/80" />
        <div className="h-3 w-4 bg-red-600/75" />
        <div className="h-3 w-4 bg-red-700/95" />
        <span>More</span>
      </div>
    </div>
  );
}
