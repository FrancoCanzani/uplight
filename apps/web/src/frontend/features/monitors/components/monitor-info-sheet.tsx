import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn, formatDate } from "@lib/utils";
import { format, parseISO } from "date-fns";
import { Info } from "lucide-react";
import type { MonitorResponse } from "../schemas";
import getLocationLabel from "../utils/get-location-label";
import { getSelectedOptions } from "../utils/get-selected-options";
import { getSslStatus } from "../utils/get-ssl-status";
import { getWhoisStatus } from "../utils/get-whois-status";

export default function MonitorInfoSheet({
  monitor,
}: {
  monitor: MonitorResponse;
}) {
  const locations: string[] = JSON.parse(monitor.locations);
  const expectedStatusCodes: number[] = monitor.expectedStatusCodes
    ? JSON.parse(monitor.expectedStatusCodes)
    : [];

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="outline" size={"xs"}>
            <Info className="size-3" />
            Info
          </Button>
        }
      />
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{monitor.name}</SheetTitle>
          <SheetDescription>Monitor configuration details</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Section title="General">
            <ConfigItem label="Type" value={monitor.type.toUpperCase()} />
            <ConfigItem
              label="Status"
              value={
                <Badge variant={"outline"} className={"capitalize"}>
                  {monitor.status}
                </Badge>
              }
            />
            <ConfigItem
              label="Interval"
              value={`${monitor.interval / 1000}s`}
            />
            <ConfigItem label="Timeout" value={`${monitor.timeout}s`} />
          </Section>

          {monitor.type === "http" && (
            <Section title="HTTP Settings">
              <ConfigItem label="URL" value={monitor.url} mono />
              <ConfigItem
                label="Method"
                value={monitor.method?.toUpperCase()}
              />
              <ConfigItem
                label="Follow Redirects"
                value={monitor.followRedirects ? "Yes" : "No"}
              />
              <ConfigItem
                label="Verify SSL"
                value={monitor.verifySSL ? "Yes" : "No"}
              />
              <ConfigItem
                label="Check DNS"
                value={monitor.checkDNS ? "Yes" : "No"}
              />
              <ConfigItem
                label="Check Domain"
                value={monitor.checkDomain ? "Yes" : "No"}
              />
              {expectedStatusCodes.length > 0 && (
                <ConfigItem
                  label="Expected Status"
                  value={getSelectedOptions(expectedStatusCodes).join(", ")}
                  mono
                />
              )}
              {monitor.username && (
                <ConfigItem label="Auth" value="Basic Auth configured" />
              )}
            </Section>
          )}

          {monitor.type === "tcp" && (
            <Section title="TCP Settings">
              <ConfigItem label="Host" value={monitor.host} mono />
              <ConfigItem label="Port" value={monitor.port?.toString()} mono />
            </Section>
          )}

          <Section title="Locations">
            <div className="flex flex-wrap gap-1.5">
              {locations.map((loc) => (
                <Badge key={loc} variant="secondary">
                  {getLocationLabel(loc)}
                </Badge>
              ))}
            </div>
          </Section>

          {monitor.domainCheck && (
            <Section title="Domain Check">
              <ConfigItem
                label="Domain"
                value={monitor.domainCheck.domain}
                mono
              />
              {monitor.domainCheck.whoisRegistrar && (
                <ConfigItem
                  label="Registrar"
                  value={monitor.domainCheck.whoisRegistrar}
                />
              )}
              {monitor.domainCheck.whoisExpirationDate && (
                <ConfigItem
                  label="Expires"
                  value={format(
                    parseISO(monitor.domainCheck.whoisExpirationDate),
                    "MMM d, yyyy h:mm a"
                  )}
                />
              )}
              {(() => {
                const whoisStatus = getWhoisStatus(monitor.domainCheck);
                return (
                  <ConfigItem
                    label="WHOIS Status"
                    value={
                      <Badge
                        variant={"outline"}
                        className={cn(
                          "capitalize",

                          whoisStatus.status === "ok"
                            ? "text-green-700"
                            : whoisStatus.status === "warn"
                              ? "text-amber-400"
                              : "text-destructive"
                        )}
                      >
                        {whoisStatus.status === "ok"
                          ? "OK"
                          : whoisStatus.status === "warn"
                            ? "WARN"
                            : "ERROR"}
                      </Badge>
                    }
                  />
                );
              })()}
              {monitor.domainCheck.sslIssuer && (
                <ConfigItem
                  label="SSL Issuer"
                  value={monitor.domainCheck.sslIssuer}
                />
              )}
              {monitor.domainCheck.sslExpiry && (
                <ConfigItem
                  label="SSL Expires"
                  value={format(
                    new Date(monitor.domainCheck.sslExpiry),
                    "MMM d, yyyy h:mm a"
                  )}
                />
              )}
              {(() => {
                const sslStatus = getSslStatus(monitor.domainCheck);
                return (
                  <ConfigItem
                    label="SSL Status"
                    value={
                      <Badge
                        variant={"outline"}
                        className={cn(
                          "capitalize",

                          sslStatus.status === "ok"
                            ? "text-green-700"
                            : sslStatus.status === "warn"
                              ? "text-amber-400"
                              : "text-destructive"
                        )}
                      >
                        {sslStatus.status === "ok"
                          ? "OK"
                          : sslStatus.status === "warn"
                            ? "WARN"
                            : "ERROR"}
                      </Badge>
                    }
                  />
                );
              })()}
              <ConfigItem
                label="Last Checked"
                value={format(
                  new Date(monitor.domainCheck.checkedAt),
                  "MMM d, yyyy h:mm a"
                )}
              />
            </Section>
          )}

          <Section title="Timestamps">
            <ConfigItem
              label="Created"
              value={formatDate(new Date(monitor.createdAt).getTime())}
            />
            <ConfigItem
              label="Updated"
              value={formatDate(new Date(monitor.updatedAt).getTime())}
            />
          </Section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium capitalize tracking-wider">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function ConfigItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  if (!value) return null;

  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span
        className={`text-right ${mono ? "font-mono text-[11px]" : ""} break-all`}
      >
        {value}
      </span>
    </div>
  );
}
