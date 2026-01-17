import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { ThemeSwitcher } from "@/components/theme-switcher";

export const Route = createFileRoute("/(dashboard)/$teamId/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="max-w-4xl w-full mx-auto space-y-6">
      <PageHeader title="Settings" />
      <div className="border  p-4 flex flex-row items-center justify-between">
        <div>
          <h2 className="text-sm font-medium">Appearance</h2>
          <p className="text-muted-foreground text-xs">
            Choose your preferred theme for the application.
          </p>
        </div>
        <ThemeSwitcher />
      </div>
    </div>
  );
}
