import { GRACE_PERIODS } from "../constants";

export function formatGracePeriod(seconds: number): string {
  const period = GRACE_PERIODS.find((p) => p.value === seconds);
  return period?.label ?? `${seconds}s`;
}
