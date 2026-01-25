import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useDeleteStatusPage } from "@/features/status-pages/api/use-delete-status-page";

async function fetchStatusPage(teamId: string, pageId: string) {
  const response = await fetch(`/api/status-pages/${teamId}/${pageId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch status page");
  }
  return response.json();
}

export const Route = createFileRoute(
  "/(dashboard)/$teamId/status-pages/$pageId/",
)({
  loader: ({ params }) => fetchStatusPage(params.teamId, params.pageId),
  component: StatusPageDetail,
});

function StatusPageDetail() {
  const { teamId, pageId } = Route.useParams();
  const deleteMutation = useDeleteStatusPage();

  const { data: page, isLoading } = useQuery({
    queryKey: ["status-page", teamId, pageId],
    queryFn: () => fetchStatusPage(teamId, pageId),
  });

  if (isLoading || !page) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const statusPageUrl = `${window.location.origin}/status/${page.slug}`;

  const handleDelete = () => {
    deleteMutation.mutate({
      teamId: Number(teamId),
      pageId: Number(pageId),
    });
  };

  return (
    <div className="space-y-10 w-full lg:max-w-3xl mx-auto">
      <PageHeader
        title={page.name}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="xs"
              render={
                <a
                  href={statusPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View
            </Button>
            <Button
              variant="outline"
              size="xs"
              render={
                <Link
                  to="/$teamId/status-pages/$pageId/edit"
                  params={{ teamId, pageId }}
                />
              }
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant="outline" size="xs">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Status Page</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this status page? This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        }
      />

      <div className="space-y-6">
        {page.description && (
          <p className="text-sm text-muted-foreground">{page.description}</p>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-border/30">
            <span className="text-sm text-muted-foreground">URL</span>
            <a
              href={statusPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:underline"
            >
              /status/{page.slug}
            </a>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-border/30">
            <span className="text-sm text-muted-foreground">Visibility</span>
            <span className="text-sm">
              {page.isPublic ? "Public" : "Private"}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-border/30">
            <span className="text-sm text-muted-foreground">
              Historical Uptime
            </span>
            <span className="text-sm">
              {page.showHistoricalUptime ? "Shown" : "Hidden"}
            </span>
          </div>

          {page.logoKey && (
            <div className="flex items-center justify-between py-2 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Logo</span>
              <img
                src={`/api/public/status/logo/${page.logoKey}`}
                alt="Logo"
                className="h-8"
              />
            </div>
          )}

          <div className="flex items-center justify-between py-2 border-b border-border/30">
            <span className="text-sm text-muted-foreground">Created</span>
            <span className="text-sm">
              {new Date(page.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
