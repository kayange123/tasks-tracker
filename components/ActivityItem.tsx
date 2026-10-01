import { AuditLog } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { generateLogMessage } from "@/lib/generateLogMessage";
import { format, formatDistanceToNowStrict } from "date-fns";

interface ActivityItemProps {
  log: AuditLog;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

// One audit log entry; lists add their own spacing and dividers
const ActivityItem = ({ log }: ActivityItemProps) => {
  const createdAt = new Date(log.createdAt);

  return (
    <li className="flex items-center gap-3">
      <Avatar className="size-7">
        <AvatarImage src={log.userImage} alt="" />
        <AvatarFallback className="text-[11px] font-semibold">
          {initials(log.userName)}
        </AvatarFallback>
      </Avatar>
      <p className="min-w-0 flex-1 text-sm leading-snug">
        <span className="font-semibold">{log.userName}</span>
        {generateLogMessage(log)}
      </p>
      <time
        dateTime={createdAt.toISOString()}
        title={format(createdAt, "MMM d, yyyy 'at' HH:mm")}
        className="shrink-0 text-xs text-muted-foreground"
      >
        {formatDistanceToNowStrict(createdAt, { addSuffix: true })}
      </time>
    </li>
  );
};

export default ActivityItem;
