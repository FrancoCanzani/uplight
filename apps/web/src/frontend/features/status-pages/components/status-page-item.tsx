import { Link, useParams } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import type { StatusPageResponse } from "../schemas";

export function StatusPageItem({ page }: { page: StatusPageResponse }) {
  const { teamId } = useParams({ from: "/(dashboard)/$teamId/status-pages/" });

  const statusPageUrl = `${window.location.origin}/status/${page.slug}`;

  return (
    <Link
      to="/$teamId/status-pages/$pageId"
      params={{ teamId, pageId: String(page.id) }}
      className="block border border-border/30 p-3 hover:bg-surface transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">{page.name}</span>
          {!page.isPublic && (
            <span className="text-xs text-muted-foreground">(Private)</span>
          )}
        </div>
        <a
          href={statusPageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      {page.description && (
        <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
          {page.description}
        </p>
      )}
      <div className="text-xs text-muted-foreground">/status/{page.slug}</div>
    </Link>
  );
}
