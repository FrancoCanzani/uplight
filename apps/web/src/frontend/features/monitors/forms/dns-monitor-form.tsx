import { useForm } from "@tanstack/react-form";
import { useParams } from "@tanstack/react-router";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useCreateMonitor } from "../api/use-create-monitor";
import { useUpdateMonitor } from "../api/use-update-monitor";
import { INTERVALS, LOCATIONS } from "../constants";
import {
  DnsMonitorSchema,
  type DnsMonitorInput,
  type MonitorResponse,
} from "../schemas";

const DNS_RECORD_TYPES = ["A", "AAAA", "CNAME", "MX", "TXT", "NS"] as const;

type DnsAssertion = DnsMonitorInput["assertions"][number];

function parseDnsRecordTypes(value: string | null): DnsAssertion["recordType"][] {
  if (!value) return ["A"];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      const filtered = parsed.filter(
        (item): item is DnsAssertion["recordType"] =>
          DNS_RECORD_TYPES.includes(item as DnsAssertion["recordType"]),
      );
      if (filtered.length > 0) return filtered;
    }
  } catch {
    if (DNS_RECORD_TYPES.includes(value as DnsAssertion["recordType"])) {
      return [value as DnsAssertion["recordType"]];
    }
  }

  return ["A"];
}

function parseDnsAssertions(monitor: MonitorResponse): DnsAssertion[] {
  if (monitor.dnsExpectedValue) {
    try {
      const parsed = JSON.parse(monitor.dnsExpectedValue);
      if (Array.isArray(parsed)) {
        const assertions = parsed
          .filter(
            (item): item is DnsAssertion =>
              !!item &&
              typeof item === "object" &&
              DNS_RECORD_TYPES.includes(item.recordType as DnsAssertion["recordType"]) &&
              typeof item.value === "string" &&
              item.value.trim().length > 0,
          )
          .map((item) => ({
            recordType: item.recordType as DnsAssertion["recordType"],
            value: item.value.trim(),
          }));

        if (assertions.length > 0) {
          return assertions;
        }
      }
    } catch {
      // Fallback for older single-value format.
    }
  }

  const fallbackValue = monitor.dnsExpectedValue?.trim() ?? "";
  const recordTypes = parseDnsRecordTypes(monitor.dnsRecordType);

  return recordTypes.map((recordType) => ({
    recordType,
    value: fallbackValue,
  }));
}

const emptyValues: DnsMonitorInput = {
  type: "dns",
  name: "",
  host: "",
  assertions: [{ recordType: "A", value: "" }],
  interval: 60000,
  timeout: 30,
  responseTimeThreshold: undefined,
  locations: [],
};

function monitorToFormValues(monitor: MonitorResponse): DnsMonitorInput {
  const locations = monitor.locations ? JSON.parse(monitor.locations) : [];
  const assertions = parseDnsAssertions(monitor);

  return {
    type: "dns",
    name: monitor.name,
    host: monitor.host ?? "",
    assertions:
      assertions.length > 0
        ? assertions
        : [{ recordType: "A", value: "" }],
    interval: monitor.interval,
    timeout: monitor.timeout,
    responseTimeThreshold: monitor.responseTimeThreshold ?? undefined,
    locations,
  };
}

