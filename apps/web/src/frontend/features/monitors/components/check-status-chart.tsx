import NoDataMessage from "@/components/no-data-message";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { format, startOfDay } from "date-fns";
import { useMemo } from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import type { CheckResult } from "../api/fetch-checks";

// Colors match the app's status colors from utils.ts
const chartConfig = {
  success: {
    label: "Success",
    color: "oklch(0.596 0.145 163.225)", // emerald-600
  },
  degraded: {
    label: "Degraded",
    color: "oklch(0.705 0.213 47.604)", // orange-500
  },
  failure: {
    label: "Failure",
    color: "oklch(0.577 0.245 27.325)", // red-600
  },
  maintenance: {
    label: "Maintenance",
    color: "oklch(0.623 0.214 259.815)", // blue-500
  },
} satisfies ChartConfig;

type DailyData = {
  date: string;
  timestamp: number;
  success: number;
  degraded: number;
  failure: number;
  maintenance: number;
  total: number;
};

export default function CheckStatusChart({
  checks,
}: {
  checks: CheckResult[];
}) {
  const chartData = useMemo(() => {
    if (checks.length === 0) return [];

    const grouped: Record<string, DailyData> = {};

    checks.forEach((check) => {
      const day = startOfDay(check.checkedAt).getTime();
      const dateKey = format(day, "yyyy-MM-dd");

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: format(day, "MMM d"),
          timestamp: day,
          success: 0,
          degraded: 0,
          failure: 0,
          maintenance: 0,
          total: 0,
        };
      }

      grouped[dateKey].total++;

      if (check.result === "success") {
        grouped[dateKey].success++;
      } else if (check.result === "degraded") {
        grouped[dateKey].degraded++;
      } else if (check.result === "maintenance") {
        grouped[dateKey].maintenance++;
      } else {
        // failure, timeout, error
        grouped[dateKey].failure++;
      }
    });

    return Object.values(grouped).sort((a, b) => a.timestamp - b.timestamp);
  }, [checks]);

  if (chartData.length === 0) {
    return <NoDataMessage text="No data available" />;
  }

  return (
    <ChartContainer config={chartConfig} className="h-48 w-full">
      <BarChart
        accessibilityLayer
        data={chartData}
        stackOffset="expand"
        margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
      >
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={40}
        />
        <YAxis
          tickFormatter={(val) => `${Math.round(val * 100)}%`}
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          domain={[0, 1]}
          ticks={[0, 0.25, 0.5, 0.75, 1]}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              className="rounded"
              labelFormatter={(_, payload) => {
                if (payload?.[0]?.payload?.date) {
                  return payload[0].payload.date;
                }
                return "";
              }}
              formatter={(value, name, item) => {
                const total = item.payload.total;
                const count = item.payload[name as keyof DailyData] as number;
                const percent = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
                const label = chartConfig[name as keyof typeof chartConfig]?.label || name;
                return (
                  <div className="flex w-full justify-between gap-4">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-mono font-medium">
                      {count} ({percent}%)
                    </span>
                  </div>
                );
              }}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="success"
          stackId="status"
          fill="var(--color-success)"
          radius={0}
        />
        <Bar
          dataKey="degraded"
          stackId="status"
          fill="var(--color-degraded)"
          radius={0}
        />
        <Bar
          dataKey="failure"
          stackId="status"
          fill="var(--color-failure)"
          radius={0}
        />
        <Bar
          dataKey="maintenance"
          stackId="status"
          fill="var(--color-maintenance)"
          radius={[2, 2, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
