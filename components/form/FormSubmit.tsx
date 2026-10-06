"use client";

import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface FormSubmitProps {
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "ghost"
    | "link";
}

const FormSubmit = ({
  variant,
  disabled,
  children,
  className,
}: FormSubmitProps) => {
  const { pending } = useFormStatus();
  return (
    <Button
      disabled={disabled || pending}
      type="submit"
      variant={variant}
      className={cn(className)}
    >
      {children}
    </Button>
  );
};

export default FormSubmit;
