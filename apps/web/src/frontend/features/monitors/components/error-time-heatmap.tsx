import { useMemo } from "react";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { addHours, addMilliseconds, format, startOfDay, subDays } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { CheckResult } from "../api/fetch-checks";

const routeApi = getRouteApi("/(dashboard)/$teamId/monitors/$monitorId/");

export default function ErrorTimeHeatmap({ checks }: { checks: CheckResult[] }) {
  const { teamId, monitorId } = routeApi.useParams();
  const search = routeApi.useSearch();
  const navigate = useNavigate();
  const region = search.region;
  const period = Number(search.period || "7");

  const { days, slots, maxErrors, totalChecks, totalErrors } = useMemo(() => {
    const dayCount = period > 0 ? period : 7;
    const lastDay = startOfDay(new Date());
    const rows = Array.from({ length: dayCount }, (_, i) => subDays(lastDay, dayCount - 1 - i));
    const matrix = new Map<string, { checks: number; errors: number }>();

    for (const check of checks) {
      const checkedAt = new Date(check.checkedAt);
      const day = startOfDay(checkedAt).getTime();
      const hour = checkedAt.getHours();
      const key = `${day}-${hour}`;

      const current = matrix.get(key) ?? { checks: 0, errors: 0 };
      current.checks += 1;
      if (
        check.result !== "success" &&
        check.result !== "degraded" &&
        check.result !== "maintenance"
      ) {
        current.errors += 1;
      }
      matrix.set(key, current);
    }

    const builtSlots = rows.map((day) => {
      const dayTs = day.getTime();
      return Array.from({ length: 24 }, (_, hour) => {
        const key = `${dayTs}-${hour}`;
        const entry = matrix.get(key) ?? { checks: 0, errors: 0 };
        return {
          dayTs,
          hour,
          checks: entry.checks,
          errors: entry.errors,
        };
      });
    });

    const errorTotals = builtSlots.flatMap((row) => row.map((slot) => slot.errors));

    return {
      days: rows,
      slots: builtSlots,
      maxErrors: Math.max(...errorTotals, 0),
      totalChecks: builtSlots
        .flatMap((row) => row.map((slot) => slot.checks))
        .reduce((acc, val) => acc + val, 0),
      totalErrors: errorTotals.reduce((acc, val) => acc + val, 0),
    };
  }, [checks, period]);

  const getIntensityClass = (checkCount: number, errorCount: number) => {
    if (checkCount <= 0) return "bg-muted/35 hover:bg-muted/55";
    if (errorCount <= 0) return "bg-green-700/70 hover:bg-green-700/85";
    if (maxErrors <= 1) return "bg-amber-600/80 hover:bg-amber-600/95";

    const normalized = errorCount / maxErrors;
    if (normalized < 0.35) return "bg-amber-600/80 hover:bg-amber-600/95";
    if (normalized < 0.7) return "bg-red-600/75 hover:bg-red-600/90";
    return "bg-red-700/95 hover:bg-red-700";
  };

  const openLogsAtSlot = (
    dayTs: number,
    hour: number,
    checkCount: number,
    errorCount: number,
  ) => {
    if (checkCount <= 0) return;
    const slotStart = addHours(new Date(dayTs), hour).getTime();
    const slotEnd = addMilliseconds(addHours(new Date(dayTs), hour + 1), -1).getTime();

    navigate({
      to: "/$teamId/monitors/$monitorId/logs",
      params: { teamId, monitorId },
      search: (prev) => ({
        ...prev,
        status: errorCount > 0 ? "issues" : undefined,
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
      <h3 className="font-medium">Error Heatmap</h3>
      <div className="text-xs text-muted-foreground">
        {totalErrors} errors across {totalChecks} checks over the last {period} day
        {period === 1 ? "" : "s"}. Select a cell to inspect matching logs.
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
                const errorRate =
                  slot.checks > 0
                    ? Math.round((slot.errors / slot.checks) * 100)
                    : 0;

                const cell = (
                  <button
                    type="button"
                    className={`h-3.5 transition-colors ${getIntensityClass(slot.checks, slot.errors)} ${slot.checks > 0 ? "cursor-pointer" : "cursor-default"}`}
                    title={`${format(slotDate, "MMM d, HH:00")} • ${slot.errors} error${slot.errors === 1 ? "" : "s"} • ${slot.checks} check${slot.checks === 1 ? "" : "s"}`}
                    aria-label={`${format(slotDate, "MMM d, HH:00")}: ${slot.errors} errors from ${slot.checks} checks`}
                    onClick={() =>
                      openLogsAtSlot(
                        slot.dayTs,
                        slot.hour,
                        slot.checks,
                        slot.errors,
                      )
                    }
                  />
                );

                if (slot.checks <= 0) {
                  return (
                    <div key={`${slot.dayTs}-${slot.hour}`}>
                      {cell}
                    </div>
                  );
                }

                return (
                  <Tooltip key={`${slot.dayTs}-${slot.hour}-tooltip`}>
                    <TooltipTrigger render={cell} />
                    <TooltipContent side="top" className="text-xs">
                      <div className="space-y-1">
                        <div className="font-medium">
                          {format(slotDate, "MMM d, HH:00")}
                        </div>
                        <div className="font-mono">
                          {slot.errors} errors / {slot.checks} checks
                        </div>
                        <div className="text-muted-foreground">
                          Error rate: {errorRate}%
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span>Less</span>
        <div className="h-3 w-4 bg-muted/35" />
        <div className="h-3 w-4 bg-amber-600/80" />
        <div className="h-3 w-4 bg-red-600/75" />
        <div className="h-3 w-4 bg-red-700/95" />
        <span>More</span>
      </div>
    </div>
  );
}
