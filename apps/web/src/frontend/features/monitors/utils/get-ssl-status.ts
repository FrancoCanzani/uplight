import { differenceInDays } from "date-fns";
import type { DomainCheck } from "../schemas";
import type { StatusResult } from "./get-whois-status";

export type { StatusResult };

export function getSslStatus(domainCheck: DomainCheck | null): StatusResult {
  if (!domainCheck) {
    return { status: "error", message: "No domain check available" };
  }

  if (domainCheck.sslError) {
    return { status: "error", message: domainCheck.sslError };
  }

  if (domainCheck.sslExpiry) {
    const expiryDate = new Date(domainCheck.sslExpiry);
    const daysUntilExpiration = differenceInDays(expiryDate, new Date());

    if (daysUntilExpiration < 0) {
      return { status: "error", message: "SSL certificate has expired" };
    }

    if (daysUntilExpiration <= 30) {
      return {
        status: "warn",
        message: `SSL certificate expires in ${daysUntilExpiration} day${daysUntilExpiration === 1 ? "" : "s"}`,
      };
    }
  }

  if (domainCheck.sslIsSelfSigned) {
    return { status: "warn", message: "Self-signed certificate" };
  }

  return { status: "ok" };
}
