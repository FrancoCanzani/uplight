import { Link, useParams } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StatusPageResponse } from "../schemas";

export function StatusPageItem({ page }: { page: StatusPageResponse }) {
  const { teamId } = useParams({ from: "/(dashboard)/$teamId/status-pages/" });

  const statusPageUrl = `${window.location.origin}/status/${page.slug}`;

  return (
    <div className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/$teamId/status-pages/$pageId"
              params={{ teamId, pageId: String(page.id) }}
              className="font-medium hover:underline"
            >
              {page.name}
            </Link>
            {!page.isPublic && (
              <Badge variant="secondary" className="text-xs">
                Private
              </Badge>
            )}
          </div>
          {page.description && (
            <p className="text-sm text-muted-foreground mb-2">
              {page.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="font-mono">/{page.slug}</span>
            <span>Created {new Date(page.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            render={
              <a
                href={statusPageUrl}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
