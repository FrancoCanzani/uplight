import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import {
  HttpMonitorSchema,
  type HttpMonitorInput,
  type Location,
} from "../schemas";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const LOCATIONS: { id: Location; label: string }[] = [
  { id: "wnam", label: "Western North America" },
  { id: "enam", label: "Eastern North America" },
  { id: "sam", label: "South America" },
  { id: "weur", label: "Western Europe" },
  { id: "eeur", label: "Eastern Europe" },
  { id: "apac", label: "Asia Pacific" },
  { id: "oc", label: "Oceania" },
  { id: "afr", label: "Africa" },
  { id: "me", label: "Middle East" },
];

const HTTP_METHODS = [
  "get",
  "post",
  "head",
  "put",
  "patch",
  "delete",
  "options",
] as const;

type HttpMethod = (typeof HTTP_METHODS)[number];

const INTERVALS = [
  { value: 30, label: "30 seconds" },
  { value: 60, label: "1 minute" },
  { value: 300, label: "5 minutes" },
  { value: 600, label: "10 minutes" },
  { value: 900, label: "15 minutes" },
  { value: 1800, label: "30 minutes" },
];

const defaultValues: HttpMonitorInput = {
  type: "http",
  name: "",
  url: "",
  method: "get",
  interval: 60,
  timeout: 30,
  locations: [],
  headers: {},
  body: "",
  username: "",
  password: "",
  expectedStatusCodes: [200],
  followRedirects: true,
  verifySSL: true,
  contentCheck: undefined,
};

export function NewHttpMonitorForm() {
  const [contentCheckEnabled, setContentCheckEnabled] = useState(false);

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: HttpMonitorSchema,
    },
    onSubmit: async ({ value }) => {
      console.log("HTTP Monitor:", value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
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
                  placeholder="My API Monitor"
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
                  The URL to monitor. Must start with http:// or https://
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

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
                      className="w-full"
                    >
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {HTTP_METHODS.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method.toUpperCase()}
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
            name="interval"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
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
                      <SelectValue placeholder="Select interval" />
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
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    aria-invalid={isInvalid}
                  />
                  <FieldDescription>1-60 seconds</FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="expectedStatusCodes"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Expected Status Codes
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value?.join(", ") ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const codes = e.target.value
                        .split(",")
                        .map((s) => parseInt(s.trim(), 10))
                        .filter((n) => !isNaN(n));
                      field.handleChange(codes);
                    }}
                    aria-invalid={isInvalid}
                    placeholder="200, 201, 204"
                  />
                  <FieldDescription>
                    Comma-separated status codes considered successful
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
        </div>

        <form.Field
          name="locations"
          mode="array"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <FieldSet>
                <FieldLegend variant="label">Monitoring Locations</FieldLegend>
                <FieldDescription>
                  Select at least one region to monitor from.
                </FieldDescription>
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
                              const index = field.state.value.indexOf(
                                location.id
                              );
                              if (index > -1) {
                                field.removeValue(index);
                              }
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
        </div>

        <form.Field
          name="body"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Request Body</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder='{"key": "value"}'
                  className="min-h-[100px] font-mono text-sm"
                />
                <FieldDescription>
                  Optional JSON body for POST/PUT/PATCH requests
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Authentication</CardTitle>
            <CardDescription>
              Optional HTTP Basic Authentication credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Content Check</CardTitle>
                <CardDescription>
                  Alert based on response content matching
                </CardDescription>
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
          </CardHeader>
          {contentCheckEnabled && (
            <CardContent>
              <FieldGroup>
                <form.Field
                  name="contentCheck.mode"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <FieldSet>
                        <FieldLegend variant="label">
                          Alert Condition
                        </FieldLegend>
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
              </FieldGroup>
            </CardContent>
          )}
        </Card>

        <div className="flex gap-3 pt-4">
          <Button type="submit">Create Monitor</Button>
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
