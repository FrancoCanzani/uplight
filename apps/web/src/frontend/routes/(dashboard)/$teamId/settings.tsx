import { ThemeSwitcher } from "@/components/theme-switcher";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(dashboard)/$teamId/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="max-w-4xl w-full mx-auto space-y-6">
      <header className="flex items-center justify-start gap-x-2">
        <h1 className="text-2xl tracking-tight text-balance">Settings</h1>
      </header>

      <div className="w-full border p-2 rounded flex flex-row items-center justify-between">
        <div>
          <h2 className="text-sm">Appearance</h2>
          <p className="text-muted-foreground text-xs">
            Choose your preferred theme for the application.
          </p>
        </div>
        <ThemeSwitcher />
      </div>
    </div>
  );
}
