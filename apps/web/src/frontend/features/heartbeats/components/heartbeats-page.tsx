import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { getRouteApi, Link } from "@tanstack/react-router";
import HeartbeatsTable from "./heartbeats-table";

export default function HeartbeatsPage() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/heartbeats/");
  const { teamId } = routeApi.useParams();

  return (
    <div className="space-y-8 w-full lg:max-w-4xl mx-auto">
      <PageHeader
        title="Heartbeats"
        actions={
          <Button
            variant="outline"
            size="xs"
            render={
              <Link to="/$teamId/heartbeats/new" params={{ teamId }}>
                New Heartbeat
              </Link>
            }
          />
        }
      />
      <HeartbeatsTable />
    </div>
  );
}
