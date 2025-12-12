import { STATUS_CODE_OPTIONS } from "../constants";

export function expandStatusCodes(selectedValues: string[]): number[] {
  const codes = new Set<number>();
  for (const value of selectedValues) {
    const option = STATUS_CODE_OPTIONS.find((opt) => opt.value === value);
    if (option) {
      option.codes.forEach((code) => codes.add(code));
    }
  }
  return Array.from(codes).sort((a, b) => a - b);
}

