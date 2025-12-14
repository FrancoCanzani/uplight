import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { cn } from "@lib/utils";
import { useForm } from "@tanstack/react-form";
import { useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useCreateMonitor } from "../api/use-create-monitor";
import {
  HTTP_METHODS,
  INTERVALS,
  LOCATIONS,
  STATUS_CODE_OPTIONS,
  type HttpMethod,
} from "../constants";
import { HttpMonitorSchema, type HttpMonitorInput } from "../schemas";
import { expandStatusCodes } from "../utils/expand-status-codes";
import { getSelectedOptions } from "../utils/get-selected-options";

const defaultValues: HttpMonitorInput = {
  type: "http",
  name: "",
  url: "",
  method: "get",
  interval: 60000,
  timeout: 30,
  locations: [],
  headers: {},
  body: "",
  username: "",
  password: "",
  expectedStatusCodes: [200],
  followRedirects: true,
  verifySSL: true,
  checkDNS: true,
  contentCheck: undefined,
};

export function NewHttpMonitorForm() {
  const { teamId } = useParams({ from: "/(dashboard)/$teamId" });
  const [contentCheckEnabled, setContentCheckEnabled] = useState(false);
  const createMonitor = useCreateMonitor();

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: HttpMonitorSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = HttpMonitorSchema.parse(value);
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
      <FieldGroup className="space-y-6">
        <div className="space-y-4">
          <div>
            <FieldLabel>Basic Information</FieldLabel>
            <FieldDescription>
              Provide a name and URL for the monitor.
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
                    placeholder="My monitor"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="url"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>URL</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="https://api.example.com/health"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    The URL to monitor must start with http:// or https://
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
            <FieldLabel>Request Configuration</FieldLabel>
            <FieldDescription>
              Configure how the HTTP request is made and what responses are
              considered successful.
            </FieldDescription>
          </div>
          <div className="grid gap-7 sm:grid-cols-2">
            <form.Field
              name="method"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>HTTP Method</FieldLabel>
                    <Select
                      name={field.name}
                      value={field.state.value}
                      onValueChange={(v) => field.handleChange(v as HttpMethod)}
                    >
                      <SelectTrigger
                        id={field.name}
                        aria-invalid={isInvalid}
                        className="w-full uppercase"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {HTTP_METHODS.map((method) => (
                          <SelectItem
                            key={method}
                            value={method}
                            className="uppercase"
                          >
                            {method.toUpperCase()}
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
          </div>

          <div className="grid gap-7 sm:grid-cols-2">
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
                      Maximum time to wait for a response before considering the
                      check failed.
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <form.Field
              name="expectedStatusCodes"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                const selectedOptions = getSelectedOptions(
                  field.state.value || []
                );
                const displayText =
                  selectedOptions.length > 0
                    ? selectedOptions.join(", ")
                    : "Select status codes";

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Expected Status Codes
                    </FieldLabel>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger
                          className={cn(
                            "bg-input/20 dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 h-9 rounded-sm border px-2 py-0.5 text-sm transition-colors focus-visible:ring-[2px] aria-invalid:ring-[2px] md:text-xs/relaxed text-left flex-1 min-w-0 outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-between",
                            isInvalid && "aria-invalid"
                          )}
                          aria-invalid={isInvalid}
                        >
                          <span
                            className={cn(
                              displayText === "Select status codes" &&
                                "text-muted-foreground"
                            )}
                          >
                            {displayText}
                          </span>
                          <svg
                            className="h-4 w-4 opacity-50"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                          <div className="max-h-[300px] overflow-y-auto p-2">
                            <FieldGroup>
                              {STATUS_CODE_OPTIONS.map((option) => {
                                const isSelected = selectedOptions.includes(
                                  option.value
                                );
                                return (
                                  <Field
                                    key={option.value}
                                    orientation="horizontal"
                                  >
                                    <Checkbox
                                      id={`status-${option.value}`}
                                      checked={isSelected}
                                      onCheckedChange={(checked) => {
                                        const currentOptions =
                                          getSelectedOptions(
                                            field.state.value || []
                                          );
                                        let newOptions: string[];
                                        if (checked) {
                                          newOptions = [
                                            ...currentOptions,
                                            option.value,
                                          ];
                                        } else {
                                          newOptions = currentOptions.filter(
                                            (v) => v !== option.value
                                          );
                                        }
                                        const newCodes =
                                          expandStatusCodes(newOptions);
                                        field.handleChange(newCodes);
                                      }}
                                    />
                                    <FieldLabel
                                      htmlFor={`status-${option.value}`}
                                      className="font-normal cursor-pointer"
                                    >
                                      {option.label}
                                    </FieldLabel>
                                  </Field>
                                );
                              })}
                            </FieldGroup>
                          </div>
                        </PopoverContent>
                      </Popover>
                      {selectedOptions.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 shrink-0"
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.preventDefault();
                            field.handleChange([]);
                          }}
                          aria-label="Clear selected status codes"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </Button>
                      )}
                    </div>
                    <FieldDescription>
                      Select status codes or ranges considered successful
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
                            id={`http-location-${location.id}`}
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
                            htmlFor={`http-location-${location.id}`}
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
          <div>
            <FieldLabel>Request Options</FieldLabel>
            <FieldDescription>
              Configure SSL verification, redirect handling, and DNS checks.
            </FieldDescription>
          </div>
          <div className="grid gap-7 sm:grid-cols-2">
            <form.Field
              name="followRedirects"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field orientation="horizontal" data-invalid={isInvalid}>
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>
                        Follow Redirects
                      </FieldLabel>
                      <FieldDescription>
                        Automatically follow HTTP redirects
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      id={field.name}
                      name={field.name}
                      checked={field.state.value}
                      onCheckedChange={field.handleChange}
                      aria-invalid={isInvalid}
                    />
                  </Field>
                );
              }}
            />

            <form.Field
              name="verifySSL"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field orientation="horizontal" data-invalid={isInvalid}>
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>Verify SSL</FieldLabel>
                      <FieldDescription>
                        Validate SSL/TLS certificates
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      id={field.name}
                      name={field.name}
                      checked={field.state.value}
                      onCheckedChange={field.handleChange}
                      aria-invalid={isInvalid}
                    />
                  </Field>
                );
              }}
            />

            <form.Field
              name="checkDNS"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field orientation="horizontal" data-invalid={isInvalid}>
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>Check DNS</FieldLabel>
                      <FieldDescription>
                        Verify DNS resolution before making the request
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      id={field.name}
                      name={field.name}
                      checked={field.state.value}
                      onCheckedChange={field.handleChange}
                      aria-invalid={isInvalid}
                    />
                  </Field>
                );
              }}
            />
          </div>
        </div>

        <Separator />

        <form.Field
          name="body"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            const handlePrettify = () => {
              const value = field.state.value?.trim();
              if (!value) return;

              try {
                const parsed = JSON.parse(value);
                const prettified = JSON.stringify(parsed, null, 2);
                field.handleChange(prettified);
              } catch {
                // If it's not valid JSON, do nothing
              }
            };
            return (
              <Field data-invalid={isInvalid}>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor={field.name}>Request Body</FieldLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={handlePrettify}
                    disabled={!field.state.value?.trim()}
                  >
                    Prettify
                  </Button>
                </div>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder='{"key": "value"}'
                  className="min-h-[100px] font-mono text-xs"
                />
                <FieldDescription>
                  Optional JSON body for POST/PUT/PATCH requests
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <FieldLabel>Authentication</FieldLabel>
            <FieldDescription>
              Optional HTTP Basic Authentication credentials
            </FieldDescription>
            <Alert variant="informative">
              <AlertTitle>Credentials are encrypted</AlertTitle>
              <AlertDescription>
                We use AES-GCM before storage and only decrypted when needed for
                monitoring checks. Your credentials are never stored in plain
                text.
              </AlertDescription>
            </Alert>
          </div>
          <div className="grid gap-7 sm:grid-cols-2">
            <form.Field
              name="username"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete="off"
                      placeholder="root:user"
                      className="text-xs"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <form.Field
              name="password"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete="off"
                      placeholder="password"
                      className="text-xs"
                    />
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

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <FieldLabel>Content Check</FieldLabel>
              <FieldDescription>
                Alert based on response content matching
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
            <FieldGroup>
              <form.Field
                name="contentCheck.mode"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <FieldSet>
                      <FieldLegend variant="label">Alert Condition</FieldLegend>
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
                            id="http-content-check-contains"
                            aria-invalid={isInvalid}
                          />
                          <FieldContent>
                            <FieldLabel
                              htmlFor="http-content-check-contains"
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
                            id="http-content-check-not-contains"
                            aria-invalid={isInvalid}
                          />
                          <FieldContent>
                            <FieldLabel
                              htmlFor="http-content-check-not-contains"
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
                      <FieldLabel htmlFor="http-content-check-content">
                        Content to Search
                      </FieldLabel>
                      <Textarea
                        id="http-content-check-content"
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder='"status": "ok"'
                        className="min-h-20 font-mono text-xs"
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
            </FieldGroup>
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
      </FieldGroup>
    </form>
  );
}
