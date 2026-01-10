import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { useForm } from "@tanstack/react-form";
import { useParams } from "@tanstack/react-router";
import { useCreateNotifier } from "../api/use-create-notifier";
import { useUpdateNotifier } from "../api/use-update-notifier";
import type { Notifier } from "../schemas";
import { EmailFormSchema } from "../schemas";

function getDefaultValues(existing?: Notifier) {
  if (existing && existing.type === "email") {
    return {
      type: "email" as const,
      enabled: existing.enabled,
    };
  }

  return {
    type: "email" as const,
    enabled: false,
  };
}

export default function EmailNotifierForm({
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
      onSubmit: EmailFormSchema,
    },
    onSubmit: async ({ value }) => {
      const data = {
        type: "email" as const,
        enabled: value.enabled,
        config: {},
      };

      if (existing) {
        updateMutation.mutate(
          {
            teamId,
            notifierId: existing.id,
            data: {
              enabled: value.enabled,
            },
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
      <FieldGroup className="space-y-6 h-full flex flex-col justify-between">
        <form.Field
          name="enabled"
          children={(field) => (
            <Field>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <FieldLabel htmlFor={field.name}>
                    Enable Email Notifications
                  </FieldLabel>
                  <FieldDescription className="text-xs">
                    When enabled, all team members will automatically receive
                    email notifications when incidents are created or resolved.
                    No additional configuration is required.
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
                : "Save"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
