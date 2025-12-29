import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
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
import { Separator } from "@/components/ui/separator";
import { useForm } from "@tanstack/react-form";
import { useParams } from "@tanstack/react-router";
import { useCreateHeartbeat } from "../api/use-create-heartbeat";
import { useUpdateHeartbeat } from "../api/use-update-heartbeat";
import { GRACE_PERIODS } from "../constants";
import {
  CreateHeartbeatSchema,
  type CreateHeartbeatInput,
  type HeartbeatResponse,
} from "../schemas";

const emptyValues: CreateHeartbeatInput = {
  name: "",
  gracePeriod: 300,
};

function heartbeatToFormValues(
  heartbeat: HeartbeatResponse
): CreateHeartbeatInput {
  return {
    name: heartbeat.name,
    gracePeriod: heartbeat.gracePeriod,
  };
}

export function HeartbeatForm({
  heartbeat,
}: {
  heartbeat?: HeartbeatResponse;
}) {
  const { teamId } = useParams({ from: "/(dashboard)/$teamId" });
  const isEditing = !!heartbeat;
  const defaultValues = heartbeat
    ? heartbeatToFormValues(heartbeat)
    : emptyValues;
  const createHeartbeat = useCreateHeartbeat();
  const updateHeartbeat = useUpdateHeartbeat();
  const isPending = isEditing
    ? updateHeartbeat.isPending
    : createHeartbeat.isPending;

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: CreateHeartbeatSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = CreateHeartbeatSchema.parse(value);
      if (isEditing) {
        updateHeartbeat.mutate({
          teamId: Number(teamId),
          heartbeatId: heartbeat.id,
          data: parsed,
        });
      } else {
        createHeartbeat.mutate({ teamId: Number(teamId), data: parsed });
      }
    },
  });

  return (
    <form
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <FieldLabel>Heartbeat Information</FieldLabel>
            <FieldDescription>
              Configure your heartbeat monitor for cron jobs, scheduled tasks,
              or background workers.
            </FieldDescription>
          </div>
          <form.Field
            name="name"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Heartbeat Name</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Daily Backup Job"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    A friendly name to identify this heartbeat.
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <div>
            <FieldLabel>Grace Period</FieldLabel>
            <FieldDescription>
              How long to wait after the expected ping before marking the
              heartbeat as down.
            </FieldDescription>
          </div>
          <form.Field
            name="gracePeriod"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              const selectedPeriod = GRACE_PERIODS.find(
                (period) => period.value === field.state.value
              );
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Grace Period</FieldLabel>
                  <Select
                    name={field.name}
                    value={String(field.state.value)}
                    onValueChange={(v) => field.handleChange(Number(v))}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={isInvalid}
                      className="w-full max-w-xs"
                    >
                      <SelectValue>
                        {selectedPeriod?.label || "Select grace period"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {GRACE_PERIODS.map((period) => (
                        <SelectItem
                          key={period.value}
                          value={String(period.value)}
                        >
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    If your job runs every hour, set the grace period to
                    something like 1 hour + buffer time (e.g., 2 hours).
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
        </div>

        <Separator />

        <div className="flex justify-end w-full gap-3 pt-4">
          <Button
            type="button"
            variant="destructive"
            size={"xs"}
            onClick={() => form.reset()}
            disabled={isPending}
          >
            Reset
          </Button>
          <Button type="submit" size={"xs"} disabled={isPending}>
            {isPending
              ? isEditing
                ? "Saving..."
                : "Creating..."
              : isEditing
                ? "Save Changes"
                : "Create Heartbeat"}
          </Button>
        </div>
      </div>
    </form>
  );
}
