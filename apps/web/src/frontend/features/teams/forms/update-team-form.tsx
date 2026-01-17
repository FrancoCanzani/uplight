import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useUpdateTeam } from "../api/use-update-team";
import {
  UpdateTeamSchema,
  type TeamResponse,
  type UpdateTeam,
} from "../schemas";

export function UpdateTeamForm({ team }: { team: TeamResponse }) {
  const updateTeam = useUpdateTeam();

  const form = useForm({
    defaultValues: {
      name: team.name,
    } as UpdateTeam,
    validators: {
      onSubmit: UpdateTeamSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = UpdateTeamSchema.parse(value);
      updateTeam.mutate({
        teamId: team.id.toString(),
        data: parsed,
      });
    },
  });

  return (
    <form
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="space-y-4">
        <form.Field
          name="name"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Team Name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="My Team"
                  autoComplete="off"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <div className="flex justify-end">
          <Button type="submit" size="xs" disabled={updateTeam.isPending}>
            {updateTeam.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}
