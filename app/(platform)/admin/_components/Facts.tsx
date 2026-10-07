// Label and value pairs, e.g. an account's email and sign-up date
const Facts = ({ items }: { items: [string, React.ReactNode][] }) => (
  <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
    {items.map(([label, value]) => (
      <div key={label} className="flex min-w-0 flex-col gap-0.5">
        <dt className="text-[13px] text-muted-foreground">{label}</dt>
        <dd className="font-medium break-words">{value}</dd>
      </div>
    ))}
  </dl>
);

export default Facts;
