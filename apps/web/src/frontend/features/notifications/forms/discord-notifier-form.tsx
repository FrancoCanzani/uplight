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
import { useForm } from "@tanstack/react-form";
import { useParams } from "@tanstack/react-router";
import { useCreateNotifier } from "../api/use-create-notifier";
import { useUpdateNotifier } from "../api/use-update-notifier";
import type { DiscordFormInput, Notifier } from "../schemas";
import { DiscordFormSchema } from "../schemas";

function getDefaultValues(existing?: Notifier): DiscordFormInput {
  if (existing && existing.type === "discord") {
    return {
      type: "discord",
      enabled: existing.enabled,
      webhookUrl: existing.config.webhookUrl,
      username: existing.config.username || "",
      avatarUrl: existing.config.avatarUrl || "",
    };
  }

  return {
    type: "discord",
    enabled: true,
    webhookUrl: "",
    username: "",
    avatarUrl: "",
  };
}

export default function DiscordNotifierForm({
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
      onSubmit: DiscordFormSchema,
    },
    onSubmit: async ({ value }) => {
      const data = {
        type: "discord" as const,
        enabled: value.enabled,
        config: {
          webhookUrl: value.webhookUrl,
          username: value.username || undefined,
          avatarUrl: value.avatarUrl || undefined,
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
            name="webhookUrl"
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
                    placeholder="https://discord.com/api/webhooks/..."
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Your Discord webhook URL from Server Settings → Integrations
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="username"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Username (Optional)
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Uplight Monitor"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Custom bot username for messages
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="avatarUrl"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Avatar URL (Optional)
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="url"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="https://example.com/avatar.png"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Custom avatar image URL for the webhook
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
