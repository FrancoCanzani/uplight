import { parseISO, differenceInDays } from "date-fns";
import type { DomainCheck } from "../schemas";

export type StatusResult =
  | { status: "ok" }
  | { status: "warn"; message?: string }
  | { status: "error"; message: string };

export function getWhoisStatus(domainCheck: DomainCheck | null): StatusResult {
  if (!domainCheck) {
    return { status: "error", message: "No domain check available" };
  }

  if (domainCheck.whoisError) {
    return { status: "error", message: domainCheck.whoisError };
  }

  if (domainCheck.whoisExpirationDate) {
    try {
      const expirationDate = parseISO(domainCheck.whoisExpirationDate);
      const daysUntilExpiration = differenceInDays(expirationDate, new Date());

      if (daysUntilExpiration < 0) {
        return { status: "error", message: "Domain has expired" };
      }

      if (daysUntilExpiration <= 30) {
        return {
          status: "warn",
          message: `Domain expires in ${daysUntilExpiration} day${daysUntilExpiration === 1 ? "" : "s"}`,
        };
      }
    } catch {
      return { status: "warn", message: "Invalid expiration date format" };
    }
  }

  return { status: "ok" };
}
