"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { features } from "@/config/site";
import { useTheme } from "next-themes";

const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();

  if (!features.themeSwitching) return null;

  // Both icons render and CSS picks one, so server and client markup match
  // before the theme is known
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      title="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="h-9 w-9 text-muted-foreground"
    >
      <Sun className="h-4 w-4 hidden dark:block" />
      <Moon className="h-4 w-4 dark:hidden" />
    </Button>
  );
};

export default ThemeToggle;
