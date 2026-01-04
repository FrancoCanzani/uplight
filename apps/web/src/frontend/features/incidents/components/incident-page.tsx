import TiptapEditor from "@/components/ui/tiptap-editor";
import { formatCause, formatDate, formatDuration } from "@lib/utils";
import { getRouteApi } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import useUpdateIncidentPostMortem from "../api/use-update-incident-post-mortem";

export default function IncidentPage() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/incidents/$incidentId");
  const incident = routeApi.useLoaderData();
  const { teamId, incidentId } = routeApi.useParams();

  const [postMortemTitle, setPostMortemTitle] = useState(
    incident.postMortemTitle ?? "",
  );
  const [postMortemContent, setPostMortemContent] = useState(
    incident.postMortemContent ?? "",
  );

  const [debouncedTitle] = useDebounce(postMortemTitle, 1000);
  const [debouncedContent] = useDebounce(postMortemContent, 1000);
  const [showSaved, setShowSaved] = useState(false);

  const updateMutation = useUpdateIncidentPostMortem();

  useEffect(() => {
    if (
      debouncedTitle === postMortemTitle &&
      debouncedContent === postMortemContent
    ) {
      const hasChanges =
        debouncedTitle !== (incident.postMortemTitle ?? "") ||
        debouncedContent !== (incident.postMortemContent ?? "");

      if (hasChanges) {
        updateMutation.mutate(
          {
            teamId,
            incidentId,
            postMortemTitle: debouncedTitle || null,
            postMortemContent: debouncedContent || null,
          },
          {
            onSuccess: () => {
              setShowSaved(true);
              setTimeout(() => setShowSaved(false), 2000);
            },
          },
        );
      }
    }
  }, [
    debouncedTitle,
    debouncedContent,
    postMortemTitle,
    postMortemContent,
    teamId,
    incidentId,
    incident.postMortemTitle,
    incident.postMortemContent,
    updateMutation,
  ]);

  const duration = incident.resolvedAt
    ? incident.resolvedAt - incident.startedAt
    : Date.now() - incident.startedAt;

  return (
    <div className="space-y-12 w-full lg:max-w-4xl mx-auto">
      <div className="flex items-center justify-start space-x-1.5">
        <Info className="size-3.5" />
        <p className="text-sm italic">
          <span className="bg-blue-50">Highlighted</span> fields are
          AI-generated and may contain errors.
        </p>
      </div>
      <header className="flex flex-col space-y-3 items-start justify-between">
        <h2>
          Incident in monitor <strong>{incident.monitorName}</strong>
        </h2>

        <h1
          className={`text-xl tracking-tight ${
            incident.title ? "bg-blue-50" : ""
          }`}
        >
          {incident.title ?? formatCause(incident.cause)}
        </h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-3 p-4 rounded border">
          <p className="text-xs text-muted-foreground">Duration</p>
          <p className="font-medium tabular-nums">{formatDuration(duration)}</p>
        </div>
        <div className="flex items-center gap-3 p-4 rounded border border-border bg-surface">
          <div>
            <p className="text-xs text-muted-foreground">Started</p>
            <p className="font-medium">{formatDate(incident.startedAt)}</p>
          </div>
        </div>
        {incident.acknowledgedAt && (
          <div className="flex items-center gap-3 p-4 rounded border border-border bg-surface">
            <div>
              <p className="text-xs text-muted-foreground">Acknowledged</p>
              <p className="font-medium">
                {formatDate(incident.acknowledgedAt)}
              </p>
            </div>
          </div>
        )}
        {incident.resolvedAt && (
          <div className="flex items-center gap-3 p-4 rounded border border-border bg-surface">
            <div>
              <p className="text-xs text-muted-foreground">Resolved</p>
              <p className="font-medium">{formatDate(incident.resolvedAt)}</p>
            </div>
          </div>
        )}
      </div>

      {incident.description && (
        <section className="space-y-3">
          <h2 className="font-medium bg-blue-50 w-fit">Description</h2>
          <p className="text-sm font-light">{incident.description}</p>
        </section>
      )}

      {incident.hint && (
        <section className="space-y-3">
          <h2 className="font-medium bg-blue-50 w-fit">Hint</h2>
          <p className="text-sm font-light">{incident.hint}</p>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Post Mortem</h2>
          {showSaved && (
            <p className="text-xs animate-pulse text-muted-foreground">Saved</p>
          )}
        </div>

        <div className="space-y-4 p-2">
          <input
            value={postMortemTitle}
            onChange={(e) => setPostMortemTitle(e.target.value)}
            placeholder="Post mortem title..."
            className="w-full outline-none active:outline-none"
          />
          <TiptapEditor
            content={postMortemContent}
            onChange={setPostMortemContent}
            placeholder="Describe what happened..."
          />
        </div>
      </section>
    </div>
  );
}
