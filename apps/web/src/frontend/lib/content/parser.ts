import type { ContentFrontmatter, ContentItem } from "./types";

/**
 * Parse YAML frontmatter from markdown content
 */
function parseFrontmatter(content: string): {
  frontmatter: Record<string, unknown>;
  body: string;
} {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const [, frontmatterStr, body] = match;
  const frontmatter: Record<string, unknown> = {};

  // Simple YAML parser for frontmatter
  frontmatterStr.split("\n").forEach((line) => {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) return;

    const key = line.slice(0, colonIndex).trim();
    let value: unknown = line.slice(colonIndex + 1).trim();

    // Handle arrays (simple format: [item1, item2])
    if (typeof value === "string" && value.startsWith("[") && value.endsWith("]")) {
      value = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""));
    }
    // Handle booleans
    else if (value === "true") {
      value = true;
    } else if (value === "false") {
      value = false;
    }
    // Handle quoted strings
    else if (
      typeof value === "string" &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }

    frontmatter[key] = value;
  });

  return { frontmatter, body: body.trim() };
}

/**
 * Convert markdown to HTML (basic implementation)
 * For production, consider using a library like marked or remark
 */
function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>");

  // Italic
  html = html.replace(/\*(.*?)\*/gim, "<em>$1</em>");

  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>');

  // Images
  html = html.replace(/!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2" />');

  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, "<pre><code>$2</code></pre>");

  // Inline code
  html = html.replace(/`(.*?)`/gim, "<code>$1</code>");

  // Unordered lists
  html = html.replace(/^\s*-\s+(.*$)/gim, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)\n(?=<li>)/gim, "$1");
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/gim, "<ul>$1</ul>");

  // Ordered lists
  html = html.replace(/^\s*\d+\.\s+(.*$)/gim, "<li>$1</li>");

  // Blockquotes
  html = html.replace(/^>\s+(.*$)/gim, "<blockquote>$1</blockquote>");

  // Paragraphs
  html = html.replace(/\n\n/gim, "</p><p>");
  html = `<p>${html}</p>`;

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/gim, "");
  html = html.replace(/<p>(<h[1-6]>)/gim, "$1");
  html = html.replace(/(<\/h[1-6]>)<\/p>/gim, "$1");
  html = html.replace(/<p>(<ul>)/gim, "$1");
  html = html.replace(/(<\/ul>)<\/p>/gim, "$1");
  html = html.replace(/<p>(<pre>)/gim, "$1");
  html = html.replace(/(<\/pre>)<\/p>/gim, "$1");
  html = html.replace(/<p>(<blockquote>)/gim, "$1");
  html = html.replace(/(<\/blockquote>)<\/p>/gim, "$1");

  return html;
}

/**
 * Parse a markdown file with frontmatter into a ContentItem
 */
export function parseMarkdown(rawContent: string): ContentItem {
  const { frontmatter, body } = parseFrontmatter(rawContent);
  const html = markdownToHtml(body);

  return {
    frontmatter: frontmatter as unknown as ContentFrontmatter,
    content: body,
    html,
  };
}

/**
 * Extract table of contents from markdown
 */
export function extractTableOfContents(
  markdown: string
): Array<{ level: number; text: string; id: string }> {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const toc: Array<{ level: number; text: string; id: string }> = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2];
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    toc.push({ level, text, id });
  }

  return toc;
}
