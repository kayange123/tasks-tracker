import { legalConfig } from "@/config/site";

interface LegalDocumentProps {
  title: string;
  summary: string;
  children: React.ReactNode;
}

// Shared layout for the Privacy Policy and Terms of Service
export const LegalDocument = ({
  title,
  summary,
  children,
}: LegalDocumentProps) => {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-16 md:px-8 md:py-20">
      <header className="mb-10 flex flex-col gap-3 border-b pb-8">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {title}
        </h1>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          {summary}
        </p>
        <p className="text-[13px] text-muted-foreground">
          Effective {legalConfig.effectiveDate}
        </p>
      </header>
      <div className="flex flex-col gap-10">{children}</div>
    </article>
  );
};

interface LegalSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

export const LegalSection = ({ id, title, children }: LegalSectionProps) => {
  return (
    <section id={id} className="flex scroll-mt-24 flex-col gap-3">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-foreground/90 [&_a]:font-medium [&_a]:text-primary-text [&_a]:underline-offset-2 [&_a:hover]:underline [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
};

// The contact address, or a visible placeholder until it's configured
export const ContactEmail = () => {
  const { contactEmail } = legalConfig;
  if (!contactEmail) {
    return (
      <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
        [contact email]
      </span>
    );
  }
  return <a href={`mailto:${contactEmail}`}>{contactEmail}</a>;
};
