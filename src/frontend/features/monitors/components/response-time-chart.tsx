import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { CheckResult } from "../api/fetch-checks";
import { format } from "date-fns";

interface ResponseTimeChartProps {
  checks: CheckResult[];
}

export default function ResponseTimeChart({ checks }: ResponseTimeChartProps) {
  const chartData = useMemo(() => {
    const sorted = [...checks].sort((a, b) => a.checkedAt - b.checkedAt);

    const grouped = sorted.reduce(
      (acc, check) => {
        const hour = new Date(check.checkedAt).toISOString().slice(0, 13);
        if (!acc[hour]) {
          acc[hour] = { times: [], timestamp: check.checkedAt };
        }
        acc[hour].times.push(check.responseTime);
        return acc;
      },
      {} as Record<string, { times: number[]; timestamp: number }>
    );

    return Object.entries(grouped)
      .map(([, data]) => ({
        time: data.timestamp,
        responseTime: Math.round(
          data.times.reduce((a, b) => a + b, 0) / data.times.length
        ),
      }))
      .sort((a, b) => a.time - b.time);
  }, [checks]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        No data available
      </div>
    );
  }

  return (
    <div className="h-32 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        >
          <XAxis
            dataKey="time"
            tickFormatter={(val) => format(val, "HH:mm")}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            minTickGap={40}
          />
          <YAxis
            tickFormatter={(val) => `${val}ms`}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            width={45}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
              fontSize: "12px",
            }}
            labelFormatter={(val) => format(val, "MMM d, h:mm a")}
            formatter={(value: number) => [`${value}ms`, "Response time"]}
          />
          <Line
            type="monotone"
            dataKey="responseTime"
            stroke="#10b981"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: "#10b981" }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
