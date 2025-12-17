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
import type { MonitorResponse } from "../schemas";
import getLocationLabel from "../utils/get-location-label";
import getStatusColor from "../utils/get-status-color";

export default function MonitorConfigSheet({
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
            Info
          </Button>
        }
      />
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{monitor.name}</SheetTitle>
          <SheetDescription>Monitor configuration details</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <Section title="General">
            <ConfigItem label="Type" value={monitor.type.toUpperCase()} />
            <ConfigItem
              label="Status"
              value={
                <Badge
                  className={cn("capitalize", getStatusColor(monitor.status))}
                >
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
              {expectedStatusCodes.length > 0 && (
                <ConfigItem
                  label="Expected Status"
                  value={expectedStatusCodes.join(", ")}
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

          <Section title="Timestamps">
            <ConfigItem label="Created" value={formatDate(monitor.createdAt)} />
            <ConfigItem label="Updated" value={formatDate(monitor.updatedAt)} />
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
      <h3 className="text-xs font-medium text-muted-foreground capitalize tracking-wider">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
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
