import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { Lock } from "lucide-react";
import { MonitorResponse } from "../schemas";
import { getSslStatus } from "../utils/get-ssl-status";
import { getWhoisStatus } from "../utils/get-whois-status";

export default function MonitorDomainInfo({
  monitor,
}: {
  monitor: MonitorResponse;
}) {
  if (!monitor.domainCheck) return null;

  const whoisStatus = getWhoisStatus(monitor.domainCheck);
  const sslStatus = getSslStatus(monitor.domainCheck);

  const whoisColor =
    whoisStatus.status === "ok"
      ? "text-green-700"
      : whoisStatus.status === "warn"
        ? "text-amber-400"
        : "text-destructive";

  const sslColor =
    sslStatus.status === "ok"
      ? "text-green-700"
      : sslStatus.status === "warn"
        ? "text-amber-400"
        : "text-destructive";

  return (
    <div className="flex items-center border rounded h-7 px-2 py-1.5 text-xs justify-start gap-x-2">
      <Tooltip>
        <TooltipTrigger className={"flex items-center justify-start gap-x-1.5"}>
          <Lock className={cn("size-3", sslColor)} />
          Secure
        </TooltipTrigger>

        <TooltipContent className={"max-w-64 font-mono"}>
          <div className="space-y-0.5">
            <p className="font-medium">SSL Certificate</p>
            {monitor.domainCheck.sslIssuer && (
              <p className="text-xs">Issuer: {monitor.domainCheck.sslIssuer}</p>
            )}
            {monitor.domainCheck.sslExpiry && (
              <p className="text-xs">
                Expires:{" "}
                {format(
                  new Date(monitor.domainCheck.sslExpiry),
                  "MMM d, yyyy h:mm a",
                )}
              </p>
            )}
            {monitor.domainCheck.sslIsSelfSigned && (
              <p className="text-xs">Self-signed: Yes</p>
            )}
            {"message" in sslStatus && sslStatus.message && (
              <p className="text-xs text-muted-foreground">
                {sslStatus.message}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
      <Separator orientation="vertical" />
      <Tooltip>
        <TooltipTrigger className={whoisColor}>{monitor.url}</TooltipTrigger>
        <TooltipContent className={"max-w-64 font-mono"}>
          <div className="space-y-0.5">
            <p className="font-medium">Domain: {monitor.domainCheck.domain}</p>
            {monitor.domainCheck.whoisRegistrar && (
              <p className="text-xs">
                Registrar: {monitor.domainCheck.whoisRegistrar}
              </p>
            )}
            {monitor.domainCheck.whoisExpirationDate && (
              <p className="text-xs">
                Expires:{" "}
                {format(
                  parseISO(monitor.domainCheck.whoisExpirationDate),
                  "MMM d, yyyy h:mm a",
                )}
              </p>
            )}
            {"message" in whoisStatus && whoisStatus.message && (
              <p className="text-xs text-muted-foreground">
                {whoisStatus.message}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
