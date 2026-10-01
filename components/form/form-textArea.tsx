"use client";

import { KeyboardEventHandler, forwardRef } from "react";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import { useFormStatus } from "react-dom";
import { XCircle } from "lucide-react";

interface FormTextAreaProps {
  id: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  errors?: Record<string, string[] | undefined>;
  className?: string;
  onBlur?: () => void;
  onClick?: () => void;
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement> | undefined;
  defaultValue?: string;
}
const FormTextArea = forwardRef<HTMLTextAreaElement, FormTextAreaProps>(
  (
    {
      label,
      placeholder,
      id,
      required,
      disabled,
      errors,
      className,
      onClick,
      onKeyDown,
      onBlur,
      defaultValue,
    },
    ref
  ) => {
    const { pending } = useFormStatus();
    return (
      <div className="space-y-2 w-full">
        <div className="space-y-1 w-full">
          {label && (
            <Label
              htmlFor={id}
              className="text-xs font-semibold text-neutral-700"
            >
              {label}
            </Label>
          )}
          <Textarea
            ref={ref}
            onClick={onClick}
            placeholder={placeholder}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            required={required}
            name={id}
            id={id}
            disabled={pending || disabled}
            className={cn(
              "resize-none focus-visible:ring-0 focus-visible:ring-offset-0 ring-0 focus:ring-0 outline-hidden shadow-xs",
              className
            )}
            aria-describedby={`${id}-error`}
            defaultValue={defaultValue}
          />
        </div>
        {errors && (
          <div
            className="mt-2 text-xs text-red-500"
            id={`${id}-error`}
            aria-live="polite"
          >
            {errors?.[id]?.map((error: string) => (
              <p
                key={error}
                className="flex items-center font-medium p-2 border border-red-500 bg-rose-500/10 rounded-sm"
              >
                <XCircle className="h-4 w-4 mr-2" />
                {error}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }
);

FormTextArea.displayName = "FormTextArea";

export default FormTextArea;
