import { registerContent } from "./registry";
import { parseMarkdown } from "./parser";

const contentFiles = import.meta.glob('/content/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
});

for (const [path, content] of Object.entries(contentFiles)) {
  if (path.includes('/_')) continue;

  const item = parseMarkdown(content as string);
  registerContent(item.frontmatter.slug, item);
}
