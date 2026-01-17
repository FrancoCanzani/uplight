import { Check, Info, Loader2, Triangle, X } from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <Check className="size-3" />,
        info: <Info className="size-3" />,
        warning: <Triangle className="size-3" />,
        error: <X className="size-3" />,
        loading: <Loader2 className="size-3 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: "cn-toast font-mono",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
