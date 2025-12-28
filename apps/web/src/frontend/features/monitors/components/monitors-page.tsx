import { Button } from "@/components/ui/button";
import { getRouteApi, Link } from "@tanstack/react-router";
import MonitorsTable from "./monitors-table";

export default function MonitorsPage() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/monitors/");
  const { teamId } = routeApi.useParams();

  return (
    <div className="space-y-12 w-full lg:max-w-4xl mx-auto">
      <header className="w-full flex items-center justify-between">
        <h1 className="text-2xl tracking-tight text-balance">Monitors</h1>
        <Button
          variant={"secondary"}
          size={"xs"}
          render={
            <Link to="/$teamId/monitors/new" params={{ teamId }}>
              New Monitor
            </Link>
          }
        />
      </header>
      <MonitorsTable />
    </div>
  );
}
