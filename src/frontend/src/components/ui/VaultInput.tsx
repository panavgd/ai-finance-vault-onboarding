import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  inputId?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, inputId, className = "", ...props }, ref) => {
    const id = inputId ?? props.name ?? "input";
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-display font-medium text-foreground/80 tracking-wide"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={`w-full h-12 px-4 rounded-xl bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-smooth ${error ? "border-destructive focus:ring-destructive/40" : ""} ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
