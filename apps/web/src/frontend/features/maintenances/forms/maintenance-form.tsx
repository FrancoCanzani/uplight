import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { MonitorResponse } from "@/features/monitors/schemas";
import { useCreateMaintenance } from "../api/use-create-maintenance";
import { useUpdateMaintenance } from "../api/use-update-maintenance";
import {
  MaintenanceFormSchema,
  type Maintenance,
  type MaintenanceFormInput,
} from "../schemas";

function getDefaultValues(
  monitors: MonitorResponse[],
  existing?: Maintenance,
  preselectedMonitorIds: number[] = [],
): MaintenanceFormInput {
  const now = new Date();
  const defaultStart = existing ? new Date(existing.startsAt) : now;
  const defaultEnd = existing
    ? new Date(existing.endsAt)
    : new Date(now.getTime() + 60 * 60 * 1000);
  const availableMonitorIds = new Set(monitors.map((monitor) => monitor.id));
  const selectedFromContext = preselectedMonitorIds.filter((monitorId) =>
    availableMonitorIds.has(monitorId),
  );
  const monitorIds =
    existing?.monitorIds ??
    (selectedFromContext.length > 0
      ? selectedFromContext
      : monitors.length > 0
        ? [monitors[0].id]
        : []);

  return {
    monitorIds,
    reason: existing?.reason ?? "",
    startsAt: format(defaultStart, "yyyy-MM-dd'T'HH:mm"),
    endsAt: format(defaultEnd, "yyyy-MM-dd'T'HH:mm"),
  };
}

export default function MaintenanceForm({
  teamId,
  monitors,
  preselectedMonitorIds,
  existing,
  onClose,
}: {
  teamId: string;
  monitors: MonitorResponse[];
  preselectedMonitorIds?: number[];
  existing?: Maintenance;
  onClose?: () => void;
}) {
  const createMutation = useCreateMaintenance();
  const updateMutation = useUpdateMaintenance();

  const form = useForm({
    defaultValues: getDefaultValues(monitors, existing, preselectedMonitorIds),
    validators: {
      onSubmit: MaintenanceFormSchema,
    },
    onSubmit: async ({ value }) => {
      const startsAtTimestamp = new Date(value.startsAt).getTime();
      const endsAtTimestamp = new Date(value.endsAt).getTime();

      if (existing) {
        updateMutation.mutate(
          {
            teamId,
            maintenanceId: existing.id,
            data: {
              monitorIds: value.monitorIds,
              reason: value.reason || undefined,
              startsAt: startsAtTimestamp,
              endsAt: endsAtTimestamp,
            },
          },
          { onSuccess: onClose },
        );
      } else {
        createMutation.mutate(
          {
            teamId,
            data: {
              monitorIds: value.monitorIds,
              reason: value.reason || undefined,
              startsAt: startsAtTimestamp,
              endsAt: endsAtTimestamp,
            },
          },
          { onSuccess: onClose },
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
          name="monitorIds"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel>Monitors</FieldLabel>
                <div className="border rounded-none p-2 max-h-52 overflow-y-auto space-y-2">
                  {monitors.map((monitor) => {
                    const checked = field.state.value.includes(monitor.id);

                    return (
                      <label
                        key={monitor.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(nextChecked) => {
                            if (nextChecked) {
                              if (!field.state.value.includes(monitor.id)) {
                                field.handleChange([
                                  ...field.state.value,
                                  monitor.id,
                                ]);
                              }
                              return;
                            }

                            field.handleChange(
                              field.state.value.filter(
                                (monitorId) => monitorId !== monitor.id,
                              ),
                            );
                          }}
                          onBlur={field.handleBlur}
                        />
                        <span className="truncate">{monitor.name}</span>
                      </label>
                    );
                  })}
                </div>
                <FieldDescription>
                  Select one or more monitors for this maintenance window.
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

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
