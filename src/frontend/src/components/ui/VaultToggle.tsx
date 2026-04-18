interface ToggleProps {
  value: boolean | null;
  onChange: (val: boolean) => void;
  label?: string;
  trueLabel?: string;
  falseLabel?: string;
}

export function Toggle({
  value,
  onChange,
  label,
  trueLabel = "Yes",
  falseLabel = "No",
}: ToggleProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <p className="text-sm font-display font-medium text-foreground/80 tracking-wide">
          {label}
        </p>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onChange(true)}
          data-ocid="toggle-yes"
          className={`flex-1 h-12 rounded-xl font-display font-semibold text-sm tracking-wide border transition-smooth ${
            value === true
              ? "border-primary bg-primary/15 text-primary"
              : "border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
          }`}
        >
          {trueLabel}
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          data-ocid="toggle-no"
          className={`flex-1 h-12 rounded-xl font-display font-semibold text-sm tracking-wide border transition-smooth ${
            value === false
              ? "border-primary bg-primary/15 text-primary"
              : "border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
          }`}
        >
          {falseLabel}
        </button>
      </div>
    </div>
  );
}
