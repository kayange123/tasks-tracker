import { ChevronLeft } from "lucide-react";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  back?: boolean;
}

const PageHeader = ({ title, description, back }: PageHeaderProps) => (
  <div className="flex flex-col gap-2">
    {back && (
      <Link
        href="/admin"
        className="flex w-fit items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft aria-hidden className="size-4" />
        Console
      </Link>
    )}
    <h1 className="text-[22px] leading-tight font-semibold tracking-tight break-words">
      {title}
    </h1>
    {description && (
      <div className="text-[13px] text-muted-foreground">{description}</div>
    )}
  </div>
);

export default PageHeader;
