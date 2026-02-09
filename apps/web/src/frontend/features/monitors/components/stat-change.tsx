import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type ChangeType = "uptime" | "responseTime" | "neutral";

interface StatChangeProps {
  value: number;
  type: ChangeType;
  suffix?: string;
  decimals?: number;
}

export default function StatChange({
  value,
  type,
  suffix = "",
  decimals = 1,
}: StatChangeProps) {
  if (value === 0 || !Number.isFinite(value)) {
    return null;
  }

  const isPositive = value > 0;
  const isNegative = value < 0;
  const displayValue = Math.abs(value).toFixed(decimals);

  // Determine if change is good or bad based on type
  const isGood =
    type === "uptime"
      ? isPositive // Higher uptime is good
      : type === "responseTime"
        ? isNegative // Lower response time is good
        : false; // Neutral has no good/bad

  const isBad =
    type === "uptime"
      ? isNegative // Lower uptime is bad
      : type === "responseTime"
        ? isPositive // Higher response time is bad
        : false;

  const Icon = isPositive ? ArrowUp : isNegative ? ArrowDown : Minus;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        isGood && "text-green-700",
        isBad && "text-red-700",
        type === "neutral" && "text-muted-foreground",
      )}
    >
      <Icon className="h-3 w-3" />
      {isPositive && "+"}
      {displayValue}
      {suffix}
    </span>
  );
}
