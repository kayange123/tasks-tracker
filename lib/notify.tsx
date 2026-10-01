import Toast, { type ToastAction, type ToastKind } from "@/components/Toast";
import { toast } from "sonner";

interface NotifyOptions {
  description?: string;
  action?: ToastAction;
  // Pass an existing toast id to replace it, e.g. a loading toast
  id?: string | number;
}

interface UndoOptions {
  description?: string;
  onUndo: () => void;
}

const DURATION = { default: 4000, error: 6000, undo: 6000 };

const show = (
  kind: ToastKind,
  title: string,
  { id, ...options }: NotifyOptions = {},
  duration = DURATION.default
) =>
  toast.custom(
    (toastId) => (
      <Toast
        id={toastId}
        kind={kind}
        title={title}
        duration={duration}
        {...options}
      />
    ),
    { id, duration: kind === "loading" ? Infinity : duration }
  );

// App-wide notifications. Titles are short sentence-case statements;
// descriptions say what changed or what to do next.
export const notify = {
  success: (title: string, options?: NotifyOptions) =>
    show("success", title, options),
  error: (title: string, options?: NotifyOptions) =>
    show("error", title, options, DURATION.error),
  info: (title: string, options?: NotifyOptions) =>
    show("info", title, options),
  // Stays until dismissed or replaced by passing its id to another call
  loading: (title: string, options?: NotifyOptions) =>
    show("loading", title, options),
  undo: (title: string, { onUndo, ...options }: UndoOptions) =>
    show(
      "undo",
      title,
      { ...options, action: { label: "Undo", onClick: onUndo } },
      DURATION.undo
    ),
  dismiss: (id?: string | number) => toast.dismiss(id),
};
