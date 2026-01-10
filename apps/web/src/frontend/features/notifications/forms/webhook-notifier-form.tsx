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
import { useForm } from "@tanstack/react-form";
import { useParams } from "@tanstack/react-router";
import { useCreateNotifier } from "../api/use-create-notifier";
import { useUpdateNotifier } from "../api/use-update-notifier";
import type { Notifier, WebhookFormInput } from "../schemas";
import { WebhookFormSchema } from "../schemas";

function getDefaultValues(existing?: Notifier): WebhookFormInput {
  if (existing && existing.type === "webhook") {
    return {
      type: "webhook",
      enabled: existing.enabled,
      url: existing.config.url,
      method: existing.config.method || "POST",
    };
  }

  return {
    type: "webhook",
    enabled: true,
    url: "",
    method: "POST",
  };
}

export default function WebhookNotifierForm({
  existing,
  onClose,
}: {
  existing?: Notifier;
  onClose?: () => void;
}) {
  const { teamId } = useParams({
    from: "/(dashboard)/$teamId/notifications/",
  });
  const createMutation = useCreateNotifier();
  const updateMutation = useUpdateNotifier();

  const form = useForm({
    defaultValues: getDefaultValues(existing),
    validators: {
      onSubmit: WebhookFormSchema,
    },
    onSubmit: async ({ value }) => {
      const data = {
        type: "webhook" as const,
        enabled: value.enabled,
        config: {
          url: value.url,
          method: value.method,
        },
      };

      if (existing) {
        updateMutation.mutate(
          {
            teamId,
            notifierId: existing.id,
            data,
          },
          { onSuccess: onClose }
        );
      } else {
        createMutation.mutate(
          {
            teamId,
            data,
          },
          { onSuccess: onClose }
        );
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
                      Enable or disable this notifier
                    </FieldDescription>
                  </div>
                  <Switch
                    id={field.name}
                    checked={field.state.value ?? true}
                    onCheckedChange={field.handleChange}
                  />
                </div>
              </Field>
            )}
          />

          <form.Field
            name="url"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Webhook URL</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="url"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="https://example.com/webhook"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    The endpoint URL to send webhook requests to
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="method"
            children={(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>HTTP Method</FieldLabel>
                <Select
                  value={field.state.value || "POST"}
                  onValueChange={(v) =>
                    field.handleChange(v as "POST" | "PUT" | "PATCH")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  HTTP method to use for the webhook request
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
