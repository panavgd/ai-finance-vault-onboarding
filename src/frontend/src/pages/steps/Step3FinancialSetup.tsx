import { motion, useAnimationControls } from "motion/react";
import { useState } from "react";
import { NavigationButtons } from "../../components/onboarding/NavigationButtons";
import { useTheme } from "../../context/ThemeContext";
import { useOnboardingStore } from "../../store/onboardingStore";
import type { MonthlyIncome } from "../../types/onboarding";

const ease = [0.4, 0, 0.2, 1] as const;

function getLiveFeedback(
  income: MonthlyIncome,
  assets: number,
  isInsured: boolean | null,
): string {
  if (income === "50+" && assets >= 7) return "Strong earning base";
  if (isInsured === false && assets < 5)
    return "You may have some gaps in your financial protection";
  if (income === "10-30" || income === "50+")
    return "You're already diversified";
  if (income !== "") return "Building your financial profile";
  return "Building your financial profile";
}

// ─── Slider Row ───────────────────────────────────────────────────────────────

interface SliderRowProps {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (val: number) => void;
  ocid?: string;
}

function SliderRow({ label, min, max, value, onChange, ocid }: SliderRowProps) {
  const controls = useAnimationControls();
  const [isDragging, setIsDragging] = useState(false);
  const pct = ((value - min) / (max - min)) * 100;
  const ticks = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  const thumbHalf = 11;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
    controls.start({
      scale: [1, 1.15, 1],
      transition: { duration: 0.2, ease: "easeInOut" },
    });
  };

  return (
    <div style={{ paddingBottom: "28px" }} data-ocid={ocid}>
      <p
        className="text-xs font-body font-medium mb-3"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </p>

      <div className="relative" style={{ height: "44px" }}>
        {/* Inactive track */}
        <div
          className="absolute rounded-full"
          style={{
            left: 0,
            right: 0,
            top: "50%",
            height: "4px",
            marginTop: "-2px",
            background: "var(--progress-bg)",
          }}
        />
        {/* Active track */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            left: 0,
            top: "50%",
            height: "4px",
            marginTop: "-2px",
            width: `${pct}%`,
            background: "var(--accent)",
            transition: "width 0.05s linear",
          }}
        />
        {/* Animated thumb */}
        <motion.div
          animate={controls}
          className="absolute z-20 pointer-events-none flex items-center justify-center"
          style={{
            width: 22,
            height: 22,
            top: "50%",
            marginTop: `-${thumbHalf}px`,
            borderRadius: "50%",
            background: "var(--accent)",
            boxShadow: isDragging
              ? "0 2px 12px rgba(0,0,0,0.3)"
              : "0 2px 8px rgba(0,0,0,0.2)",
            left: `calc(${pct}% - ${thumbHalf}px)`,
            transform: isDragging ? "scale(1.15)" : "scale(1)",
            transition:
              "box-shadow 0.15s ease, transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        />
        {/* Native range input */}
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute inset-0 w-full opacity-0 cursor-pointer z-30"
          style={{ height: "44px" }}
          aria-label={label}
        />
      </div>

      {/* Tick marks */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          paddingTop: "6px",
          paddingLeft: "2px",
          paddingRight: "2px",
        }}
      >
        {ticks.map((tick) => {
          const isActive = tick === value;
          return (
            <div
              key={tick}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "1px",
                  height: "4px",
                  background: isActive ? "var(--accent)" : "var(--progress-bg)",
                  marginBottom: "3px",
                  transition: "background 0.15s ease",
                }}
              />
              <span
                style={{
                  fontSize: "9px",
                  lineHeight: "1",
                  color: isActive ? "var(--accent)" : "var(--text-muted)",
                  fontWeight: isActive ? 600 : 400,
                  transition: "color 0.15s ease",
                  fontFamily: "inherit",
                }}
              >
                {tick}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Yes/Not Yet Buttons ──────────────────────────────────────────────────────

interface YesNotYetProps {
  label: string;
  value: boolean | null;
  onChange: (val: boolean) => void;
  ocid?: string;
  isDark: boolean;
}

function YesNotYetButtons({
  label,
  value,
  onChange,
  ocid,
  isDark,
}: YesNotYetProps) {
  return (
    <div className="space-y-3" data-ocid={ocid}>
      <p
        className="text-xs font-body font-medium"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          data-ocid={`${ocid}-yes`}
          className="h-11 rounded-xl font-body text-sm font-semibold transition-smooth"
          style={{
            border:
              value === true
                ? "1px solid var(--accent)"
                : "1px solid var(--card-border)",
            background:
              value === true
                ? "var(--accent-tint)"
                : isDark
                  ? "rgba(255,255,255,0.04)"
                  : "var(--app-bg-2)",
            color: value === true ? "var(--accent)" : "var(--text-secondary)",
          }}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          data-ocid={`${ocid}-notyet`}
          className="h-11 rounded-xl font-body text-sm font-semibold transition-smooth"
          style={{
            border:
              value === false
                ? "1px solid var(--accent)"
                : "1px solid var(--card-border)",
            background:
              value === false
                ? "var(--accent-tint)"
                : isDark
                  ? "rgba(255,255,255,0.04)"
                  : "var(--app-bg-2)",
            color: value === false ? "var(--accent)" : "var(--text-secondary)",
          }}
        >
          Not yet
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Step3FinancialSetup() {
  const { nextStep, prevStep, updateData, setAiTransitionActive, data } =
    useOnboardingStore();
  const { isDark } = useTheme();
  const [feedbackKey, setFeedbackKey] = useState(0);
  const [cachedFeedback, setCachedFeedback] = useState(() =>
    getLiveFeedback(data.income, data.assets, data.isInsured),
  );

  const triggerFeedback = (
    income: typeof data.income,
    assets: number,
    isInsured: boolean | null,
  ) => {
    setCachedFeedback(getLiveFeedback(income, assets, isInsured));
    setFeedbackKey((k) => k + 1);
  };

  const handleAssetsChange = (val: number) => {
    updateData({ assets: val });
    triggerFeedback(data.income, val, data.isInsured);
  };

  const handleInsuredChange = (val: boolean) => {
    updateData({ isInsured: val });
    triggerFeedback(data.income, data.assets, val);
  };

  const handleNext = () => {
    setAiTransitionActive(true);
    nextStep();
  };

  // Can proceed only when both yes/no questions are answered
  const canProceed = data.isInsured !== null && data.hasDocuments !== null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-3 space-y-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
        >
          <p
            className="text-xs font-body font-medium tracking-wide mb-1.5"
            style={{ color: "var(--text-secondary)" }}
          >
            Financial setup
          </p>
          <h2
            className="font-display font-bold tracking-tight"
            style={{
              fontSize: "clamp(1.1rem, 5vw, 1.35rem)",
              color: "var(--text-primary)",
            }}
          >
            Your financial setup
          </h2>
        </motion.div>

        {/* Sliders card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.07, ease }}
          style={{
            borderRadius: "16px",
            border: "1px solid var(--card-border)",
            background: "var(--card-bg)",
            padding: "20px 16px 4px",
            overflow: "visible",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <SliderRow
            label="How many assets do you own?"
            min={0}
            max={10}
            value={data.assets}
            onChange={handleAssetsChange}
            ocid="slider-assets"
          />
          <SliderRow
            label="How many cars do you own?"
            min={0}
            max={5}
            value={data.cars}
            onChange={(val) => updateData({ cars: val })}
            ocid="slider-cars"
          />
          <SliderRow
            label="How many people do you support financially?"
            min={0}
            max={5}
            value={data.dependents}
            onChange={(val) => updateData({ dependents: val })}
            ocid="slider-dependents"
          />
        </motion.div>

        {/* Yes/Not yet */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.13, ease }}
          className="space-y-5"
          data-ocid="yesno-section"
        >
          <YesNotYetButtons
            label="Are you fully insured?"
            value={data.isInsured}
            onChange={handleInsuredChange}
            ocid="insured"
            isDark={isDark}
          />
          <YesNotYetButtons
            label="Are all your documents in one place?"
            value={data.hasDocuments}
            onChange={(val) => updateData({ hasDocuments: val })}
            ocid="documents"
            isDark={isDark}
          />
        </motion.div>

        {/* Live feedback */}
        <motion.div
          key={feedbackKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease }}
          className="flex items-start gap-3 px-4 py-3 rounded-2xl"
          style={{
            background: "var(--ai-signal-bg)",
            border: "1px solid var(--card-border)",
            borderLeft: "2px solid var(--accent)",
          }}
          data-ocid="feedback-badge"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0, marginTop: "1px", opacity: 0.7 }}
            aria-hidden="true"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span
            className="text-xs font-body font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            {cachedFeedback}
          </span>
        </motion.div>
      </div>

      <NavigationButtons
        onNext={handleNext}
        onPrev={prevStep}
        canNext={canProceed}
        nextLabel="Next step"
        showPrev
      />
    </div>
  );
}
