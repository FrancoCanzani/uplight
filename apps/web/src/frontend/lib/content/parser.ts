import type { ContentFrontmatter, ContentItem } from "./types";

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

  frontmatterStr.split("\n").forEach((line) => {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) return;

    const key = line.slice(0, colonIndex).trim();
    let value: unknown = line.slice(colonIndex + 1).trim();

    if (typeof value === "string" && value.startsWith("[") && value.endsWith("]")) {
      value = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""));
    } else if (value === "true") {
      value = true;
    } else if (value === "false") {
      value = false;
    } else if (
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

function markdownToHtml(markdown: string): string {
  let html = markdown;

  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  html = html.replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>");

  html = html.replace(/\*(.*?)\*/gim, "<em>$1</em>");

  html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>');

  html = html.replace(/!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2" />');

  html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, "<pre><code>$2</code></pre>");

  html = html.replace(/`(.*?)`/gim, "<code>$1</code>");

  html = html.replace(/^\s*-\s+(.*$)/gim, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)\n(?=<li>)/gim, "$1");
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/gim, "<ul>$1</ul>");

  html = html.replace(/^\s*\d+\.\s+(.*$)/gim, "<li>$1</li>");

  html = html.replace(/^>\s+(.*$)/gim, "<blockquote>$1</blockquote>");

  html = html.replace(/\n\n/gim, "</p><p>");
  html = `<p>${html}</p>`;

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

export function parseMarkdown(rawContent: string): ContentItem {
  const { frontmatter, body } = parseFrontmatter(rawContent);
  const html = markdownToHtml(body);

  return {
    frontmatter: frontmatter as unknown as ContentFrontmatter,
    content: body,
    html,
  };
}

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