export function DnsMonitorForm({ monitor }: { monitor?: MonitorResponse }) {
  const { teamId } = useParams({ from: "/(dashboard)/$teamId" });
  const isEditing = !!monitor;
  const defaultValues = monitor ? monitorToFormValues(monitor) : emptyValues;
  const createMonitor = useCreateMonitor();
  const updateMonitor = useUpdateMonitor();
  const isPending = isEditing
    ? updateMonitor.isPending
    : createMonitor.isPending;

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: DnsMonitorSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = DnsMonitorSchema.parse({
        ...value,
        assertions: value.assertions.map((assertion) => ({
          recordType: assertion.recordType,
          value: assertion.value.trim(),
        })),
      });

      if (isEditing) {
        updateMonitor.mutate({
          teamId: Number(teamId),
          monitorId: monitor.id,
          data: parsed,
        });
      } else {
        createMonitor.mutate({ teamId: Number(teamId), data: parsed });
      }
    },
  });

  return (
    <form
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <FieldLabel>Basic Information</FieldLabel>
            <FieldDescription>
              Monitor DNS records and validate each expected value.
            </FieldDescription>
          </div>

          <form.Field
            name="name"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Monitor Name</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="DNS Assertions"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="host"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Domain</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="example.com"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Domain name to resolve via DNS.
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <div>
            <FieldLabel>Assertions</FieldLabel>
            <FieldDescription>
              Add one or more record assertions (Record + Target value).
            </FieldDescription>
          </div>

          <form.Field
            name="assertions"
            children={(field) => {
              const assertions = field.state.value;
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <FieldSet data-invalid={isInvalid}>
                  <FieldGroup className="space-y-3">
                    {assertions.map((assertion, index) => (
                      <div
                        key={`${assertion.recordType}-${index}`}
                        className="grid gap-3 sm:grid-cols-[160px_1fr_auto]"
                      >
                        <Select
                          value={assertion.recordType}
                          onValueChange={(value) => {
                            const next = [...assertions];
                            next[index] = {
                              ...next[index],
                              recordType: value as DnsAssertion["recordType"],
                            };
                            field.handleChange(next);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DNS_RECORD_TYPES.map((recordType) => (
                              <SelectItem key={recordType} value={recordType}>
                                {recordType}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Input
                          value={assertion.value}
                          onChange={(e) => {
                            const next = [...assertions];
                            next[index] = {
                              ...next[index],
                              value: e.target.value,
                            };
                            field.handleChange(next);
                          }}
                          placeholder="Target value"
                          autoComplete="off"
                        />

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (assertions.length <= 1) return;
                            field.handleChange(
                              assertions.filter((_, i) => i !== index),
                            );
                          }}
                          disabled={assertions.length <= 1}
                          aria-label="Remove assertion"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </FieldGroup>

                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    className="mt-3"
                    onClick={() => {
                      field.handleChange([
                        ...assertions,
                        { recordType: "A", value: "" },
                      ]);
                    }}
                  >
                    Add Assertion
                  </Button>

                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </FieldSet>
              );
            }}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <div>
            <FieldLabel>Check Configuration</FieldLabel>
            <FieldDescription>
              Configure frequency, timeout, and monitoring locations.
            </FieldDescription>
          </div>

          <div className="grid gap-7 sm:grid-cols-2">
            <form.Field
              name="interval"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                const selectedInterval = INTERVALS.find(
                  (interval) => interval.value === field.state.value,
                );
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Check Interval</FieldLabel>
                    <Select
                      name={field.name}
                      value={String(field.state.value)}
                      onValueChange={(v) => field.handleChange(Number(v))}
                    >
                      <SelectTrigger
                        id={field.name}
                        aria-invalid={isInvalid}
                        className="w-full"
                      >
                        <SelectValue>
                          {selectedInterval?.label || "Select interval"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {INTERVALS.map((interval) => (
                          <SelectItem
                            key={interval.value}
                            value={String(interval.value)}
                          >
                            {interval.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />

            <form.Field
              name="timeout"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Timeout (seconds)</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      min={1}
                      max={30}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      aria-invalid={isInvalid}
                    />
                    <FieldDescription>
                      Maximum DNS query time before timeout.
                    </FieldDescription>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
          </div>

          <div className="grid gap-7 sm:grid-cols-2">
            <form.Field
              name="responseTimeThreshold"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Response Time Threshold (ms)
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      min={1}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.handleChange(value ? Number(value) : undefined);
                      }}
                      aria-invalid={isInvalid}
                      placeholder="Optional"
                    />
                    <FieldDescription>
                      Mark checks as degraded if successful responses exceed this value.
                    </FieldDescription>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
          </div>

          <div>
            <FieldLabel>Monitoring Locations</FieldLabel>
            <FieldDescription>
              Select at least one region to monitor from. Checks will be
              performed from all selected locations.
            </FieldDescription>
          </div>

          <form.Field
            name="locations"
            mode="array"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <FieldSet>
                  <FieldGroup data-slot="checkbox-group">
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                      {LOCATIONS.map((location) => (
                        <Field
                          key={location.id}
                          orientation="horizontal"
                          data-invalid={isInvalid}
                        >
                          <Checkbox
                            id={`dns-location-${location.id}`}
                            name={field.name}
                            aria-invalid={isInvalid}
                            checked={field.state.value.includes(location.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.pushValue(location.id);
                              } else {
                                const currentValue = field.state.value;
                                const newValue = currentValue.filter(
                                  (loc) => loc !== location.id,
                                );
                                field.handleChange(newValue);
                              }
                            }}
                          />
                          <FieldLabel
                            htmlFor={`dns-location-${location.id}`}
                            className="font-normal"
                          >
                            {location.label}
                          </FieldLabel>
                        </Field>
                      ))}
                    </div>
                  </FieldGroup>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </FieldSet>
              );
            }}
          />
        </div>

        <div className="flex justify-end w-full gap-3 pt-4">
          <Button
            type="button"
            variant="destructive"
            size={"xs"}
            onClick={() => form.reset()}
            disabled={isPending}
          >
            Reset
          </Button>
          <Button type="submit" size={"xs"} disabled={isPending}>
            {isPending && <Spinner className="size-3 mr-2" />}
            {isPending
              ? isEditing
                ? "Saving..."
                : "Creating..."
              : isEditing
                ? "Save Changes"
                : "Create Monitor"}
          </Button>
        </div>
      </div>
    </form>
  );
}
