import { HeartbeatForm } from "../forms/heartbeat-form";

export default function NewHeartbeatPage() {
  return (
    <div className="space-y-8 w-full md:max-w-4xl mx-auto">
      <header>
        <h1 className="text-2xl tracking-tight">New Heartbeat</h1>
        <p className="text-sm text-muted-foreground">
          Create a heartbeat monitor for your cron jobs, scheduled tasks, or
          background workers.
        </p>
      </header>
      <HeartbeatForm />
    </div>
  );
}
