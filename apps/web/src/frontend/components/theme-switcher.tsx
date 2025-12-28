import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "next-themes";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const handleValueChange = (value: string | null) => {
    if (value) {
      setTheme(value);
    }
  };

  const getThemeLabel = (currentTheme: string | undefined) => {
    if (currentTheme === "light") return "Light";
    if (currentTheme === "dark") return "Dark";
    return "System";
  };

  return (
    <Select value={theme || "system"} onValueChange={handleValueChange}>
      <SelectTrigger size="xs" className={"min-w-24"}>
        <SelectValue>{getThemeLabel(theme)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">Light</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
        <SelectItem value="system">System</SelectItem>
      </SelectContent>
    </Select>
  );
}
