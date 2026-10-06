import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  // Hide the wordmark on small screens and keep only the mark
  compact?: boolean;
}

const Logo = ({ className, compact = false }: LogoProps) => {
  return (
    <Link
      href="/"
      aria-label="Taskier home"
      className={cn(
        "flex items-center gap-2.5 rounded-md text-foreground transition-opacity hover:opacity-80",
        className
      )}
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Check aria-hidden strokeWidth={2.75} className="size-4" />
      </span>
      <span
        className={cn(
          "text-base font-semibold tracking-tight",
          compact && "hidden sm:inline"
        )}
      >
        Taskier
      </span>
    </Link>
  );
};

export default Logo;
