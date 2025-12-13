import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCreateTeam } from "@/features/teams/api/use-create-team";
import { CreateTeamSchema } from "@/features/teams/schemas";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/teams/new")({
  component: NewTeamPage,
});

function NewTeamPage() {
  const createTeam = useCreateTeam();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onChange: CreateTeamSchema,
    },
    onSubmit: async ({ value }) => {
      createTeam.mutate(value, {
        onSuccess: () => {
          navigate({ to: "/dashboard" });
        },
      });
    },
  });

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h1 className="font-medium text-lg tracking-tight">Create New Team</h1>
        <p className="text-muted-foreground text-sm">
          Create a team to collaborate with others.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
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
                <FieldDescription>
                  Choose a name for your team.
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/dashboard" })}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createTeam.isPending}>
            {createTeam.isPending ? "Creating..." : "Create Team"}
          </Button>
        </div>
      </form>
    </div>
  );
}
