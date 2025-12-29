import { fetchHeartbeat } from "@/features/heartbeats/api/fetch-heartbeat";
import { HeartbeatForm } from "@/features/heartbeats/forms/heartbeat-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/(dashboard)/$teamId/heartbeats/$heartbeatId/edit"
)({
  loader: async ({ params }) => {
    const heartbeat = await fetchHeartbeat(
      Number(params.teamId),
      Number(params.heartbeatId)
    );
    return { heartbeat };
  },
  component: EditHeartbeatPage,
});

function EditHeartbeatPage() {
  const { heartbeat } = Route.useLoaderData();

  return (
    <div className="space-y-12 w-full lg:max-w-4xl mx-auto">
      <div>
        <h1 className="font-medium text-lg tracking-tight">Edit Heartbeat</h1>
        <p className="text-muted-foreground text-sm">
          Update the configuration for {heartbeat.name}.
        </p>
      </div>
      <div>
        <HeartbeatForm heartbeat={heartbeat} />
      </div>
    </div>
  );
}
