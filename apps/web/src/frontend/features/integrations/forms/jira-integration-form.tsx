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
import type { Integration, JiraFormInput } from "../schemas";
import { JiraFormSchema } from "../schemas";

function getDefaultValues(existing?: Integration): JiraFormInput {
  if (existing && existing.type === "jira") {
    return {
      type: "jira",
      enabled: existing.enabled,
      domain: existing.config.domain,
      email: existing.config.email,
      apiToken: existing.config.apiToken,
      projectKey: existing.config.projectKey,
      issueType: existing.config.issueType,
    };
  }

  return {
    type: "jira",
    enabled: false,
    domain: "",
    email: "",
    apiToken: "",
    projectKey: "",
    issueType: "Bug",
  };
}

export default function JiraIntegrationForm({
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
      onSubmit: JiraFormSchema,
    },
    onSubmit: async ({ value }) => {
      const data = {
        type: "jira" as const,
        enabled: value.enabled,
        config: {
          domain: value.domain,
          email: value.email,
          apiToken: value.apiToken,
          projectKey: value.projectKey,
          issueType: value.issueType,
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
            name="domain"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Jira Domain</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="your-company"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Your Jira subdomain (e.g., "your-company" for
                    your-company.atlassian.net)
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="email"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="you@company.com"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Your Atlassian account email
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="apiToken"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>API Token</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Enter your Jira API token"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Create at id.atlassian.com/manage-profile/security/api-tokens
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="projectKey"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Project Key</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="PROJ"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    The project key where issues will be created (e.g., "PROJ")
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="issueType"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Issue Type</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Bug"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Issue type name (e.g., "Bug", "Task", "Incident")
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
