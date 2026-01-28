import { createFileRoute, notFound } from "@tanstack/react-router";
import { getContent, extractTableOfContents } from "@/lib/content";
import { createArticleSchema, createBreadcrumbSchema } from "@/components/seo";
import { ArticleLayout } from "@/components/content";

export const Route = createFileRoute("/guides/$slug")({
  loader: ({ params }) => {
    const content = getContent(params.slug);
    if (!content || content.frontmatter.type !== "guide") {
      throw notFound();
    }
    const toc = extractTableOfContents(content.content);
    return { content, toc };
  },
  component: GuidePage,
  head: ({ loaderData, params }) => {
    const { content } = loaderData;
    const { title, description, publishedAt, updatedAt, author } = content.frontmatter;
    const canonicalUrl = `https://uplight.dev/guides/${params.slug}`;

    return {
      meta: [
        { title: `${title} | Uplight` },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: canonicalUrl }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify([
            createArticleSchema({ title, description, url: canonicalUrl, publishedAt, updatedAt, author }),
            createBreadcrumbSchema([
              { name: "Home", url: "https://uplight.dev" },
              { name: "Guide", url: "https://uplight.dev/guides" },
              { name: title, url: canonicalUrl },
            ]),
          ]),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Guide not found.</p>
    </div>
  ),
});

function GuidePage() {
  const { content, toc } = Route.useLoaderData();

  return (
    <ArticleLayout
      frontmatter={content.frontmatter}
      html={content.html}
      toc={toc}
    />
  );
}
