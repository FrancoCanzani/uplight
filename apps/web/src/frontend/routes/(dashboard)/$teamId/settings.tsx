import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { PageHeader } from "@/components/page-header";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  changePassword,
  sendVerificationEmail,
  signOut,
  useSession,
} from "@/lib/auth/client";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const Route = createFileRoute("/(dashboard)/$teamId/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null,
  );
  const [verificationSent, setVerificationSent] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const handleResendVerification = async () => {
    setVerificationError(null);
    setVerificationSent(false);
    setIsSendingVerification(true);

    try {
      const result = await sendVerificationEmail({
        email: session?.user?.email || "",
      });

      if (result.error) {
        setVerificationError(
          result.error.message || "Failed to send verification email",
        );
      } else {
        setVerificationSent(true);
      }
    } catch (err) {
      setVerificationError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsSendingVerification(false);
    }
  };

  const passwordForm = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validators: {
      onBlur: changePasswordSchema,
    },
    onSubmit: async ({ value }) => {
      setPasswordError(null);
      setPasswordSuccess(false);
      setIsChangingPassword(true);

      try {
        const result = await changePassword({
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
        });

        if (result.error) {
          setPasswordError(result.error.message || "Failed to change password");
        } else {
          setPasswordSuccess(true);
          passwordForm.reset();
        }
      } catch (err) {
        setPasswordError(
          err instanceof Error ? err.message : "An unexpected error occurred",
        );
      } finally {
        setIsChangingPassword(false);
      }
    },
  });

  const isEmailVerified = session?.user?.emailVerified;

  return (
    <div className="max-w-4xl w-full mx-auto space-y-6 px-4 lg:px-6 pb-20 md:pb-6">
      <PageHeader title="Settings" />

      <div className="border p-4 flex flex-row items-center justify-between">
        <div>
          <h2 className="text-sm font-medium">Appearance</h2>
          <p className="text-muted-foreground text-xs">
            Choose your preferred theme for the application.
          </p>
        </div>
        <ThemeSwitcher />
      </div>

      <div className="border p-4 space-y-4">
        <div>
          <h2 className="text-sm font-medium">Change Password</h2>
          <p className="text-muted-foreground text-xs">
            Update your password to keep your account secure.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            passwordForm.handleSubmit();
          }}
        >
          <FieldGroup className="space-y-4">
            {passwordError && (
              <Alert variant="destructive">
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}

            {passwordSuccess && (
              <Alert>
                <AlertDescription>
                  Password changed successfully.
                </AlertDescription>
              </Alert>
            )}

            <passwordForm.Field
              name="currentPassword"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Current Password
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id={field.name}
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </FieldContent>
                  </Field>
                );
              }}
            />

            <passwordForm.Field
              name="newPassword"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                    <FieldContent>
                      <Input
                        id={field.name}
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </FieldContent>
                  </Field>
                );
              }}
            />

            <passwordForm.Field
              name="confirmPassword"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Confirm New Password
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id={field.name}
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </FieldContent>
                  </Field>
                );
              }}
            />

            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? "Changing..." : "Change Password"}
            </Button>
          </FieldGroup>
        </form>
      </div>

      <div className="border p-4 flex flex-row items-center justify-between">
        <div>
          <h2 className="text-sm font-medium">Email Verification</h2>
          <p className="text-muted-foreground text-xs">
            {isEmailVerified
              ? "Your email has been verified."
              : "Your email is not verified. Please verify your email address."}
          </p>
          {verificationError && (
            <p className="text-destructive text-xs mt-1">{verificationError}</p>
          )}
          {verificationSent && (
            <p className="text-green-600 text-xs mt-1">
              Verification email sent. Check your inbox.
            </p>
          )}
        </div>
        {!isEmailVerified && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendVerification}
            disabled={isSendingVerification}
          >
            {isSendingVerification ? "Sending..." : "Resend Verification"}
          </Button>
        )}
      </div>

      <div className="border p-4 flex flex-row items-center justify-between">
        <div>
          <h2 className="text-sm font-medium">Sign out</h2>
          <p className="text-muted-foreground text-xs">
            Sign out of your account on this device.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
