import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { CheckResult } from "../api/fetch-checks";
import { format } from "date-fns";
import getLocationLabel from "../utils/get-location-label";

interface ResponseTimeChartProps {
  checks: CheckResult[];
}

export default function ResponseTimeChart({ checks }: ResponseTimeChartProps) {
  const { chartData, avgResponseTime, regions, chartConfig } = useMemo(() => {
    const validChecks = checks.filter((c) => c.responseTime > 0);
    const sorted = [...validChecks].sort((a, b) => a.checkedAt - b.checkedAt);
    const uniqueRegions = [...new Set(validChecks.map((c) => c.location))];

    const grouped: Record<
      string,
      { timestamp: number; byRegion: Record<string, number[]> }
    > = {};

    sorted.forEach((check) => {
      const hour = new Date(check.checkedAt).toISOString().slice(0, 13);
      if (!grouped[hour]) {
        grouped[hour] = { timestamp: check.checkedAt, byRegion: {} };
      }
      if (!grouped[hour].byRegion[check.location]) {
        grouped[hour].byRegion[check.location] = [];
      }
      grouped[hour].byRegion[check.location].push(check.responseTime);
    });

    const data = Object.entries(grouped)
      .map(([, d]) => {
        const point: Record<string, number> = { time: d.timestamp };
        uniqueRegions.forEach((region) => {
          const times = d.byRegion[region];
          if (times && times.length > 0) {
            point[region] = Math.round(
              times.reduce((a, b) => a + b, 0) / times.length
            );
          }
        });
        return point;
      })
      .sort((a, b) => a.time - b.time);

    const allValues = data.flatMap((d) =>
      uniqueRegions.map((r) => d[r]).filter((v) => v !== undefined)
    );
    const avg =
      allValues.length > 0
        ? Math.round(allValues.reduce((a, b) => a + b, 0) / allValues.length)
        : 0;

    const config: ChartConfig = {};
    uniqueRegions.forEach((region, i) => {
      config[region] = {
        label: getLocationLabel(region),
        color: `var(--chart-${(i % 5) + 1})`,
      };
    });

    return {
      chartData: data,
      avgResponseTime: avg,
      regions: uniqueRegions,
      chartConfig: config,
    };
  }, [checks]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
        No data available
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-40 w-full">
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
      >
        <XAxis
          dataKey="time"
          tickFormatter={(val) => format(val, "MMM d, h a")}
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          minTickGap={60}
        />
        <YAxis
          tickFormatter={(val) => `${val}ms`}
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          width={50}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => {
                if (payload?.[0]?.payload?.time) {
                  return format(payload[0].payload.time, "MMMM d 'at' h:mm a");
                }
                return "";
              }}
            />
          }
        />
        <ReferenceLine
          y={avgResponseTime}
          stroke="var(--color-muted-foreground)"
          strokeDasharray="4 4"
          strokeOpacity={0.5}
        />
        {regions.map((region) => (
          <Line
            key={region}
            type="monotone"
            dataKey={region}
            stroke={`var(--color-${region})`}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
