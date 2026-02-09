import { useMemo } from "react";
import { Cell, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { CheckResult } from "../api/fetch-checks";
import { formatErrorMessage, formatStatusCodes } from "../utils/format-error-message";

const chartConfig = {
  timeout: {
    label: "Timeouts",
    color: "oklch(0.631 0.189 47.604)", // orange
  },
  server: {
    label: "5xx Errors",
    color: "oklch(0.509 0.211 27.325)", // red
  },
  client: {
    label: "4xx Errors",
    color: "oklch(0.619 0.195 57.5)", // amber
  },
  network: {
    label: "Network Errors",
    color: "oklch(0.542 0.186 259.815)", // blue
  },
  ssl: {
    label: "SSL Errors",
    color: "oklch(0.55 0.22 280)", // purple
  },
  other: {
    label: "Other Errors",
    color: "oklch(0.45 0.05 0)", // gray
  },
} satisfies ChartConfig;

type ErrorCategory =
  | "timeout"
  | "server"
  | "client"
  | "network"
  | "ssl"
  | "other";

function categorizeError(check: CheckResult): ErrorCategory {
  if (check.result === "timeout") {
    return "timeout";
  }

  if (check.statusCode) {
    if (check.statusCode >= 500) {
      return "server";
    }
    if (check.statusCode >= 400) {
      return "client";
    }
  }

  const errorMsg = check.errorMessage?.toLowerCase() || "";

  if (errorMsg.includes("ssl") || errorMsg.includes("certificate")) {
    return "ssl";
  }

  if (
    errorMsg.includes("network") ||
    errorMsg.includes("econnrefused") ||
    errorMsg.includes("enotfound") ||
    errorMsg.includes("etimedout") ||
    errorMsg.includes("connection")
  ) {
    return "network";
  }

  return "other";
}

export default function ErrorAnalysisCard({
  checks,
}: {
  checks: CheckResult[];
}) {
  const errorAnalysis = useMemo(() => {
    const failedChecks = checks.filter(
      (c) =>
        c.result !== "success" &&
        c.result !== "degraded" &&
        c.result !== "maintenance",
    );

    if (failedChecks.length === 0) {
      return { data: [], total: 0, mostCommon: null, errorRate: 0 };
    }

    const categories: Record<ErrorCategory, number> = {
      timeout: 0,
      server: 0,
      client: 0,
      network: 0,
      ssl: 0,
      other: 0,
    };

    const errorMessages: Record<string, number> = {};

    failedChecks.forEach((check) => {
      const category = categorizeError(check);
      categories[category]++;

      if (check.errorMessage) {
        errorMessages[check.errorMessage] =
          (errorMessages[check.errorMessage] || 0) + 1;
      }
    });

    const data = Object.entries(categories)
      .filter(([, count]) => count > 0)
      .map(([category, count]) => ({
        category: category as ErrorCategory,
        count,
        percentage: (count / failedChecks.length) * 100,
        fill: `var(--color-${category})`,
      }))
      .sort((a, b) => b.count - a.count);

    const mostCommon =
      Object.entries(errorMessages).length > 0
        ? Object.entries(errorMessages).sort((a, b) => b[1] - a[1])[0]
        : null;

    const errorRate = (failedChecks.length / checks.length) * 100;

    return { data, total: failedChecks.length, mostCommon, errorRate };
  }, [checks]);

  if (errorAnalysis.total === 0) {
    return null;
  }

  const COLORS = [
    chartConfig.timeout.color,
    chartConfig.server.color,
    chartConfig.client.color,
    chartConfig.network.color,
    chartConfig.ssl.color,
    chartConfig.other.color,
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Error Breakdown</CardTitle>
            <CardDescription>
              {errorAnalysis.total} errors ({errorAnalysis.errorRate.toFixed(1)}
              % of all checks)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => {
                        const item = errorAnalysis.data.find(
                          (d) => d.category === name,
                        );
                        const label =
                          chartConfig[name as keyof typeof chartConfig]
                            ?.label || name;
                        return (
                          <div className="flex w-full justify-between gap-4">
                            <span className="text-muted-foreground">
                              {label}
                            </span>
                            <span className="font-medium">
                              {value} ({item?.percentage.toFixed(1)}%)
                            </span>
                          </div>
                        );
                      }}
                    />
                  }
                />
                <Pie
                  data={errorAnalysis.data}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {errorAnalysis.data.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.category}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Error Types</h4>
              {errorAnalysis.data.map((item) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {chartConfig[item.category].label}
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {item.count} ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>

            {errorAnalysis.mostCommon && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">
                  Most Common Error
                </h4>
                <p className="text-sm font-mono bg-muted p-3 rounded break-words whitespace-pre-wrap">
                  {formatErrorMessage(errorAnalysis.mostCommon[0])}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Occurred {errorAnalysis.mostCommon[1]} times
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
