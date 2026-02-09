export function formatStatusCodes(codes: number[]): string {
  if (codes.length === 0) return "";
  if (codes.length === 1) return codes[0].toString();
  if (codes.length === 2) return codes.join(" or ");

  const ranges: string[] = [];
  let rangeStart = codes[0];
  let rangeEnd = codes[0];

  for (let i = 1; i < codes.length; i++) {
    if (codes[i] === rangeEnd + 1) {
      rangeEnd = codes[i];
    } else {
      if (rangeStart === rangeEnd) {
        ranges.push(rangeStart.toString());
      } else if (rangeEnd === rangeStart + 1) {
        ranges.push(`${rangeStart} or ${rangeEnd}`);
      } else {
        ranges.push(`${rangeStart}-${rangeEnd}`);
      }
      rangeStart = codes[i];
      rangeEnd = codes[i];
    }
  }

  if (rangeStart === rangeEnd) {
    ranges.push(rangeStart.toString());
  } else if (rangeEnd === rangeStart + 1) {
    ranges.push(`${rangeStart} or ${rangeEnd}`);
  } else {
    ranges.push(`${rangeStart}-${rangeEnd}`);
  }

  if (ranges.length === 1) return ranges[0];
  return ranges.slice(0, -1).join(", ") + " or " + ranges[ranges.length - 1];
}

export function formatErrorMessage(message: string | null): string {
  if (!message) return "";

  const statusCodesMatch = message.match(
    /Expected status (\d+(?:, \d+)*), got (\d+)/,
  );
  if (statusCodesMatch) {
    const codes = statusCodesMatch[1].split(", ").map(Number);
    const got = statusCodesMatch[2];
    return `Expected ${formatStatusCodes(codes)}, got ${got}`;
  }

  return message;
}
