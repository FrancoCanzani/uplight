import { Button } from "@/components/ui/button";
import { getRouteApi, Link } from "@tanstack/react-router";
import HeartbeatsTable from "./heartbeats-table";

export default function HeartbeatsPage() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/heartbeats/");
  const { teamId } = routeApi.useParams();

  return (
    <div className="space-y-12 w-full lg:max-w-4xl mx-auto">
      <header className="w-full flex items-center justify-between">
        <h1 className="text-2xl tracking-tight text-balance">Heartbeats</h1>
        <Button
          variant={"secondary"}
          size={"xs"}
          render={
            <Link to="/$teamId/heartbeats/new" params={{ teamId }}>
              New Heartbeat
            </Link>
          }
        />
      </header>
      <HeartbeatsTable />
    </div>
  );
}
