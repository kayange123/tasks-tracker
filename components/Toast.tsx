"use client";

import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Check,
  Info,
  Loader2,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

export type ToastKind = "success" | "error" | "info" | "loading" | "undo";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastProps {
  id: string | number;
  kind: ToastKind;
  title: string;
  description?: string;
  action?: ToastAction;
  // How long the toast stays up; the undo variant draws it as a countdown
  duration?: number;
}

const ICONS = {
  success: Check,
  error: AlertTriangle,
  info: Info,
  loading: Loader2,
  undo: Trash2,
};

const ICON_STYLES = {
  success: "bg-success-soft text-success",
  error: "bg-destructive-soft text-destructive-text",
  info: "bg-primary-soft text-primary-text",
  loading: "bg-primary-soft text-primary-text",
  undo: "bg-muted text-foreground",
};

// Toast body rendered through sonner's toast.custom, matching the redesign
const Toast = ({
  id,
  kind,
  title,
  description,
  action,
  duration,
}: ToastProps) => {
  const Icon = ICONS[kind];

  return (
    <div className="w-(--width) max-w-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-lg">
      <div className="flex items-start gap-3 py-3.5 pr-3.5 pl-4">
        <span
          className={cn(
            "flex size-6.5 shrink-0 items-center justify-center rounded-full",
            ICON_STYLES[kind]
          )}
        >
          <Icon
            aria-hidden
            strokeWidth={2.5}
            className={cn(
              "size-3.5",
              kind === "loading" && "motion-safe:animate-spin"
            )}
          />
        </span>
        <div className="flex min-w-0 grow flex-col gap-0.5 pt-px">
          <p className="text-sm leading-snug font-medium">{title}</p>
          {description && (
            <p className="text-[13px] leading-normal text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {action && (
          <button
            type="button"
            onClick={() => {
              toast.dismiss(id);
              action.onClick();
            }}
            className={cn(
              "inline-flex h-7.5 shrink-0 items-center gap-1.5 rounded-md px-3 text-[13px] transition-colors",
              kind === "undo"
                ? "bg-primary-soft font-semibold text-primary-text hover:bg-primary-soft/70"
                : "border bg-card font-medium hover:bg-accent"
            )}
          >
            {kind === "undo" && (
              <RotateCcw aria-hidden strokeWidth={2.4} className="size-3.5" />
            )}
            {action.label}
          </button>
        )}
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => toast.dismiss(id)}
          className="-mt-1 -mr-1.5 flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent"
        >
          <X aria-hidden className="size-3.5" />
        </button>
      </div>
      {kind === "undo" && duration && (
        <div aria-hidden className="h-0.75 bg-muted">
          <div
            className="toast-countdown h-full bg-primary"
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      )}
    </div>
  );
};

export default Toast;
