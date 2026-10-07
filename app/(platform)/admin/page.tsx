import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { searchDirectory } from "@/lib/operatorData";
import { db } from "@/lib/prisma";
import { format } from "date-fns";
import { Building2, ChevronRight, Search, User } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import PageHeader from "./_components/PageHeader";
import Section from "./_components/Section";

const ACTION_LABELS: Record<string, string> = {
  EXPORT_USER: "Exported user",
  DELETE_USER: "Deleted user",
  EXPORT_ORGANIZATION: "Exported organization",
  DELETE_ORGANIZATION: "Deleted organization",
};

const SearchResults = async ({ query }: { query: string }) => {
  const results = await searchDirectory(query);

  if (results.length === 0) {
    return (
      <p className="text-[13px] text-muted-foreground">
        No users or organizations match “{query}”. Organizations deleted in
        Clerk can still have data; check{" "}
        <Link href="/admin/orphans" className="text-primary-text underline">
          orphaned organizations
        </Link>
        .
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y rounded-lg border">
      {results.map((result) => {
        const Icon = result.type === "user" ? User : Building2;
        return (
          <li key={result.id}>
            <Link
              href={`/admin/${result.type === "user" ? "users" : "organizations"}/${result.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-accent"
            >
              <Icon
                aria-hidden
                className="size-4 shrink-0 text-muted-foreground"
              />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">
                  {result.title}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {[result.subtitle, result.id].filter(Boolean).join(" · ")}
                </span>
              </span>
              <ChevronRight
                aria-hidden
                className="ml-auto size-4 shrink-0 text-muted-foreground"
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

SearchResults.Skeleton = function SearchResultsSkeleton() {
  return (
    <div className="flex flex-col gap-2" aria-busy="true">
      <Skeleton className="h-14 rounded-lg" />
      <Skeleton className="h-14 rounded-lg" />
    </div>
  );
};

const RecentActions = async () => {
  const actions = await db.adminAction.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  if (actions.length === 0) {
    return (
      <p className="text-[13px] text-muted-foreground">
        No exports or deletions yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y text-sm">
      {actions.map((action) => (
        <li
          key={action.id}
          className="flex flex-col gap-0.5 py-2.5 first:pt-0 last:pb-0"
        >
          <span>
            <span className="font-medium">
              {ACTION_LABELS[action.action] ?? action.action}
            </span>{" "}
            <span className="break-all text-muted-foreground">
              {action.targetId}
            </span>
          </span>
          <span className="text-xs text-muted-foreground">
            {format(action.createdAt, "MMM d, yyyy 'at' HH:mm")} by{" "}
            {action.adminUserId}
            {action.details ? ` · ${action.details}` : ""}
          </span>
        </li>
      ))}
    </ul>
  );
};

RecentActions.Skeleton = function RecentActionsSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true">
      <Skeleton className="h-9" />
      <Skeleton className="h-9" />
      <Skeleton className="h-9" />
    </div>
  );
};

const AdminPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) => {
  const query = ((await searchParams).q ?? "").trim();

  return (
    <>
      <PageHeader
        title="Operator console"
        description="Handle data requests: find a person or organization, export their data, or delete it."
      />
      <Section
        title="Find a user or organization"
        description="Search by email, name, slug, or a user_ or org_ ID."
      >
        <form action="/admin" className="flex gap-2">
          <Input
            name="q"
            defaultValue={query}
            placeholder="name@example.com or org_…"
            aria-label="Search"
            className="h-9"
          />
          <Button type="submit">
            <Search aria-hidden />
            Search
          </Button>
        </form>
        {query && (
          // Keyed by query so the previous search's results never linger
          <Suspense key={query} fallback={<SearchResults.Skeleton />}>
            <SearchResults query={query} />
          </Suspense>
        )}
      </Section>
      <Section
        title="Orphaned organizations"
        description="Data left behind by organizations that no longer exist in Clerk."
      >
        <Button asChild variant="outline" className="self-start">
          <Link href="/admin/orphans">Review orphaned organizations</Link>
        </Button>
      </Section>
      <Section
        title="Recent actions"
        description="The last 20 exports and deletions from this console."
      >
        <Suspense fallback={<RecentActions.Skeleton />}>
          <RecentActions />
        </Suspense>
      </Section>
    </>
  );
};

export default AdminPage;
