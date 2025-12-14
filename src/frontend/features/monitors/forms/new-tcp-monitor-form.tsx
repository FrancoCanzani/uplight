import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "@tanstack/react-form";
import { useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useCreateMonitor } from "../api/use-create-monitor";
import { INTERVALS, LOCATIONS } from "../constants";
import { TcpMonitorSchema, type TcpMonitorInput } from "../schemas";

const defaultValues: TcpMonitorInput = {
  type: "tcp",
  name: "",
  host: "",
  port: 443,
  interval: 60000,
  timeout: 30,
  locations: [],
  contentCheck: undefined,
};

export function NewTcpMonitorForm() {
  const { teamId } = useParams({ from: "/(dashboard)/$teamId" });
  const [contentCheckEnabled, setContentCheckEnabled] = useState(false);
  const createMonitor = useCreateMonitor();

  const form = useForm({
    defaultValues,
    validators: {
      onChange: TcpMonitorSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = TcpMonitorSchema.parse(value);
      createMonitor.mutate({ teamId: Number(teamId), data: parsed });
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
              Provide a name and connection details for your TCP monitor.
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
                    placeholder="Database TCP Check"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    A friendly name to identify this monitor.
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <div className="grid gap-7 sm:grid-cols-2">
            <form.Field
              name="host"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Host</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="db.example.com"
                      autoComplete="off"
                    />
                    <FieldDescription>
                      Hostname or IP address to connect to
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <form.Field
              name="port"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Port</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      min={1}
                      max={65535}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value))
                      }
                      aria-invalid={isInvalid}
                      placeholder="5432"
                    />
                    <FieldDescription>TCP port (1-65535)</FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div>
            <FieldLabel>Check Configuration</FieldLabel>
            <FieldDescription>
              Configure how often and how long to wait for TCP connections.
            </FieldDescription>
          </div>
          <div className="grid gap-7 sm:grid-cols-2">
            <form.Field
              name="interval"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                const selectedInterval = INTERVALS.find(
                  (interval) => interval.value === field.state.value
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
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
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
                    <FieldLabel htmlFor={field.name}>
                      Timeout (seconds)
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      min={1}
                      max={60}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value))
                      }
                      aria-invalid={isInvalid}
                    />
                    <FieldDescription>
                      Maximum time to wait for a connection before considering
                      the check failed.
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
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
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {LOCATIONS.map((location) => (
                        <Field
                          key={location.id}
                          orientation="horizontal"
                          data-invalid={isInvalid}
                        >
                          <Checkbox
                            id={`tcp-location-${location.id}`}
                            name={field.name}
                            aria-invalid={isInvalid}
                            checked={field.state.value.includes(location.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.pushValue(location.id);
                              } else {
                                const currentValue = field.state.value;
                                const newValue = currentValue.filter(
                                  (loc) => loc !== location.id
                                );
                                field.handleChange(newValue);
                              }
                            }}
                          />
                          <FieldLabel
                            htmlFor={`tcp-location-${location.id}`}
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

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <FieldLabel>Content Check</FieldLabel>
              <FieldDescription>
                Optionally alert based on response content matching
              </FieldDescription>
            </div>
            <Switch
              checked={contentCheckEnabled}
              onCheckedChange={(checked) => {
                setContentCheckEnabled(checked);
                if (!checked) {
                  form.setFieldValue("contentCheck", undefined);
                } else {
                  form.setFieldValue("contentCheck", {
                    enabled: true,
                    mode: "contains",
                    content: "",
                  });
                }
              }}
            />
          </div>
          {contentCheckEnabled && (
            <div className="space-y-4">
              <form.Field
                name="contentCheck.mode"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <FieldSet>
                      <FieldLabel>Alert Condition</FieldLabel>
                      <FieldDescription>
                        Choose when to trigger an alert based on content
                        matching
                      </FieldDescription>
                      <RadioGroup
                        value={field.state.value ?? "contains"}
                        onValueChange={(v) =>
                          field.handleChange(v as "contains" | "not_contains")
                        }
                      >
                        <Field
                          orientation="horizontal"
                          data-invalid={isInvalid}
                        >
                          <RadioGroupItem
                            value="contains"
                            id="tcp-content-check-contains"
                            aria-invalid={isInvalid}
                          />
                          <FieldContent>
                            <FieldLabel
                              htmlFor="tcp-content-check-contains"
                              className="font-normal"
                            >
                              Alert if content is found
                            </FieldLabel>
                            <FieldDescription>
                              Trigger alert when the response contains the
                              specified content
                            </FieldDescription>
                          </FieldContent>
                        </Field>
                        <Field
                          orientation="horizontal"
                          data-invalid={isInvalid}
                        >
                          <RadioGroupItem
                            value="not_contains"
                            id="tcp-content-check-not-contains"
                            aria-invalid={isInvalid}
                          />
                          <FieldContent>
                            <FieldLabel
                              htmlFor="tcp-content-check-not-contains"
                              className="font-normal"
                            >
                              Alert if content is NOT found
                            </FieldLabel>
                            <FieldDescription>
                              Trigger alert when the response does not contain
                              the specified content
                            </FieldDescription>
                          </FieldContent>
                        </Field>
                      </RadioGroup>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </FieldSet>
                  );
                }}
              />

              <form.Field
                name="contentCheck.content"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="tcp-content-check-content">
                        Content to Search
                      </FieldLabel>
                      <Textarea
                        id="tcp-content-check-content"
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder='"status": "ok"'
                        className="min-h-[80px] font-mono text-sm"
                      />
                      <FieldDescription>
                        The text to search for in the response body (max 1000
                        characters)
                      </FieldDescription>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
            </div>
          )}
        </div>

        <Separator />

        <div className="flex justify-end w-full gap-3 pt-4">
          <Button
            type="button"
            variant="destructive"
            size={"sm"}
            onClick={() => form.reset()}
            disabled={createMonitor.isPending}
          >
            Reset
          </Button>
          <Button type="submit" size={"sm"} disabled={createMonitor.isPending}>
            {createMonitor.isPending ? "Creating..." : "Create Monitor"}
          </Button>
        </div>
      </div>
    </form>
  );
}
