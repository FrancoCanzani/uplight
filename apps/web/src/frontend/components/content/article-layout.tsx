import { Link } from "@tanstack/react-router";
import type { ContentFrontmatter } from "@/lib/content";
import { TableOfContents } from "./table-of-contents";
import { CTASection } from "./cta-section";
import { RelatedContent } from "./related-content";

interface ArticleLayoutProps {
  frontmatter: ContentFrontmatter;
  html: string;
  toc?: Array<{ level: number; text: string; id: string }>;
  relatedSlugs?: string[];
}

const TYPE_LABELS: Record<string, string> = {
  integration: "Integration Guide",
  "use-case": "Use Case",
  comparison: "Comparison",
  guide: "Guide",
};

const TYPE_PATHS: Record<string, string> = {
  integration: "/guides/integrations",
  "use-case": "/use-cases",
  comparison: "/compare",
  guide: "/guides",
};

export function ArticleLayout({
  frontmatter,
  html,
  toc,
  relatedSlugs,
}: ArticleLayoutProps) {
  const { title, description, type, publishedAt, updatedAt, author } =
    frontmatter;

  const typePath = TYPE_PATHS[type] || "/guides";

  return (
    <div className="min-h-screen font-mono antialiased">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Navigation */}
          <nav className="mb-8">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to home
            </Link>
          </nav>

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <span>/</span>
            <Link to={typePath as "/"} className="hover:text-foreground">
              {TYPE_LABELS[type] || "Content"}
            </Link>
            <span>/</span>
            <span className="text-foreground">{title}</span>
          </nav>

          <article className="grid lg:grid-cols-[1fr_250px] gap-12">
            {/* Main content */}
            <div>
              {/* Header */}
              <header className="mb-8 pb-8 border-b border-border/30">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <span className="px-2 py-0.5 bg-surface ring-1 ring-foreground/10">
                    {TYPE_LABELS[type] || type}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-light tracking-tight mb-4">
                  {title}
                </h1>
                <p className="text-sm text-muted-foreground mb-4">
                  {description}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {author && <span>By {author}</span>}
                  <span>
                    Published{" "}
                    {new Date(publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  {updatedAt && updatedAt !== publishedAt && (
                    <span>
                      Updated{" "}
                      {new Date(updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </header>

              {/* Article body */}
              <div
                className="prose prose-sm max-w-none
                  prose-headings:font-light prose-headings:tracking-tight
                  prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4
                  prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-muted-foreground prose-p:leading-relaxed
                  prose-a:text-foreground prose-a:underline prose-a:underline-offset-2
                  prose-strong:text-foreground prose-strong:font-medium
                  prose-code:text-sm prose-code:bg-surface prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                  prose-pre:bg-surface prose-pre:border prose-pre:border-border/30
                  prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                  prose-li:my-1
                  prose-table:text-sm
                  prose-th:bg-surface prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-medium
                  prose-td:px-3 prose-td:py-2 prose-td:border-b prose-td:border-border/30
                  prose-blockquote:border-l-2 prose-blockquote:border-foreground/20 prose-blockquote:pl-4 prose-blockquote:italic"
                dangerouslySetInnerHTML={{ __html: html }}
              />

              {/* CTA */}
              <CTASection className="mt-12" />

              {/* Related content */}
              {relatedSlugs && relatedSlugs.length > 0 && (
                <RelatedContent slugs={relatedSlugs} className="mt-12" />
              )}
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-8">
                {toc && toc.length > 0 && <TableOfContents items={toc} />}
              </div>
            </aside>
          </article>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-border/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Uplight — Open source uptime monitoring</span>
              <Link to="/" className="hover:text-foreground">
                Home
              </Link>
            </div>
          </footer>
        </div>
      </div>
  );
}
