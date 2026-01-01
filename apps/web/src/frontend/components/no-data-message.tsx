import { cn } from "@/lib/utils";

export default function NoDataMessage({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-muted-foreground border border-dashed rounded text-xs py-8 text-center",
        className,
      )}
    >
      {text}
    </p>
  );
}
