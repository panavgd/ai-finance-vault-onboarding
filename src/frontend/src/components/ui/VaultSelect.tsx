import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
  selectId?: string;
}

export function Select({
  label,
  options,
  error,
  selectId,
  className = "",
  ...props
}: SelectProps) {
  const id = selectId ?? props.name ?? "select";
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
      <div className="relative">
        <select
          id={id}
          className={`w-full h-12 px-4 pr-10 rounded-xl bg-muted/60 border border-border text-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-smooth appearance-none ${error ? "border-destructive" : ""} ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-card text-foreground"
            >
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
