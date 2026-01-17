import { getRouteApi } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { HeartbeatForm } from "../forms/heartbeat-form";

const routeApi = getRouteApi("/(dashboard)/$teamId");

export default function NewHeartbeatPage() {
  const { teamId } = routeApi.useParams();

  return (
    <div className="space-y-8 w-full md:max-w-4xl mx-auto">
      <PageHeader
        title="New Heartbeat"
        backLink={{ to: "/$teamId/heartbeats", params: { teamId } }}
      />
      <HeartbeatForm />
    </div>
  );
}
