import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { fetchHeartbeat } from "@/features/heartbeats/api/fetch-heartbeat";
import { HeartbeatForm } from "@/features/heartbeats/forms/heartbeat-form";

export const Route = createFileRoute(
  "/(dashboard)/$teamId/heartbeats/$heartbeatId/edit",
)({
  loader: async ({ params }) => {
    const heartbeat = await fetchHeartbeat(
      Number(params.teamId),
      Number(params.heartbeatId),
    );
    return { heartbeat };
  },
  component: EditHeartbeatPage,
});

function EditHeartbeatPage() {
  const { heartbeat } = Route.useLoaderData();

  return (
    <div className="space-y-8 w-full lg:max-w-4xl mx-auto">
      <PageHeader title="Edit Heartbeat" />
      <HeartbeatForm heartbeat={heartbeat} />
    </div>
  );
}
