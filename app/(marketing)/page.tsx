import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Columns3, History, Users } from "lucide-react";

const PREVIEW = [
  {
    title: "Backlog",
    cards: [
      "Draft onboarding emails",
      "Audit pricing page copy",
      "Plan Q1 offsite",
    ],
  },
  {
    title: "In progress",
    cards: ["Redesign card modal", "Migrate to Tailwind v4"],
  },
  { title: "In review", cards: ["Stripe webhook tests"] },
  { title: "Done", cards: ["Upgrade to Next.js 15", "Activity log filters"] },
];

const FEATURES = [
  {
    icon: Columns3,
    title: "Boards that move with you",
    body: "Break work into lists and cards, then drag them into place as plans change.",
  },
  {
    icon: History,
    title: "Every change on record",
    body: "An activity log tracks who created, updated or deleted each board, list and card.",
  },
  {
    icon: Users,
    title: "Built for organizations",
    body: "Each organization gets its own boards. Switch between teams in one click.",
  },
];

const MarketingPage = () => {
  return (
    <div className="flex flex-col gap-24 pb-24 md:gap-28">
      <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-4 pt-20 text-center md:pt-24">
        <span className="rounded-full bg-primary-soft px-3 py-1.5 text-[13px] font-medium text-primary-text">
          Kanban boards for teams
        </span>
        <h1 className="text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
          Organize your team’s tasks, one board at a time
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Collaborate, manage projects and reach new productivity peaks. From
          startups to home office, the way your team works is unique. Accomplish
          it all with Taskier.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button
            size="lg"
            asChild
            className="h-12 rounded-xl px-5.5 text-[15px]"
          >
            <Link href="/sign-up">Get Taskier for free</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="h-12 rounded-xl px-5.5 text-[15px]"
          >
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4">
        {/* Decorative preview of a board, not interactive */}
        <div
          role="img"
          aria-label="Preview of a Taskier board with Backlog, In progress, In review and Done lists"
          className="overflow-hidden rounded-2xl border bg-card shadow-[0_24px_48px_-24px_rgb(24_24_27/0.18)] dark:shadow-[0_24px_48px_-24px_rgb(0_0_0/0.6)]"
        >
          <div className="flex h-12 items-center gap-2.5 border-b px-5">
            <span className="size-4.5 rounded-[5px] bg-primary/30" />
            <span className="text-sm font-semibold">Product roadmap</span>
            <span className="ml-auto text-xs text-muted-foreground">
              Northwind Labs
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3.5 bg-background p-5 sm:grid-cols-2 lg:grid-cols-4">
            {PREVIEW.map((list) => (
              <div
                key={list.title}
                className="flex flex-col gap-2 rounded-xl bg-surface-2 p-2.5"
              >
                <div className="flex items-center gap-2 px-1 pt-0.5 pb-1">
                  <span className="text-[13px] font-semibold">
                    {list.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {list.cards.length}
                  </span>
                </div>
                {list.cards.map((card) => (
                  <div
                    key={card}
                    className="rounded-lg border bg-card px-3 py-2.5 text-left text-[13px] leading-snug"
                  >
                    {card}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-label="Features"
        className="mx-auto grid w-full max-w-5xl gap-10 px-4 md:grid-cols-3 md:gap-8"
      >
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex flex-col gap-3">
            <span className="flex size-10 items-center justify-center rounded-[10px] bg-primary-soft text-primary-text">
              <Icon aria-hidden className="size-5" />
            </span>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              {body}
            </p>
          </div>
        ))}
      </section>

      <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 px-4">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Simple pricing
        </h2>
        <div className="grid w-full gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-2xl border bg-card p-7">
            <h3 className="text-[15px] font-semibold">Free</h3>
            <p className="text-4xl font-semibold tracking-tight">$0</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Up to 5 boards per organization, with unlimited lists and cards.
            </p>
            <Button
              variant="outline"
              asChild
              className="mt-auto h-11 rounded-[10px]"
            >
              <Link href="/sign-up">Get started</Link>
            </Button>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl border border-primary bg-card p-7">
            <h3 className="text-[15px] font-semibold text-primary-text">Pro</h3>
            <p className="text-4xl font-semibold tracking-tight">
              $20
              <span className="text-[15px] font-normal text-muted-foreground">
                {" "}
                / month
              </span>
            </p>
            <ul className="flex flex-col gap-2 text-sm">
              <li className="flex items-center gap-2.5">
                <Check
                  aria-hidden
                  className="size-4 shrink-0 text-primary-text"
                />
                Unlimited boards for the whole organization
              </li>
              <li className="flex items-center gap-2.5">
                <Check
                  aria-hidden
                  className="size-4 shrink-0 text-primary-text"
                />
                Manage or cancel any time
              </li>
            </ul>
            <Button asChild className="mt-auto h-11 rounded-[10px]">
              <Link href="/sign-up">Sign up to upgrade</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MarketingPage;
