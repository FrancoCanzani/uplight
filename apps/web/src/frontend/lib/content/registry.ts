import type { ContentFrontmatter, ContentItem, ContentType } from "./types";

const contentRegistry = new Map<string, ContentItem>();

export function registerContent(slug: string, item: ContentItem) {
  contentRegistry.set(slug, item);
}

export function getContent(slug: string): ContentItem | undefined {
  return contentRegistry.get(slug);
}

export function getAllContent(): ContentItem[] {
  return Array.from(contentRegistry.values());
}

export function getContentByType(type: ContentType): ContentItem[] {
  return getAllContent().filter((item) => item.frontmatter.type === type);
}

export function getFeaturedContent(): ContentItem[] {
  return getAllContent().filter((item) => item.frontmatter.featured);
}

export function getContentMetadata(): ContentFrontmatter[] {
  return getAllContent().map((item) => item.frontmatter);
}

export function getContentByIntegration(integration: string): ContentItem[] {
  return getAllContent().filter(
    (item) => item.frontmatter.integration === integration
  );
}

export function getContentByIndustry(industry: string): ContentItem[] {
  return getAllContent().filter(
    (item) => item.frontmatter.industry === industry
  );
}

export function getContentByCompetitor(competitor: string): ContentItem[] {
  return getAllContent().filter(
    (item) => item.frontmatter.competitor === competitor
  );
}

export { contentRegistry };
