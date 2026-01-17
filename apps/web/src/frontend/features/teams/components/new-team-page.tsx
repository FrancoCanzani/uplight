import { useForm } from "@tanstack/react-form";
import { getRouteApi, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCreateTeam } from "../api/use-create-team";
import { CreateTeamSchema, type CreateTeam } from "../schemas";

const routeApi = getRouteApi("/(dashboard)/$teamId");

export function NewTeamPage() {
  const { currentTeam } = routeApi.useLoaderData();
  const createTeam = useCreateTeam();

  const form = useForm({
    defaultValues: {
      name: "",
    } as CreateTeam,
    validators: {
      onSubmit: CreateTeamSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = CreateTeamSchema.parse(value);
      createTeam.mutate(parsed);
    },
  });

  return (
    <div className="max-w-xl w-full mx-auto space-y-8">
      <PageHeader
        title="New Team"
        backLink={{
          to: "/$teamId/team",
          params: { teamId: String(currentTeam.id) },
        }}
      />
      <form
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
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
                <FieldLabel htmlFor={field.name}>Team name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Acme Inc"
                  autoComplete="off"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" disabled={createTeam.isPending}>
            {createTeam.isPending ? "Creating..." : "Create team"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            render={
              <Link
                to="/$teamId/team"
                params={{ teamId: String(currentTeam.id) }}
              />
            }
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
