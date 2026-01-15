import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { differenceInDays, format, parseISO } from "date-fns";
import { Globe, Lock } from "lucide-react";
import type { MonitorResponse } from "../schemas";

function getDaysRemaining(date: string | number | null): number | null {
  if (!date) return null;
  const expiry = typeof date === "string" ? parseISO(date) : new Date(date);
  return differenceInDays(expiry, new Date());
}

function getStatusColor(days: number | null): string {
  if (days === null) return "text-muted-foreground";
  if (days < 0) return "text-destructive";
  if (days <= 14) return "text-destructive";
  if (days <= 30) return "text-amber-500";
  return "text-green-600";
}

function getProgressColor(days: number | null): string {
  if (days === null) return "bg-muted";
  if (days < 0) return "bg-destructive";
  if (days <= 14) return "bg-destructive";
  if (days <= 30) return "bg-amber-500";
  return "bg-green-600";
}

function getProgressWidth(days: number | null): number {
  if (days === null || days < 0) return 0;
  const maxDays = 365;
  return Math.min(100, Math.max(5, (days / maxDays) * 100));
}

function formatExpiry(date: string | number | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? parseISO(date) : new Date(date);
  return format(d, "MMM d, yyyy");
}

export default function MonitorDomainInfo({
  monitor,
}: {
  monitor: MonitorResponse;
}) {
  if (!monitor.domainCheck) return null;

  const sslDays = getDaysRemaining(monitor.domainCheck.sslExpiry);
  const domainDays = getDaysRemaining(monitor.domainCheck.whoisExpirationDate);

  const hasSsl = monitor.domainCheck.sslExpiry !== null;
  const hasDomain = monitor.domainCheck.whoisExpirationDate !== null;
  const hasSslError = !!monitor.domainCheck.sslError;
  const hasDomainError = !!monitor.domainCheck.whoisError;

  const showSsl = hasSsl || hasSslError;
  const showDomain = hasDomain || hasDomainError;

  if (!showSsl && !showDomain) return null;

  return (
    <div className="hidden sm:flex items-center gap-2">
      {showSsl && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 border rounded-md px-2.5 py-1.5 cursor-default hover:bg-muted/50 transition-colors">
              <Lock className={cn("size-3", hasSslError ? "text-destructive" : getStatusColor(sslDays))} />
              <div className="flex flex-col gap-0.5">
                <span className="text-muted-foreground text-[10px] leading-none">SSL</span>
                <div className="flex items-center gap-1.5">
                  {hasSslError ? (
                    <span className="text-xs font-medium text-destructive">Error</span>
                  ) : (
                    <>
                      <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", getProgressColor(sslDays))}
                          style={{ width: `${getProgressWidth(sslDays)}%` }}
                        />
                      </div>
                      <span className={cn("text-xs font-medium tabular-nums", getStatusColor(sslDays))}>
                        {sslDays !== null ? (sslDays < 0 ? "Exp" : `${sslDays}d`) : "—"}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            <div className="space-y-1">
              <p className="font-medium">SSL Certificate</p>
              {monitor.domainCheck.sslIssuer && (
                <p className="text-muted-foreground">{monitor.domainCheck.sslIssuer}</p>
              )}
              {hasSsl && <p>Expires {formatExpiry(monitor.domainCheck.sslExpiry)}</p>}
              {monitor.domainCheck.sslIsSelfSigned && (
                <p className="text-amber-500">Self-signed certificate</p>
              )}
              {monitor.domainCheck.sslError && (
                <p className="text-destructive">{monitor.domainCheck.sslError}</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      )}

      {showDomain && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 border rounded-md px-2.5 py-1.5 cursor-default hover:bg-muted/50 transition-colors">
              <Globe className={cn("size-3", hasDomainError ? "text-destructive" : getStatusColor(domainDays))} />
              <div className="flex flex-col gap-0.5">
                <span className="text-muted-foreground text-[10px] leading-none">Domain</span>
                <div className="flex items-center gap-1.5">
                  {hasDomainError ? (
                    <span className="text-xs font-medium text-destructive">Error</span>
                  ) : (
                    <>
                      <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", getProgressColor(domainDays))}
                          style={{ width: `${getProgressWidth(domainDays)}%` }}
                        />
                      </div>
                      <span className={cn("text-xs font-medium tabular-nums", getStatusColor(domainDays))}>
                        {domainDays !== null ? (domainDays < 0 ? "Exp" : `${domainDays}d`) : "—"}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            <div className="space-y-1">
              <p className="font-medium">{monitor.domainCheck.domain}</p>
              {monitor.domainCheck.whoisRegistrar && (
                <p className="text-muted-foreground">{monitor.domainCheck.whoisRegistrar}</p>
              )}
              {hasDomain && <p>Expires {formatExpiry(monitor.domainCheck.whoisExpirationDate)}</p>}
              {monitor.domainCheck.whoisError && (
                <p className="text-destructive">{monitor.domainCheck.whoisError}</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
