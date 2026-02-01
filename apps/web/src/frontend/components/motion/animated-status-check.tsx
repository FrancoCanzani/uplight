"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { LOCATIONS } from "@/features/monitors/constants";
import { getBgStatusColor } from "@/features/monitors/utils/get-status-color";
import { Check, AlertTriangle, X, Globe, Zap, Bell } from "lucide-react";

type CheckState = "idle" | "checking" | "success" | "failure" | "timeout";

interface RegionCheck {
  id: string;
  label: string;
  state: CheckState;
  latency: number | null;
}

export function AnimatedMonitorDemo({ className }: { className?: string }) {
  const [checks, setChecks] = useState<RegionCheck[]>(
    LOCATIONS.slice(0, 5).map((loc) => ({
      id: loc.id,
      label: loc.label,
      state: "idle",
      latency: null,
    }))
  );
  const [isChecking, setIsChecking] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const runCheck = () => {
    if (isChecking) return;
    setIsChecking(true);
    setCurrentStep(1);

    // Reset all to idle
    setChecks(
      LOCATIONS.slice(0, 5).map((loc) => ({
        id: loc.id,
        label: loc.label,
        state: "idle",
        latency: null,
      }))
    );

    // Show "sending requests" step
    setTimeout(() => setCurrentStep(2), 300);

    // Stagger checks from each region
    LOCATIONS.slice(0, 5).forEach((_, index) => {
      setTimeout(() => {
        setChecks((prev) =>
          prev.map((c, i) => (i === index ? { ...c, state: "checking" } : c))
        );
      }, 500 + index * 150);

      setTimeout(
        () => {
          const latency = Math.floor(Math.random() * 150) + 30;
          const state: CheckState = Math.random() > 0.05 ? "success" : "timeout";
          setChecks((prev) =>
            prev.map((c, i) =>
              i === index ? { ...c, state, latency: state === "success" ? latency : null } : c
            )
          );
        },
        500 + index * 150 + 400 + Math.random() * 200
      );
    });

    // Show results step
    setTimeout(() => setCurrentStep(3), 1800);
    setTimeout(() => setIsChecking(false), 2500);
  };

  useEffect(() => {
    const timeout = setTimeout(runCheck, 800);
    intervalRef.current = setInterval(runCheck, 5500);
    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const successCount = checks.filter((c) => c.state === "success").length;
  const avgLatency =
    checks.filter((c) => c.latency).reduce((a, c) => a + (c.latency || 0), 0) /
      (checks.filter((c) => c.latency).length || 1) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={cn(
        "w-full max-w-md bg-card ring-1 ring-border/50 shadow-2xl shadow-black/10",
        className
      )}
    >
      {/* Header - Monitor Info */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-surface ring-1 ring-border/50 flex items-center justify-center">
            <Globe className="size-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">api.example.com</div>
            <div className="text-xs text-muted-foreground font-mono">/health</div>
          </div>
          <StatusBadge
            status={successCount === 5 ? "up" : successCount > 0 ? "degraded" : "checking"}
          />
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="text-muted-foreground">Workflow</span>
          <span className="font-mono text-muted-foreground">
            {currentStep > 0 ? `Step ${Math.min(currentStep, 3)}/3` : "Ready"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <WorkflowStep
            icon={Globe}
            label="Check"
            active={currentStep === 1}
            complete={currentStep > 1}
          />
          <div className="flex-1 h-px bg-border/50" />
          <WorkflowStep
            icon={Zap}
            label="Analyze"
            active={currentStep === 2}
            complete={currentStep > 2}
          />
          <div className="flex-1 h-px bg-border/50" />
          <WorkflowStep
            icon={Bell}
            label="Report"
            active={currentStep === 3}
            complete={currentStep > 3}
          />
        </div>
      </div>

      {/* Region Results */}
      <div className="p-4 space-y-1">
        <div className="text-xs text-muted-foreground mb-2">
          Checking from {checks.length} regions
        </div>
        {checks.map((check, i) => (
          <RegionCheckRow key={check.id} check={check} index={i} />
        ))}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-border/30 bg-surface/30">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-muted-foreground">Avg </span>
              <span className="font-mono tabular-nums">
                {avgLatency > 0 ? `${Math.round(avgLatency)}ms` : "—"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Status </span>
              <span className="font-mono tabular-nums text-green-700 dark:text-green-500">
                {successCount}/{checks.length} OK
              </span>
            </div>
          </div>
          <div className="font-mono text-muted-foreground">
            1 min interval
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: "up" | "degraded" | "checking" }) {
  const config = {
    up: { label: "Operational", color: "bg-green-700", textColor: "text-green-700 dark:text-green-500" },
    degraded: { label: "Degraded", color: "bg-amber-700", textColor: "text-amber-700 dark:text-amber-500" },
    checking: { label: "Checking...", color: "bg-slate-600", textColor: "text-muted-foreground" },
  };

  const { label, color, textColor } = config[status];

  return (
    <div className={cn("flex items-center gap-1.5 text-xs", textColor)}>
      <span className={cn("size-1.5 rounded-full", color)} />
      <span>{label}</span>
    </div>
  );
}

function WorkflowStep({
  icon: Icon,
  label,
  active,
  complete,
}: {
  icon: typeof Globe;
  label: string;
  active: boolean;
  complete: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        animate={{
          scale: active ? 1.1 : 1,
          backgroundColor: complete
            ? "rgb(21 128 61)"
            : active
              ? "var(--color-surface)"
              : "transparent",
        }}
        className={cn(
          "size-7 rounded-full flex items-center justify-center ring-1 transition-colors",
          complete
            ? "ring-green-700"
            : active
              ? "ring-foreground/20"
              : "ring-border/50"
        )}
      >
        {complete ? (
          <Check className="size-3.5 text-white" />
        ) : (
          <Icon
            className={cn(
              "size-3.5 transition-colors",
              active ? "text-foreground" : "text-muted-foreground"
            )}
          />
        )}
      </motion.div>
      <span
        className={cn(
          "text-[10px] transition-colors",
          active || complete ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </div>
  );
}

function RegionCheckRow({ check, index }: { check: RegionCheck; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
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
              className="text-xs text-muted-foreground tabular-nums w-12 text-right font-mono"
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
              className="w-12 flex justify-end"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="size-3 rounded-full border border-green-700/30 border-t-green-700"
              />
            </motion.div>
          )}
          {check.state === "success" && (
            <motion.span
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs tabular-nums w-12 text-right text-muted-foreground font-mono"
            >
              {check.latency}ms
            </motion.span>
          )}
          {check.state === "timeout" && (
            <motion.span
              key="timeout"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs w-12 text-right text-orange-700 dark:text-orange-500 font-mono"
            >
              timeout
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
              >
                <Check className="size-3 text-green-700" />
              </motion.div>
            )}
            {check.state === "timeout" && (
              <motion.div
                key="timeout-dot"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                <AlertTriangle className="size-3 text-orange-700" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
