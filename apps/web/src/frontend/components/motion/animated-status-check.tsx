"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { LOCATIONS } from "@/features/monitors/constants";
import { getBgStatusColor } from "@/features/monitors/utils/get-status-color";

type CheckState = "idle" | "checking" | "success" | "failure" | "timeout";

interface RegionCheck {
  id: string;
  label: string;
  state: CheckState;
  latency: number | null;
}

export function AnimatedMonitorDemo({ className }: { className?: string }) {
  const [checks, setChecks] = useState<RegionCheck[]>(
    LOCATIONS.map((loc) => ({
      id: loc.id,
      label: loc.label,
      state: "idle",
      latency: null,
    }))
  );
  const [isChecking, setIsChecking] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const runCheck = () => {
    if (isChecking) return;
    setIsChecking(true);

    // Reset all to idle
    setChecks(
      LOCATIONS.map((loc) => ({
        id: loc.id,
        label: loc.label,
        state: "idle",
        latency: null,
      }))
    );

    // Stagger checks from each region
    LOCATIONS.forEach((_, index) => {
      // Start checking
      setTimeout(() => {
        setChecks((prev) =>
          prev.map((c, i) => (i === index ? { ...c, state: "checking" } : c))
        );
      }, index * 120);

      // Complete check
      setTimeout(
        () => {
          const latency = Math.floor(Math.random() * 180) + 25;
          const rand = Math.random();
          // 92% success, 5% timeout, 3% failure
          const state: CheckState =
            rand > 0.08 ? "success" : rand > 0.03 ? "timeout" : "failure";
          setChecks((prev) =>
            prev.map((c, i) =>
              i === index ? { ...c, state, latency: state === "success" ? latency : null } : c
            )
          );
        },
        index * 120 + 500 + Math.random() * 300
      );
    });

    setTimeout(() => setIsChecking(false), 2500);
  };

  useEffect(() => {
    const timeout = setTimeout(runCheck, 500);
    intervalRef.current = setInterval(runCheck, 5000);
    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const successCount = checks.filter((c) => c.state === "success").length;
  const hasFailure = checks.some((c) => c.state === "failure");
  const hasTimeout = checks.some((c) => c.state === "timeout");
  const allChecked = checks.every((c) => c.state !== "idle" && c.state !== "checking");
  const avgLatency =
    checks.filter((c) => c.latency).reduce((a, c) => a + (c.latency || 0), 0) /
      (checks.filter((c) => c.latency).length || 1) || 0;

  // Determine overall status
  const getOverallStatus = () => {
    if (hasFailure) return "down";
    if (hasTimeout) return "degraded";
    if (allChecked && successCount === LOCATIONS.length) return "up";
    return "initializing";
  };

  return (
    <div
      className={cn(
        "w-full max-w-md ring-1 ring-foreground/10 bg-card text-card-foreground",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MonitorStatusIndicator status={getOverallStatus()} />
            <span className="text-sm font-medium">api.yourcompany.com</span>
          </div>
          <span className="text-xs text-muted-foreground">HTTPS</span>
        </div>
        <div className="text-xs text-muted-foreground">
          https://api.yourcompany.com/health
        </div>
      </div>

      {/* Region Checks */}
      <div className="p-4 space-y-1.5">
        <div className="text-xs text-muted-foreground mb-3">
          Checking from {LOCATIONS.length} regions
        </div>
        {checks.map((check, i) => (
          <RegionCheckRow key={check.id} check={check} index={i} />
        ))}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-border/30 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-muted-foreground">Uptime </span>
            <span className="text-green-700 dark:text-green-500 tabular-nums">99.9%</span>
          </div>
          <div>
            <span className="text-muted-foreground">Avg </span>
            <span className="tabular-nums">
              {avgLatency > 0 ? `${Math.round(avgLatency)}ms` : "—"}
            </span>
          </div>
        </div>
        <div className="text-muted-foreground tabular-nums">
          {successCount}/{LOCATIONS.length}
        </div>
      </div>
    </div>
  );
}

function MonitorStatusIndicator({ status }: { status: string }) {
  const isActive = status === "up" || status === "checking" || status === "initializing";

  return (
    <div
      className={cn(
        "size-2 rounded-full flex items-center justify-center",
        getBgStatusColor(status)
      )}
    >
      {isActive && (
        <div
          className={cn(
            "size-1.5 rounded-full animate-ping",
            getBgStatusColor(status)
          )}
        />
      )}
    </div>
  );
}

function RegionCheckRow({
  check,
  index,
}: {
  check: RegionCheck;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center justify-between py-1"
    >
      <span className="text-xs text-muted-foreground">{check.label}</span>
      <div className="flex items-center gap-2">
        <AnimatePresence mode="wait">
          {check.state === "idle" && (
            <motion.span
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              className="text-xs text-muted-foreground tabular-nums w-14 text-right"
            >
              —
            </motion.span>
          )}
          {check.state === "checking" && (
            <motion.div
              key="checking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-14 flex justify-end"
            >
              <div className="size-3 rounded-full border border-muted-foreground/50 border-t-transparent animate-spin" />
            </motion.div>
          )}
          {check.state === "success" && (
            <motion.span
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs tabular-nums w-14 text-right text-muted-foreground"
            >
              {check.latency}ms
            </motion.span>
          )}
          {check.state === "timeout" && (
            <motion.span
              key="timeout"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs w-14 text-right text-orange-700 dark:text-orange-500"
            >
              timeout
            </motion.span>
          )}
          {check.state === "failure" && (
            <motion.span
              key="failure"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs w-14 text-right text-red-700 dark:text-red-500"
            >
              failed
            </motion.span>
          )}
        </AnimatePresence>
        <div className="w-4 flex justify-center">
          <AnimatePresence mode="wait">
            {check.state === "success" && (
              <motion.div
                key="success-dot"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="size-1.5 rounded-full bg-green-700"
              />
            )}
            {check.state === "timeout" && (
              <motion.div
                key="timeout-dot"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="size-1.5 rounded-full bg-orange-700"
              />
            )}
            {check.state === "failure" && (
              <motion.div
                key="failure-dot"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="size-1.5 rounded-full bg-red-700"
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
