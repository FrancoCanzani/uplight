import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/lib/auth/client";

const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

export const Route = createFileRoute("/(auth)/forgot-password")({
  component: ForgotPassword,
  head: () => ({
    meta: [
      { title: "Forgot Password | Uplight" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function ForgotPassword() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onBlur: forgotPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      setError(null);
      setSuccess(false);
      setIsLoading(true);

      try {
        const result = await requestPasswordReset({
          email: value.email,
          redirectTo: "/reset-password",
        });

        if (result.error) {
          setError(result.error.message || "Failed to send reset email");
        } else {
          setSuccess(true);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred",
        );
      } finally {
        setIsLoading(false);
      }
    },
  });

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Check Your Email</CardTitle>
            <CardDescription>
              If an account exists with that email address, we've sent a
              password reset link. Please check your inbox and spam folder.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login" className="text-primary hover:underline text-sm">
              Back to Sign In
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your
            password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form.Field
                name="email"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <FieldContent>
                        <Input
                          id={field.name}
                          type="email"
                          placeholder="you@example.com"
                          autoComplete="email"
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
