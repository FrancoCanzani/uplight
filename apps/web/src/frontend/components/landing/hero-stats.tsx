"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "motion/react";

interface StatItemProps {
  value: string;
  label: string;
  suffix?: string;
  prefix?: string;
  delay?: number;
  skipAnimation?: boolean;
}

function StatItem({ value, label, suffix = "", prefix = "", delay = 0, skipAnimation = false }: StatItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(skipAnimation ? value : "0");

  useEffect(() => {
    if (!isInView || skipAnimation) return;

    const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
    const hasDecimal = value.includes(".");
    const duration = 1500;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numericValue * eased;

      if (hasDecimal) {
        setDisplayValue(current.toFixed(1));
      } else {
        setDisplayValue(Math.floor(current).toString());
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const timeout = setTimeout(() => {
      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timeout);
  }, [isInView, value, delay, skipAnimation]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className="text-center px-6 py-4"
    >
      <div className="font-editorial text-3xl sm:text-4xl tracking-editorial mb-1">
        {prefix}
        {displayValue}
        {suffix}
      </div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
    </motion.div>
  );
}

export function HeroStats() {
  const stats = [
    { value: "9", label: "Global Regions", suffix: "+" },
    { value: "1", label: "Minute Intervals", suffix: " min" },
    { value: "100", label: "Open Source", suffix: "%" },
    { value: "1", label: "Click Deploy", suffix: "-click", skipAnimation: true },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border/50 ring-1 ring-border/50">
        {stats.map((stat, i) => (
          <StatItem
            key={stat.label}
            value={stat.value}
            label={stat.label}
            suffix={stat.suffix}
            delay={i * 150}
            skipAnimation={"skipAnimation" in stat ? stat.skipAnimation : false}
          />
        ))}
      </div>
    </div>
  );
}
