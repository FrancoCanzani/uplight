import { useMemo } from "react";
import { format } from "date-fns";
import {
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import NoDataMessage from "@/components/no-data-message";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { CheckResult } from "../api/fetch-checks";
import type { AnalystFinding } from "../api/fetch-findings";
import getLocationLabel from "../utils/get-location-label";

const findingColorBySeverity: Record<AnalystFinding["severity"], string> = {
  healthy: "oklch(0.70 0.02 250)",
  watch: "oklch(0.74 0.17 85)",
  warning: "oklch(0.68 0.20 45)",
  critical: "oklch(0.62 0.22 28)",
  predicted: "oklch(0.60 0.18 255)",
};

export default function ResponseTimeChart({
  checks,
  findings = [],
}: {
  checks: CheckResult[];
  findings?: AnalystFinding[];
}) {
  const { chartData, avgResponseTime, regions, chartConfig, findingDots } =
    useMemo(() => {
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
              point[region] = Math.max(...times);
            }
          });
          return point;
        })
        .sort((a, b) => a.time - b.time);

      const allValues = data.flatMap((d) =>
        uniqueRegions.map((r) => d[r]).filter((v) => v !== undefined),
      );
      const avg =
        allValues.length > 0
          ? Math.round(allValues.reduce((a, b) => a + b, 0) / allValues.length)
          : 0;

      const regionColors = [
        "oklch(0.55 0.22 142)",
        "oklch(0.55 0.22 250)",
        "oklch(0.55 0.22 10)",
        "oklch(0.55 0.22 280)",
        "oklch(0.55 0.22 200)",
        "oklch(0.55 0.22 320)",
        "oklch(0.55 0.22 60)",
        "oklch(0.55 0.22 180)",
        "oklch(0.55 0.22 30)",
        "oklch(0.55 0.22 300)",
      ];

      const config: ChartConfig = {};
      uniqueRegions.forEach((region, i) => {
        config[region] = {
          label: getLocationLabel(region),
          color: regionColors[i % regionColors.length],
        };
      });

      const dots = findings
        .filter((finding) => finding.severity !== "healthy")
        .map((finding) => {
          let nearestPoint: Record<string, number> | null = null;
          let nearestDistance = Number.POSITIVE_INFINITY;

          for (const point of data) {
            const distance = Math.abs(point.time - finding.createdAt);
            if (distance < nearestDistance) {
              nearestDistance = distance;
              nearestPoint = point;
            }
          }

          const yFromRegion = uniqueRegions
            .map((region) => nearestPoint?.[region])
            .find((value): value is number => typeof value === "number");

          return {
            id: finding.id,
            x: nearestPoint?.time ?? finding.createdAt,
            y: yFromRegion ?? avg,
            severity: finding.severity,
            color: findingColorBySeverity[finding.severity],
          };
        });

      return {
        chartData: data,
        avgResponseTime: avg,
        regions: uniqueRegions,
        chartConfig: config,
        findingDots: dots,
      };
    }, [checks, findings]);

  if (chartData.length === 0) {
    return <NoDataMessage text="No data available" />;
  }

  return (
    <ChartContainer config={chartConfig} className="h-60 w-full">
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
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              className=""
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
        {findingDots.map((dot) => (
          <ReferenceDot
            key={dot.id}
            x={dot.x}
            y={dot.y}
            r={dot.severity === "critical" ? 4 : 3}
            fill={dot.color}
            stroke="var(--background)"
            strokeWidth={1}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
