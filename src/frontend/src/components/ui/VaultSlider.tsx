interface SliderOption<T extends string | number> {
  value: T;
  label: string;
}

interface SliderProps<T extends string | number> {
  label: string;
  options: SliderOption<T>[];
  value: T;
  onChange: (val: T) => void;
}

export function Slider<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: SliderProps<T>) {
  const currentIndex = options.findIndex((o) => o.value === value);
  const currentLabel = options[currentIndex]?.label ?? String(value);

  return (
    <div className="flex flex-col gap-3" data-ocid="slider">
      <div className="flex items-center justify-between">
        <p className="text-sm font-display font-medium text-foreground/80 tracking-wide">
          {label}
        </p>
        <span className="text-sm font-mono font-bold text-primary px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
          {currentLabel}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={0}
          max={options.length - 1}
          value={currentIndex >= 0 ? currentIndex : 0}
          onChange={(e) => onChange(options[Number(e.target.value)].value)}
          className="w-full h-2 rounded-full appearance-none cursor-pointer slider-track"
          style={{
            background: `linear-gradient(90deg, #1DBA7A 0%, #1DBA7A ${
              currentIndex >= 0
                ? (currentIndex / (options.length - 1)) * 100
                : 0
            }%, oklch(0.22 0.03 160) ${
              currentIndex >= 0
                ? (currentIndex / (options.length - 1)) * 100
                : 0
            }%, oklch(0.22 0.03 160) 100%)`,
          }}
        />
        <div className="flex justify-between mt-2">
          {options.map((opt) => (
            <span
              key={String(opt.value)}
              className={`text-xs font-mono transition-smooth ${
                opt.value === value
                  ? "text-primary font-bold"
                  : "text-muted-foreground"
              }`}
              style={{ minWidth: 0 }}
            >
              {opt.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
