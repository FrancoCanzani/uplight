export default function calculatePercentiles(
  values: number[],
  percentiles: number[] = [50, 75, 95, 99],
): Record<number, number> {
  if (values.length === 0) {
    return percentiles.reduce((acc, p) => ({ ...acc, [p]: 0 }), {});
  }

  const sorted = [...values].sort((a, b) => a - b);
  const result: Record<number, number> = {};

  for (const percentile of percentiles) {
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;

    if (lower === upper) {
      result[percentile] = Math.round(sorted[lower]);
    } else {
      result[percentile] = Math.round(
        sorted[lower] * (1 - weight) + sorted[upper] * weight,
      );
    }
  }

  return result;
}
