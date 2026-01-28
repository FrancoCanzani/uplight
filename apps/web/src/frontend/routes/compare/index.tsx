import { createFileRoute, Link } from "@tanstack/react-router";
import { getContentByType } from "@/lib/content";

export const Route = createFileRoute("/compare/")({
  component: CompareIndex,
  head: () => ({
    meta: [
      { title: "Compare | Uplight" },
      {
        name: "description",
        content:
          "Compare Uplight with other uptime monitoring tools. Feature comparisons, pricing, and recommendations.",
      },
    ],
    links: [{ rel: "canonical", href: "https://uplight.dev/compare" }],
  }),
});

function CompareIndex() {
  const comparisons = getContentByType("comparison");

  return (
    <div className="min-h-screen font-mono antialiased">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Navigation */}
          <nav className="mb-8">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to home
            </Link>
          </nav>

          {/* Header */}
          <header className="mb-12">
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight mb-4">
              Compare Uplight
            </h1>
            <p className="text-sm text-muted-foreground">
              See how Uplight compares to other uptime monitoring tools. Detailed
              feature comparisons to help you choose the right solution.
            </p>
          </header>

          {/* Comparisons */}
          <section className="mb-12">
            {comparisons.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {comparisons.map((item) => (
                  <Link
                    key={item.frontmatter.slug}
                    to="/compare/$slug"
                    params={{ slug: item.frontmatter.slug }}
                    className="group p-4 ring-1 ring-foreground/10 hover:bg-surface transition-colors"
                  >
                    <h3 className="text-sm font-medium group-hover:underline mb-2">
                      {item.frontmatter.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {item.frontmatter.description}
                    </p>
                    {item.frontmatter.competitor && (
                      <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-surface ring-1 ring-foreground/10">
                        vs {item.frontmatter.competitor}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 ring-1 ring-foreground/10">
                <p className="text-sm text-muted-foreground">
                  Comparison articles coming soon.
                </p>
              </div>
            )}
          </section>

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
