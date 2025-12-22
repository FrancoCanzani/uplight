import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "@tanstack/react-form";
import { useParams } from "@tanstack/react-router";
import { format } from "date-fns";
import { useCreateMaintenance } from "../api/use-create-maintenance";
import { useUpdateMaintenance } from "../api/use-update-maintenance";
import {
  MaintenanceFormSchema,
  type Maintenance,
  type MaintenanceFormInput,
} from "../schemas";

function getDefaultValues(existing?: Maintenance): MaintenanceFormInput {
  const now = new Date();
  const defaultStart = existing ? new Date(existing.startsAt) : now;
  const defaultEnd = existing
    ? new Date(existing.endsAt)
    : new Date(now.getTime() + 60 * 60 * 1000);

  return {
    reason: existing?.reason ?? "",
    startsAt: format(defaultStart, "yyyy-MM-dd'T'HH:mm"),
    endsAt: format(defaultEnd, "yyyy-MM-dd'T'HH:mm"),
  };
}

export default function MaintenanceForm({
  existing,
  onClose,
}: {
  existing?: Maintenance;
  onClose?: () => void;
}) {
  const { teamId, monitorId } = useParams({
    from: "/(dashboard)/$teamId/monitors/$monitorId/maintenance",
  });
  const createMutation = useCreateMaintenance();
  const updateMutation = useUpdateMaintenance();

  const form = useForm({
    defaultValues: getDefaultValues(existing),
    validators: {
      onSubmit: MaintenanceFormSchema,
    },
    onSubmit: async ({ value }) => {
      const monitorIdNum = Number(monitorId);
      const startsAtTimestamp = new Date(value.startsAt).getTime();
      const endsAtTimestamp = new Date(value.endsAt).getTime();

      if (existing) {
        updateMutation.mutate(
          {
            teamId,
            maintenanceId: existing.id,
            monitorId: monitorIdNum,
            data: {
              reason: value.reason || undefined,
              startsAt: startsAtTimestamp,
              endsAt: endsAtTimestamp,
            },
          },
          { onSuccess: onClose }
        );
      } else {
        createMutation.mutate(
          {
            teamId,
            data: {
              monitorId: monitorIdNum,
              reason: value.reason || undefined,
              startsAt: startsAtTimestamp,
              endsAt: endsAtTimestamp,
            },
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
    >
      <FieldGroup className="space-y-4">
        <form.Field
          name="reason"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Reason</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Scheduled server maintenance"
                  autoComplete="off"
                />
                <FieldDescription>
                  Optional description for this maintenance window
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <div className="grid grid-cols-2 gap-4">
          <form.Field
            name="startsAt"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Starts at</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="datetime-local"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="endsAt"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Ends at</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="datetime-local"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
        </div>

        <div className="flex justify-end w-full gap-2 pt-2">
          <Button type="submit" size="xs" disabled={isPending}>
            {isPending
              ? existing
                ? "Updating..."
                : "Scheduling..."
              : existing
                ? "Update"
                : "Schedule"}
          </Button>
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
        </div>
      </FieldGroup>
    </form>
  );
}
