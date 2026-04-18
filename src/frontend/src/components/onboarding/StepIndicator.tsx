import { STEP_TITLES } from "../../types/onboarding";

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const title = STEP_TITLES[currentStep - 1];

  return (
    <div
      className="flex items-center gap-3 px-6 py-2"
      data-ocid="step-indicator"
    >
      <div className="flex items-center justify-center w-7 h-7 rounded-full border border-primary/40 bg-primary/10">
        <span className="text-xs font-mono font-bold text-primary">
          {currentStep}
        </span>
      </div>
      <span className="text-sm font-display font-medium text-muted-foreground tracking-wide">
        {title}
      </span>
    </div>
  );
}
