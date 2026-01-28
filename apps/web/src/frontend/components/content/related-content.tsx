import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { getContent } from "@/lib/content";

interface RelatedContentProps {
  slugs: string[];
  className?: string;
}

const TYPE_PATHS: Record<string, string> = {
  integration: "/guides/integrations",
  "use-case": "/use-cases",
  comparison: "/compare",
  guide: "/guides",
};

export function RelatedContent({ slugs, className }: RelatedContentProps) {
  const relatedItems = slugs
    .map((slug) => getContent(slug))
    .filter(Boolean)
    .slice(0, 3);

  if (relatedItems.length === 0) {
    return null;
  }

  return (
    <section className={cn("pt-8 border-t border-border/30", className)}>
      <h2 className="text-sm font-medium mb-4">Related content</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {relatedItems.map((item) => {
          if (!item) return null;
          const { frontmatter } = item;
          const path = `${TYPE_PATHS[frontmatter.type] || "/guides"}/${frontmatter.slug}`;

          return (
            <Link
              key={frontmatter.slug}
              to={path as "/"}
              className="group p-4 ring-1 ring-foreground/10 hover:bg-surface transition-colors"
            >
              <span className="text-xs text-muted-foreground mb-2 block">
                {frontmatter.type}
              </span>
              <h3 className="text-sm font-medium group-hover:underline">
                {frontmatter.title}
              </h3>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
