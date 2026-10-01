"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

// Follows the system setting until the user picks a theme; the choice is
// stored in localStorage and applied as a class on <html>
const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
};

export default ThemeProvider;
