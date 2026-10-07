interface SectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  tone?: "default" | "danger";
}

// A titled card, matching the organization settings sections
const Section = ({
  title,
  description,
  children,
  tone = "default",
}: SectionProps) => (
  <section
    className={`flex flex-col gap-4 rounded-xl border bg-card p-5 ${
      tone === "danger" ? "border-destructive/40" : ""
    }`}
  >
    <div className="flex flex-col gap-1">
      <h2
        className={`text-sm font-medium ${
          tone === "danger" ? "text-destructive-text" : ""
        }`}
      >
        {title}
      </h2>
      {description && (
        <p className="text-[13px] text-muted-foreground">{description}</p>
      )}
    </div>
    {children}
  </section>
);

export default Section;
