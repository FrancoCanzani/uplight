import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/components/ui/empty";
import fetchStatusPages from "@/features/status-pages/api/fetch-status-pages";
import StatusPagesList from "@/features/status-pages/components/status-pages-list";

export const Route = createFileRoute("/(dashboard)/$teamId/status-pages/")({
  loader: ({ params }) => fetchStatusPages(params.teamId),

  component: StatusPagesPage,
});

function StatusPagesPage() {
  const statusPages = Route.useLoaderData();
  const { teamId } = Route.useParams();

  return (
    <div className="space-y-10 w-full h-full flex-1 lg:max-w-4xl mx-auto px-4 lg:px-6 pb-20 md:pb-6">
      <PageHeader
        title="Status Pages"
        actions={
          <Button
            variant="outline"
            size="xs"
            render={
              <Link to="/$teamId/status-pages/new" params={{ teamId }}>
                New Status Page
              </Link>
            }
          />
        }
      />
      {statusPages && statusPages.length > 0 ? (
        <StatusPagesList />
      ) : (
        <Empty className="flex-1 pt-36">
          <EmptyTitle>No status pages found.</EmptyTitle>
          <EmptyDescription>
            You haven&apos;t created any status pages yet. Get started by
            creating your first status page.
          </EmptyDescription>
          <EmptyContent>
            <Button
              variant="outline"
              size="xs"
              render={
                <Link to="/$teamId/status-pages/new" params={{ teamId }}>
                  New Status Page
                </Link>
              }
            />
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}
