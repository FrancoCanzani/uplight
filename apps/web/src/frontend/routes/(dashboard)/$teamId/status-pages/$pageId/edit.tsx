import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import StatusPageEditForm from "@/features/status-pages/forms/status-page-edit-form";

async function fetchStatusPage(teamId: string, pageId: string) {
  const response = await fetch(`/api/status-pages/${teamId}/${pageId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch status page");
  }
  return response.json();
}

export const Route = createFileRoute(
  "/(dashboard)/$teamId/status-pages/$pageId/edit",
)({
  loader: async ({ params }) => {
    const page = await fetchStatusPage(params.teamId, params.pageId);
    return { page };
  },
  component: EditStatusPagePage,
});

function EditStatusPagePage() {
  const { page } = Route.useLoaderData();

  return (
    <div className="space-y-8 w-full lg:max-w-3xl mx-auto">
      <PageHeader title="Edit Status Page" />
      <StatusPageEditForm page={page} />
    </div>
  );
}
