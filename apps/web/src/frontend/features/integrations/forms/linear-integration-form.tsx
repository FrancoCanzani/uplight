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
import { Switch } from "@/components/ui/switch";
import { useCreateIntegration } from "../api/use-create-integration";
import { useUpdateIntegration } from "../api/use-update-integration";
import type { Integration, LinearFormInput } from "../schemas";
import { LinearFormSchema } from "../schemas";

function getDefaultValues(existing?: Integration): LinearFormInput {
  if (existing && existing.type === "linear") {
    return {
      type: "linear",
      enabled: existing.enabled,
      apiKey: existing.config.apiKey,
      teamId: existing.config.teamId,
      labelIds: existing.config.labelIds?.join(", ") || "",
    };
  }

  return {
    type: "linear",
    enabled: false,
    apiKey: "",
    teamId: "",
    labelIds: "",
  };
}

export default function LinearIntegrationForm({
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
      onSubmit: LinearFormSchema,
    },
    onSubmit: async ({ value }) => {
      const labelIds = value.labelIds
        ? value.labelIds
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

      const data = {
        type: "linear" as const,
        enabled: value.enabled,
        config: {
          apiKey: value.apiKey,
          teamId: value.teamId,
          ...(labelIds && labelIds.length > 0 ? { labelIds } : {}),
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
                    placeholder="lin_api_..."
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Create a personal API key in Linear Settings → API
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="teamId"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Team ID</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Enter your Linear team ID"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Found in team settings or via the Linear API
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="labelIds"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Label IDs (Optional)
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="label-id-1, label-id-2"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Comma-separated label IDs to apply to created issues
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
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
