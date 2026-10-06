import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between gap-4 px-4 text-[13px] text-muted-foreground md:px-8">
        <span>© {new Date().getFullYear()} Taskier</span>
        <nav aria-label="Legal" className="flex items-center gap-5">
          <Link
            href="/privacy"
            className="rounded-sm transition-colors hover:text-foreground"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="rounded-sm transition-colors hover:text-foreground"
          >
            Terms
          </Link>
          <Link
            href="https://bit.ly/kayange"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm transition-colors hover:text-foreground"
          >
            Meet the developer
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
