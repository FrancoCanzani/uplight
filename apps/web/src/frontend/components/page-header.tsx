import type { ReactNode } from "react";
import { MobileMenu } from "./mobile-menu";

interface PageHeaderProps {
  title: string;
  actions?: ReactNode;
}

export function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <header className="flex items-center h-14 justify-between gap-4">
      <div className="flex items-center gap-x-2">
        <h1 className="text-xl font-medium truncate">{title}</h1>
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
