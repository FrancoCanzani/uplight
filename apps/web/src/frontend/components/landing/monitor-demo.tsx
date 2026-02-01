import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

const REGIONS = [
  { id: "weur", label: "Western Europe", latency: 64 },
  { id: "apac", label: "Asia Pacific", latency: 143 },
  { id: "sam", label: "South America", latency: null }, // timeout
] as const;

const QUERY = "api.example.com";
const EASE = [0.32, 0.72, 0, 1] as const;

type Stage =
  | { kind: "typing"; text: string }
  | { kind: "checking"; index: number }
  | { kind: "resolved"; index: number }
  | { kind: "result" };

function Spinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
      className="size-3 rounded-full border border-border border-t-foreground/60"
    />
  );
}

function runSequence(
  schedule: (fn: () => void, ms: number) => void,
  setStage: (s: Stage) => void,
) {
  let delay = 0;

  for (let i = 1; i <= QUERY.length; i++) {
    schedule(
      () => setStage({ kind: "typing", text: QUERY.slice(0, i) }),
      delay,
    );
    delay += 75;
  }

  delay += 700;

  REGIONS.forEach((region, i) => {
    schedule(() => setStage({ kind: "checking", index: i }), delay);
    delay += 600 + (region.latency ?? 400) * 0.6;

    schedule(() => setStage({ kind: "resolved", index: i }), delay);
    delay += 1200;
  });

  schedule(() => setStage({ kind: "result" }), delay);
}

function SlideIn({
  children,
  active,
}: {
  children: React.ReactNode;
  active: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: active ? 1 : 0, y: active ? 0 : -8 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="absolute inset-0 flex items-center"
    >
      {children}
    </motion.div>
  );
}

export function MonitorDemo() {
  const [stage, setStage] = useState<Stage>({ kind: "typing", text: "" });
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAll = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const schedule = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timeoutsRef.current.push(t);
  };

  useEffect(() => {
    runSequence(schedule, setStage);
    return () => clearAll();
  }, []);

  const isTyping = stage.kind === "typing";
  const isChecking = stage.kind === "checking";
  const isResolved = stage.kind === "resolved";
  const isResult = stage.kind === "result";

  const activeIndex = isChecking || isResolved ? stage.index : -1;
  const activeRegion = activeIndex >= 0 ? REGIONS[activeIndex] : null;
  const isTimeout = isResolved && activeRegion?.latency === null;

  const okCount = REGIONS.filter((r) => r.latency !== null).length;
  const avgMs = Math.round(
    REGIONS.filter((r) => r.latency !== null).reduce(
      (s, r) => s + (r.latency ?? 0),
      0,
    ) / okCount,
  );

  return (
    <div className="max-w-xl mx-auto">
      <div className="ring-1 ring-border/50 bg-background">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1 min-w-0 flex items-center h-5 relative overflow-hidden">
            <SlideIn active={isTyping}>
              <div className="flex items-center gap-1 font-mono text-sm">
                <span className="text-muted-foreground/50">https://</span>
                <span className="text-foreground">
                  {isTyping ? stage.text : QUERY}
                </span>
                {isTyping && (
                  <span className="inline-block w-0.5 h-3.5 bg-foreground animate-pulse" />
                )}
              </div>
            </SlideIn>

            {isChecking && (
              <SlideIn key={`checking-${stage.index}`} active={true}>
                <div className="flex items-center gap-2.5">
                  <Spinner />
                  <span className="text-sm text-muted-foreground">
                    {activeRegion?.label}
                  </span>
                </div>
              </SlideIn>
            )}

            {isResolved && (
              <SlideIn key={`resolved-${stage.index}`} active={true}>
                <div className="flex items-center gap-2.5">
                  <span
                    className={`size-1.5 rounded-full ${isTimeout ? "bg-orange-700" : "bg-green-700"}`}
                  />
                  <span className="text-sm text-muted-foreground">
                    {activeRegion?.label}
                  </span>
                  <span
                    className={`text-xs font-mono ${isTimeout ? "text-orange-700 dark:text-orange-500" : "text-muted-foreground"}`}
                  >
                    {isTimeout ? "timeout" : `${activeRegion?.latency}ms`}
                  </span>
                </div>
              </SlideIn>
            )}

            <SlideIn active={isResult}>
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-green-700 animate-pulse" />
                <span className="text-xs text-green-700 dark:text-green-500 font-mono">
                  {okCount}/{REGIONS.length} OK
                </span>
                <span className="text-xs text-red-700 dark:text-orange-500 font-mono">
                  · 1 timeout
                </span>
                <span className="text-xs text-muted-foreground/50 font-mono">
                  · avg {avgMs}ms
                </span>
              </div>
            </SlideIn>
          </div>

          <motion.span
            animate={{
              opacity: isTyping
                ? stage.text.length < QUERY.length
                  ? 0.3
                  : 1
                : 0,
              x: isTyping ? 0 : 8,
            }}
            transition={{ duration: 0.3, ease: EASE }}
            className="shrink-0 text-xs px-3 py-1 bg-foreground text-background font-mono"
          >
            Check
          </motion.span>
        </div>
      </div>

      <motion.a
        animate={{ opacity: isResult ? 1 : 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: 0.2 }}
        href="/blog/how-we-run-uplight"
        className="block text-center text-xs hover:underline underline-offset-4 transition-colors font-mono mt-6"
      >
        How we run global monitoring
      </motion.a>
    </div>
  );
}
