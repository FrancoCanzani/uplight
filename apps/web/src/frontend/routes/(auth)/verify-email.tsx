import { useState } from "react";
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
import { sendVerificationEmail, useSession } from "@/lib/auth/client";

const searchSchema = z.object({
  error: z.string().optional(),
});

export const Route = createFileRoute("/(auth)/verify-email")({
  component: VerifyEmail,
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Verify Email | Uplight" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function VerifyEmail() {
  const search = Route.useSearch();
  const { data: session } = useSession();
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    if (!session?.user?.email) {
      setResendError("No email address found. Please sign in again.");
      return;
    }

    setResendError(null);
    setResendSuccess(false);
    setIsResending(true);

    try {
      const result = await sendVerificationEmail({
        email: session.user.email,
      });

      if (result.error) {
        setResendError(
          result.error.message || "Failed to send verification email",
        );
      } else {
        setResendSuccess(true);
      }
    } catch (err) {
      setResendError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsResending(false);
    }
  };

  const errorMessage = search.error;
  const isExpiredOrInvalid =
    errorMessage?.includes("expired") || errorMessage?.includes("invalid");

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {isExpiredOrInvalid ? "Verification Link Expired" : "Verify Your Email"}
          </CardTitle>
          <CardDescription>
            {isExpiredOrInvalid
              ? "The verification link has expired or is invalid. Please request a new one."
              : "We've sent a verification email to your inbox. Please click the link to verify your email address."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage && !isExpiredOrInvalid && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {resendError && (
            <Alert variant="destructive">
              <AlertDescription>{resendError}</AlertDescription>
            </Alert>
          )}

          {resendSuccess && (
            <Alert>
              <AlertDescription>
                Verification email sent. Please check your inbox.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or request a new
              one.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={isResending}
            >
              {isResending ? "Sending..." : "Resend Verification Email"}
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
