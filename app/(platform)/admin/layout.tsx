import AccountButton from "@/components/account/AccountButton";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { getOperatorId } from "@/lib/operator";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata = { title: "Operator console", robots: "noindex" };

// Only operators (Clerk public metadata role "admin") see the console;
// everyone else gets a 404, so its existence isn't revealed. Pages, routes
// and actions check
// again on their own.
const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  if (!(await getOperatorId())) notFound();

  return (
    <div className="min-h-full">
      <nav className="sticky top-0 z-50 flex h-14 items-center gap-3 border-b bg-card px-3 md:px-5">
        <Logo compact />
        <Link
          href="/admin"
          className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary-text"
        >
          Operator console
        </Link>
        <div className="ml-auto flex items-center gap-1.5 md:gap-2">
          <ThemeToggle />
          <AccountButton />
        </div>
      </nav>
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 md:px-6">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
