"use client";

import { forwardRef } from "react";
import { useFormStatus } from "react-dom";
import { Label } from "@/components/ui/label";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

interface FormInputProps {
  id: string;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  errors?: Record<string, string[] | undefined>;
  // Client-side message shown when there are no server errors
  hint?: string;
  invalid?: boolean;
  className?: string;
  defaultValue?: string;
  onBlur?: () => void;
  onChange?: (value: string) => void;
}
const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      id,
      label,
      placeholder,
      type,
      required,
      disabled,
      errors,
      hint,
      invalid,
      className,
      defaultValue = "",
      onBlur,
      onChange,
    },
    ref
  ) => {
    const { pending } = useFormStatus();
    const fieldErrors = errors?.[id];
    const isInvalid = invalid || !!fieldErrors?.length;
    const describedBy =
      fieldErrors?.length || hint ? `${id}-message` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <Label htmlFor={id} className="text-[13px] font-medium">
            {label}
          </Label>
        )}
        <Input
          defaultValue={defaultValue}
          required={required}
          onBlur={onBlur}
          onChange={onChange && ((event) => onChange(event.target.value))}
          placeholder={placeholder}
          name={id}
          ref={ref}
          id={id}
          type={type}
          disabled={disabled || pending}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy}
          className={cn("h-9 px-3 text-sm", className)}
        />
        {fieldErrors?.length ? (
          <div id={`${id}-message`} aria-live="polite">
            {fieldErrors.map((error) => (
              <p key={error} className="text-xs text-destructive-text">
                {error}
              </p>
            ))}
          </div>
        ) : (
          hint && (
            <p
              id={`${id}-message`}
              aria-live="polite"
              className={cn(
                "text-xs",
                invalid ? "text-destructive-text" : "text-muted-foreground"
              )}
            >
              {hint}
            </p>
          )
        )}
      </div>
    );
  }
);
FormInput.displayName = "FormInput";
export default FormInput;
