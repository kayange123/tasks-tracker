"use client";

import { KeyboardEventHandler, forwardRef } from "react";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import { useFormStatus } from "react-dom";

interface FormTextAreaProps {
  id: string;
  label?: string;
  // Keep the label for screen readers only, e.g. inline forms
  labelHidden?: boolean;
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
      labelHidden,
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
    const fieldErrors = errors?.[id];
    const isInvalid = !!fieldErrors?.length;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <Label
            htmlFor={id}
            className={cn("text-[13px] font-medium", labelHidden && "sr-only")}
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
          aria-invalid={isInvalid || undefined}
          aria-describedby={isInvalid ? `${id}-error` : undefined}
          className={cn("resize-none text-sm", className)}
          defaultValue={defaultValue}
        />
        {isInvalid && (
          <div id={`${id}-error`} aria-live="polite">
            {fieldErrors.map((error) => (
              <p key={error} className="text-xs text-destructive-text">
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
