import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TOCItem {
  level: number;
  text: string;
  id: string;
}

interface TableOfContentsProps {
  items: TOCItem[];
  className?: string;
}

export function TableOfContents({ items, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-80px 0px -80% 0px",
        threshold: 0,
      }
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [items]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // Only show h2 and h3 in TOC
  const filteredItems = items.filter((item) => item.level === 2 || item.level === 3);

  if (filteredItems.length === 0) {
    return null;
  }

  return (
    <nav className={cn("space-y-1", className)}>
      <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
        On this page
      </h2>
      <ul className="space-y-1">
        {filteredItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => handleClick(item.id)}
              className={cn(
                "text-xs text-left w-full hover:text-foreground transition-colors",
                item.level === 3 && "pl-3",
                activeId === item.id
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
