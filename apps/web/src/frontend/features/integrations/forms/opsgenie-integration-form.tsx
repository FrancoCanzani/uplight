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
import type { Integration, OpsgenieFormInput } from "../schemas";
import { OpsgenieFormSchema } from "../schemas";

function getDefaultValues(existing?: Integration): OpsgenieFormInput {
  if (existing && existing.type === "opsgenie") {
    return {
      type: "opsgenie",
      enabled: existing.enabled,
      apiKey: existing.config.apiKey,
      region: existing.config.region,
      priority: existing.config.priority,
    };
  }

  return {
    type: "opsgenie",
    enabled: false,
    apiKey: "",
    region: "us",
    priority: "P3",
  };
}

export default function OpsgenieIntegrationForm({
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
      onSubmit: OpsgenieFormSchema,
    },
    onSubmit: async ({ value }) => {
      const data = {
        type: "opsgenie" as const,
        enabled: value.enabled,
        config: {
          apiKey: value.apiKey,
          region: value.region,
          priority: value.priority,
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
            name="apiKey"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>API Key</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Enter your Opsgenie API key"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Found in Opsgenie under Settings → API key management
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="region"
            children={(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Region</FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">US (api.opsgenie.com)</SelectItem>
                    <SelectItem value="eu">EU (api.eu.opsgenie.com)</SelectItem>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Select your Opsgenie instance region
                </FieldDescription>
              </Field>
            )}
          />

          <form.Field
            name="priority"
            children={(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Default Priority</FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="P1">P1 - Critical</SelectItem>
                    <SelectItem value="P2">P2 - High</SelectItem>
                    <SelectItem value="P3">P3 - Moderate</SelectItem>
                    <SelectItem value="P4">P4 - Low</SelectItem>
                    <SelectItem value="P5">P5 - Informational</SelectItem>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Priority level for created alerts
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
