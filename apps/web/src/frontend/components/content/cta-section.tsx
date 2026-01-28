import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface CTASectionProps {
  title?: string;
  description?: string;
  className?: string;
}

export function CTASection({
  title = "Start monitoring today",
  description = "Free to use, open source, and ready to deploy. No credit card required.",
  className,
}: CTASectionProps) {
  return (
    <section
      className={cn(
        "ring-1 ring-foreground/10 bg-surface/50 p-6 sm:p-8 text-center",
        className
      )}
    >
      <h2 className="text-lg font-light tracking-tight mb-2">{title}</h2>
      <p className="text-xs text-muted-foreground mb-4 max-w-md mx-auto">
        {description}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          to="/signup"
          className="text-xs px-4 py-2 bg-foreground text-background hover:opacity-90 transition-opacity"
        >
          Create free account
        </Link>
        <a
          href="https://github.com/francocanzani/uplight"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-4 py-2 ring-1 ring-foreground/10 hover:bg-surface transition-colors"
        >
          Self-host instead
        </a>
      </div>
    </section>
  );
}
