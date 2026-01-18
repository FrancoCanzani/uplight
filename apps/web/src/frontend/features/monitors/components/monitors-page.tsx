import { getRouteApi, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/components/ui/empty";
import MonitorQuickstart from "./monitor-quickstart";
import MonitorsList from "./monitors-list";

export default function MonitorsPage() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/monitors/");
  const monitors = routeApi.useLoaderData();
  const { teamId } = routeApi.useParams();

  return (
    <div className="space-y-10 w-full h-full flex-1 lg:max-w-3xl mx-auto">
      <PageHeader
        title="Monitors"
        actions={
          <div className="flex items-center gap-2">
            <MonitorQuickstart />
            <span className="italic text-xs">Or</span>
            <Button
              variant="outline"
              size="xs"
              render={
                <Link to="/$teamId/monitors/new" params={{ teamId }}>
                  New Monitor
                </Link>
              }
            />
          </div>
        }
      />
      {monitors && monitors.length > 0 ? (
        <MonitorsList />
      ) : (
        <Empty className="flex-1 pt-36">
          <EmptyTitle>No monitors found.</EmptyTitle>
          <EmptyDescription>
            You haven&apos;t created any monitors yet. Get started by creating
            your first monitor.
          </EmptyDescription>
          <EmptyContent>
            <Button
              variant="outline"
              size="xs"
              render={
                <Link to="/$teamId/monitors/new" params={{ teamId }}>
                  New Monitor
                </Link>
              }
            />
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}
