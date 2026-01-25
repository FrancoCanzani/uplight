import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/client";

export const Route = createFileRoute("/(dashboard)/$teamId/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="max-w-4xl w-full mx-auto space-y-6">
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
