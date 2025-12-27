import { STATUS_CODE_OPTIONS } from "../constants";

export function getSelectedOptions(codes: number[]): string[] {
  const selected = new Set<string>();
  const coveredCodes = new Set<number>();

  // First, check ranges (they come first in STATUS_CODE_OPTIONS)
  // If a range is fully matched, add it and mark all its codes as covered
  for (const option of STATUS_CODE_OPTIONS) {
    if (option.type === "range") {
      if (option.codes.every((code) => codes.includes(code))) {
        selected.add(option.value);
        // Mark all codes in this range as covered
        option.codes.forEach((code) => coveredCodes.add(code));
      }
    }
  }

  // Then, only add individual codes that weren't covered by a range
  for (const option of STATUS_CODE_OPTIONS) {
    if (option.type === "code") {
      const code = option.codes[0];
      if (codes.includes(code) && !coveredCodes.has(code)) {
        selected.add(option.value);
      }
    }
  }

  return Array.from(selected).sort((a, b) => {
    // Sort ranges first, then individual codes
    const aIsRange = a.endsWith("xx");
    const bIsRange = b.endsWith("xx");
    if (aIsRange && !bIsRange) return -1;
    if (!aIsRange && bIsRange) return 1;
    return a.localeCompare(b);
  });
}
