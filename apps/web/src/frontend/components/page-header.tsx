import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { MobileMenu } from "./mobile-menu";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backLink?: { to: string; params?: Record<string, string> };
  actions?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  backLink,
  actions,
}: PageHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 mb-12">
      <div className="flex items-center gap-3 min-w-0">
        {backLink && (
          <Link
            to={backLink.to}
            params={backLink.params}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ChevronLeft className="size-3.5" />
          </Link>
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-medium truncate">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {actions}
        <div className="md:hidden">
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
