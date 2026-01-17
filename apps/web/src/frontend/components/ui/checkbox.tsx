import { Checkbox as Checkboxrimitive } from "@base-ui/react/checkbox";
import { Check } from "lucide-react";
import { cn } from "@lib/utils";

function Checkbox({ className, ...props }: Checkboxrimitive.Root.Props) {
  return (
    <Checkboxrimitive.Root
      data-slot="checkbox"
      className={cn(
        "border-input dark:bg-input/20 dark:bg-input/30 data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary data-checked:border-primary aria-invalid:aria-checked:border-primary aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 flex size-4 items-center justify-center -[4px] border transition-shadow group-has-disabled/field:opacity-50 focus-visible:ring-[2px] aria-invalid:ring-[2px] peer relative shrink-0 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <Checkboxrimitive.Indicator
        data-slot="checkbox-indicator"
        className="[&>svg]:size-3.5 grid place-content-center text-current transition-none"
      >
        <Check />
      </Checkboxrimitive.Indicator>
    </Checkboxrimitive.Root>
  );
}

export { Checkbox };
