interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id?: string;
  "data-ocid"?: string;
}

export function Checkbox({
  checked,
  onChange,
  label,
  id = "checkbox",
  "data-ocid": dataOcid,
}: CheckboxProps) {
  return (
    <div className="flex items-center gap-3" data-ocid={dataOcid}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="appearance-none w-5 h-5 rounded-md border-2 flex-shrink-0 cursor-pointer transition-smooth focus:outline-none focus:ring-2 focus:ring-primary/40 checked:bg-primary checked:border-primary border-border"
        style={{
          backgroundImage: checked
            ? "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 6l3 3 5-5' stroke='%230D1F1A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")"
            : "none",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      />
      <label
        htmlFor={id}
        className="text-sm font-body text-foreground/80 cursor-pointer hover:text-foreground transition-smooth"
      >
        {label}
      </label>
    </div>
  );
}
