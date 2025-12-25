import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { AlertTriangle, Check, XCircle } from "lucide-react";
import { DomainCheck } from "../schemas";
import { getSslStatus } from "../utils/get-ssl-status";
import { getWhoisStatus } from "../utils/get-whois-status";

export default function MonitorDomainInfo({
  domainCheck,
}: {
  domainCheck: NonNullable<DomainCheck>;
}) {
  if (!domainCheck) return null;

  const whoisStatus = getWhoisStatus(domainCheck);
  const sslStatus = getSslStatus(domainCheck);

  const WhoisIcon =
    whoisStatus.status === "ok"
      ? Check
      : whoisStatus.status === "warn"
        ? AlertTriangle
        : XCircle;
  const whoisColor =
    whoisStatus.status === "ok"
      ? "text-green-700"
      : whoisStatus.status === "warn"
        ? "text-amber-400"
        : "text-destructive";

  const SslIcon =
    sslStatus.status === "ok"
      ? Check
      : sslStatus.status === "warn"
        ? AlertTriangle
        : XCircle;
  const sslColor =
    sslStatus.status === "ok"
      ? "text-green-700"
      : sslStatus.status === "warn"
        ? "text-amber-400"
        : "text-destructive";

  return (
    <div className="flex items-center justify-start gap-x-2">
      <Tooltip>
        <TooltipTrigger
          render={
            <Badge variant="outline">
              <WhoisIcon className={cn("size-3", whoisColor)} />
              SSL Cert.
            </Badge>
          }
        />
        <TooltipContent className={"max-w-72 font-mono"}>
          <div className="space-y-0.5">
            <p className="font-medium">Domain: {domainCheck.domain}</p>
            {domainCheck.whoisRegistrar && (
              <p className="text-xs">Registrar: {domainCheck.whoisRegistrar}</p>
            )}
            {domainCheck.whoisExpirationDate && (
              <p className="text-xs">
                Expires:{" "}
                {format(
                  parseISO(domainCheck.whoisExpirationDate),
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

      <Tooltip>
        <TooltipTrigger
          render={
            <Badge variant="outline">
              <SslIcon className={cn("size-3", sslColor)} />
              SSL Cert.
            </Badge>
          }
        />
        <TooltipContent className={"max-w-72 font-mono"}>
          <div className="space-y-0.5">
            <p className="font-medium">SSL Certificate</p>
            {domainCheck.sslIssuer && (
              <p className="text-xs">Issuer: {domainCheck.sslIssuer}</p>
            )}
            {domainCheck.sslExpiry && (
              <p className="text-xs">
                Expires:{" "}
                {format(new Date(domainCheck.sslExpiry), "MMM d, yyyy h:mm a")}
              </p>
            )}
            {domainCheck.sslIsSelfSigned && (
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
    </div>
  );
}
