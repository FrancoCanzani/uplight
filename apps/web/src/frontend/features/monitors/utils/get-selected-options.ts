import { STATUS_CODE_OPTIONS } from "../constants";

export function getSelectedOptions(codes: number[]): string[] {
  const selected = new Set<string>();
  for (const option of STATUS_CODE_OPTIONS) {
    if (option.codes.every((code) => codes.includes(code))) {
      selected.add(option.value);
    }
  }
  return Array.from(selected);
}

