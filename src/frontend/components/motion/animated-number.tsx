import { useMotionValue, useMotionValueEvent, useSpring } from "motion/react";
import { useEffect, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  suffix?: string;
}

export default function AnimatedNumber({
  value,
  decimals = 0,
  suffix = "",
}: AnimatedNumberProps) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    stiffness: 100,
    damping: 20,
    mass: 1,
  });
  const [display, setDisplay] = useState((0).toFixed(decimals));

  useMotionValueEvent(spring, "change", (v) => setDisplay(v.toFixed(decimals)));

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return (
    <span className="tabular-nums font-mono font-light">
      {display}
      {suffix}
    </span>
  );
}
