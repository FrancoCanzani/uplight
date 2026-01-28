export type ContentType = "integration" | "use-case" | "comparison" | "guide";

export interface ContentFrontmatter {
  title: string;
  description: string;
  slug: string;
  type: ContentType;
  publishedAt: string;
  updatedAt?: string;
  author?: string;
  keywords?: string[];
  featured?: boolean;
  // Type-specific fields
  integration?: string; // for integration guides
  competitor?: string; // for comparison pages
  industry?: string; // for use-case pages
}

export interface ContentItem {
  frontmatter: ContentFrontmatter;
  content: string;
  html: string;
}

export interface ContentMetadata {
  frontmatter: ContentFrontmatter;
  path: string;
}
