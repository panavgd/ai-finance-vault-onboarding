import { STEP_TITLES, TOTAL_STEPS } from "../../types/onboarding";

interface ProgressBarProps {
  currentStep: number;
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
  const fillPercent = Math.round((currentStep / TOTAL_STEPS) * 100);
  const phaseLabel = STEP_TITLES[currentStep - 1];

  return (
    <div className="w-full px-6 pt-4 pb-2" data-ocid="progress-bar">
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-xs font-body font-medium tracking-wide"
          style={{ color: "var(--text-secondary)" }}
        >
          {phaseLabel}
        </span>
        <span
          className="text-xs font-body"
          style={{ color: "var(--text-muted)" }}
        >
          {fillPercent}%
        </span>
      </div>
      {/* 2px height — system indicator feel */}
      <div
        className="h-[2px] w-full rounded-full overflow-hidden"
        style={{ background: "var(--progress-bg)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${fillPercent}%`,
            background: "var(--progress-fill)",
            opacity: 0.85,
          }}
        />
      </div>
    </div>
  );
}
