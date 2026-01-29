import { useForm } from "@tanstack/react-form";
import { useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateIntegration } from "../api/use-create-integration";
import { useUpdateIntegration } from "../api/use-update-integration";
import type { Integration, PagerDutyFormInput } from "../schemas";
import { PagerDutyFormSchema } from "../schemas";

function getDefaultValues(existing?: Integration): PagerDutyFormInput {
  if (existing && existing.type === "pagerduty") {
    return {
      type: "pagerduty",
      enabled: existing.enabled,
      routingKey: existing.config.routingKey,
      severity: existing.config.severity,
    };
  }

  return {
    type: "pagerduty",
    enabled: false,
    routingKey: "",
    severity: "error",
  };
}

export default function PagerDutyIntegrationForm({
  existing,
  onClose,
}: {
  existing?: Integration;
  onClose?: () => void;
}) {
  const { teamId } = useParams({
    from: "/(dashboard)/$teamId/integrations/",
  });
  const createMutation = useCreateIntegration();
  const updateMutation = useUpdateIntegration();

  const form = useForm({
    defaultValues: getDefaultValues(existing),
    validators: {
      onSubmit: PagerDutyFormSchema,
    },
    onSubmit: async ({ value }) => {
      const data = {
        type: "pagerduty" as const,
        enabled: value.enabled,
        config: {
          routingKey: value.routingKey,
          severity: value.severity,
        },
      };

      if (existing) {
        updateMutation.mutate(
          { teamId, integrationId: existing.id, data },
          { onSuccess: onClose }
        );
      } else {
        createMutation.mutate({ teamId, data }, { onSuccess: onClose });
      }
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="h-full"
    >
      <FieldGroup className="space-y-4 flex flex-col justify-between h-full">
        <div className="space-y-4">
          <form.Field
            name="enabled"
            children={(field) => (
              <Field>
                <div className="flex items-center justify-between">
                  <div>
                    <FieldLabel htmlFor={field.name}>Enabled</FieldLabel>
                    <FieldDescription>
                      Enable or disable this integration
                    </FieldDescription>
                  </div>
                  <Switch
                    id={field.name}
                    checked={field.state.value ?? false}
                    onCheckedChange={field.handleChange}
                  />
                </div>
              </Field>
            )}
          />

          <form.Field
            name="routingKey"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Routing Key</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Enter your PagerDuty routing key"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Found in PagerDuty under Services → Service → Integrations
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="severity"
            children={(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Default Severity</FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Severity level for triggered incidents
                </FieldDescription>
              </Field>
            )}
          />
        </div>
        <div className="flex justify-end w-full gap-2 pt-2">
          {onClose && (
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" size="xs" disabled={isPending}>
            {isPending
              ? existing
                ? "Updating..."
                : "Creating..."
              : existing
                ? "Update"
                : "Create"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
