import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Settings, Trash2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
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
      <div className="space-y-2">
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
                <ExternalLink className="h-4 w-4 mr-2" />
                View Page
              </Button>
              <Button
                variant="outline"
                size="xs"
                render={<Link to="/" params={{ teamId, pageId }} />}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button variant="outline" size="xs">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  }
                ></AlertDialogTrigger>
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
        {page.description && (
          <p className="text-sm text-muted-foreground">{page.description}</p>
        )}
      </div>

      <div className="space-y-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Status Page Details</h2>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Slug</div>
              <div className="font-mono">/status/{page.slug}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                Public URL
              </div>
              <a
                href={statusPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {statusPageUrl}
              </a>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                Visibility
              </div>
              <Badge variant={page.isPublic ? "default" : "secondary"}>
                {page.isPublic ? "Public" : "Private"}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                Historical Uptime
              </div>
              <Badge
                variant={page.showHistoricalUptime ? "default" : "secondary"}
              >
                {page.showHistoricalUptime ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            {page.logoKey && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Logo</div>
                <img
                  src={`/api/public/status/logo/${page.logoKey}`}
                  alt="Logo"
                  className="h-16"
                />
              </div>
            )}
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Monitors</h2>
            <Button
              variant="outline"
              size="sm"
              render={<Link to="/" params={{ teamId, pageId }} />}
            >
              Manage Monitors
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure which monitors appear on your status page and organize
            them into groups.
          </p>
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Groups</h2>
            <Button
              variant="outline"
              size="sm"
              render={<Link to="/" params={{ teamId, pageId }} />}
            >
              Manage Groups
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Create groups like "API", "Frontend", "Database" to organize your
            monitors on the status page.
          </p>
        </div>
      </div>
    </div>
  );
}
