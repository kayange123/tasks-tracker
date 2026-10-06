import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 md:px-8">
        <Logo />
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/sign-up">Get started</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
