import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "@tanstack/react-form";
import { useInviteMember } from "../api/use-invite-member";
import { InviteMemberSchema, type InviteMember, type TeamRole } from "../schemas";

const ROLE_OPTIONS = [
  { value: "member", label: "Member", description: "Can view team resources" },
  {
    value: "admin",
    label: "Admin",
    description: "Can manage team and members",
  },
  { value: "owner", label: "Owner", description: "Full control of the team" },
] as const;

export function InviteMemberForm({
  teamId,
  onSuccess,
}: {
  teamId: string;
  onSuccess?: () => void;
}) {
  const inviteMember = useInviteMember();

  const form = useForm({
    defaultValues: {
      email: "",
      role: "member",
    } as InviteMember,
    validators: {
      onSubmit: InviteMemberSchema,
    },
    onSubmit: async ({ value }) => {
      const parsed = InviteMemberSchema.parse(value);
      inviteMember.mutate(
        {
          teamId,
          data: parsed,
        },
        {
          onSuccess: () => {
            form.reset();
            onSuccess?.();
          },
        },
      );
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
          name="email"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Email Address</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="user@example.com"
                  autoComplete="off"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="role"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            const selectedRole = ROLE_OPTIONS.find(
              (option) => option.value === field.state.value,
            );
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                <Select
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(v) => field.handleChange(v as TeamRole)}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={isInvalid}
                    className="w-full"
                  >
                    <SelectValue>
                      {selectedRole?.label || "Select a role"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {option.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" size="xs" disabled={inviteMember.isPending}>
            {inviteMember.isPending ? "Adding..." : "Add Member"}
          </Button>
        </div>
      </div>
    </form>
  );
}
