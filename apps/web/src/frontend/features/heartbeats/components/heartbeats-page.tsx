import { getRouteApi, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/components/ui/empty";
import HeartbeatsList from "./heartbeats-list";

export default function HeartbeatsPage() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/heartbeats/");
  const heartbeats = routeApi.useLoaderData();
  const { teamId } = routeApi.useParams();

  return (
    <div className="space-y-10 w-full h-full flex-1 lg:max-w-3xl mx-auto">
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
      {heartbeats && heartbeats.length > 0 ? (
        <HeartbeatsList />
      ) : (
        <Empty className="flex-1 pt-36">
          <EmptyTitle>No heartbeats found.</EmptyTitle>
          <EmptyDescription>
            You haven&apos;t created any projects yet. Get started by creating
            your first project.
          </EmptyDescription>
          <EmptyContent>
            <Button
              variant="outline"
              size="xs"
              render={
                <Link to="/$teamId/heartbeats/new" params={{ teamId }}>
                  New Heartbeat
                </Link>
              }
            />
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}
