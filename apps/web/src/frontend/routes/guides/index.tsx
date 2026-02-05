import { createFileRoute, Link } from "@tanstack/react-router";
import { getContentByType } from "@/lib/content";

export const Route = createFileRoute("/guides/")({
  component: GuidesIndex,
  head: () => ({
    meta: [
      { title: "Guides | Uplight" },
      {
        name: "description",
        content:
          "Learn how to use Uplight for uptime monitoring. Step-by-step guides, tutorials, and best practices.",
      },
    ],
    links: [{ rel: "canonical", href: "https://uplight.dev/guides" }],
  }),
});

function GuidesIndex() {
  const guides = getContentByType("guide");
  const integrationGuides = getContentByType("integration");

  return (
    <div className="min-h-screen font-classic antialiased">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Navigation */}
          <nav className="mb-8">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to home
            </Link>
          </nav>

          {/* Header */}
          <header className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Guides
            </h1>
            <p className="text-sm text-muted-foreground">
              Learn how to use Uplight for uptime monitoring. Step-by-step guides,
              tutorials, and best practices.
            </p>
          </header>

          {/* Integration Guides */}
          {integrationGuides.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-bold mb-4">
                Integration Guides
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {integrationGuides.map((item) => (
                  <Link
                    key={item.frontmatter.slug}
                    to="/guides/integrations/$slug"
                    params={{ slug: item.frontmatter.slug }}
                    className="group p-4 ring-1 ring-foreground/10 hover:bg-surface transition-colors"
                  >
                    <h3 className="text-sm font-medium group-hover:underline mb-2">
                      {item.frontmatter.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {item.frontmatter.description}
                    </p>
                  </Link>
                ))}
              </div>
              {integrationGuides.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Integration guides coming soon.
                </p>
              )}
            </section>
          )}

          {/* How-to Guides */}
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">
              How-to Guides
            </h2>
            {guides.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {guides.map((item) => (
                  <Link
                    key={item.frontmatter.slug}
                    to="/guides/$slug"
                    params={{ slug: item.frontmatter.slug }}
                    className="group p-4 ring-1 ring-foreground/10 hover:bg-surface transition-colors"
                  >
                    <h3 className="text-sm font-medium group-hover:underline mb-2">
                      {item.frontmatter.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {item.frontmatter.description}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                How-to guides coming soon.
              </p>
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
