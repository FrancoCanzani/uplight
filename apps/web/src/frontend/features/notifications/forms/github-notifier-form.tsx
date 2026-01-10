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
import type { GitHubFormInput, Notifier } from "../schemas";
import { GitHubFormSchema } from "../schemas";

function getDefaultValues(existing?: Notifier): GitHubFormInput {
  if (existing && existing.type === "github") {
    return {
      type: "github",
      enabled: existing.enabled,
      repository: existing.config.repository,
      token: existing.config.token,
      labels:
        existing.config.labels && existing.config.labels.length > 0
          ? existing.config.labels.join(", ")
          : "",
      assignees:
        existing.config.assignees && existing.config.assignees.length > 0
          ? existing.config.assignees.join(", ")
          : "",
    };
  }

  return {
    type: "github",
    enabled: false,
    repository: "",
    token: "",
    labels: "",
    assignees: "",
  };
}

export default function GitHubNotifierForm({
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
      onSubmit: GitHubFormSchema,
    },
    onSubmit: async ({ value }) => {
      const labels = value.labels
        ? value.labels
            .split(",")
            .map((l) => l.trim())
            .filter(Boolean)
        : undefined;
      const assignees = value.assignees
        ? value.assignees
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean)
        : undefined;

      const data = {
        type: "github" as const,
        enabled: value.enabled,
        config: {
          repository: value.repository,
          token: value.token,
          labels,
          assignees,
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
                    checked={field.state.value ?? false}
                    onCheckedChange={field.handleChange}
                  />
                </div>
              </Field>
            )}
          />

          <form.Field
            name="repository"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Repository</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="owner/repo"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    GitHub repository in the format owner/repo (e.g.,
                    octocat/Hello-World)
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="token"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>GitHub Token</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="ghp_..."
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Personal access token with repo scope to create issues
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="labels"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Labels (Optional)
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="incident, monitoring, bug"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Comma-separated list of labels to add to issues
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="assignees"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Assignees (Optional)
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="username1, username2"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Comma-separated list of GitHub usernames to assign issues to
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
