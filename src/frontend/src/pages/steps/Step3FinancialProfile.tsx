import { motion, useAnimationControls } from "motion/react";
import { useState } from "react";
import { NavigationButtons } from "../../components/onboarding/NavigationButtons";
import { useOnboardingStore } from "../../store/onboardingStore";
import type {
  AgeRange,
  MaritalStatus,
  MonthlyIncome,
} from "../../types/onboarding";

const ease = [0.4, 0, 0.2, 1] as const;

const AGE_OPTIONS: { value: AgeRange; label: string }[] = [
  { value: "20", label: "20s" },
  { value: "30", label: "30s" },
  { value: "40", label: "40s" },
  { value: "50", label: "50s" },
  { value: "60", label: "60s" },
  { value: "70", label: "70s" },
  { value: "80", label: "80s" },
];

const MARITAL_OPTIONS: { value: MaritalStatus; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
];

const INCOME_OPTIONS: { value: MonthlyIncome; label: string }[] = [
  { value: "0-5l", label: "0–5L" },
  { value: "5-10", label: "5–10L" },
  { value: "10-30", label: "10–30L" },
  { value: "50+", label: "50L+" },
];

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
  if (income !== "") return "Building your financial profile…";
  return "Building your financial profile…";
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
  // Thumb is 22px; offset = 11px
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
        style={{ color: "rgba(234,234,234,0.5)" }}
      >
        {label}
      </p>

      {/* Slider track + animated thumb overlay */}
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
            background: "rgba(255,255,255,0.12)",
          }}
        />
        {/* Active (filled) track */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            left: 0,
            top: "50%",
            height: "4px",
            marginTop: "-2px",
            width: `${pct}%`,
            background: "#1DBA7A",
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
            background: isDragging
              ? "linear-gradient(145deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 100%), #1DBA7A"
              : "linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%), #1DBA7A",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
            left: `calc(${pct}% - ${thumbHalf}px)`,
            transform: isDragging ? "scale(1.15)" : "scale(1)",
            transition:
              "box-shadow 0.15s ease, transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        />
        {/* Native range input (transparent, sits on top) */}
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

      {/* Tick marks with numbers */}
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
                  background: isActive ? "#1DBA7A" : "rgba(255,255,255,0.1)",
                  marginBottom: "3px",
                  transition: "background 0.15s ease",
                }}
              />
              <span
                style={{
                  fontSize: "9px",
                  lineHeight: "1",
                  color: isActive ? "#1DBA7A" : "rgba(234,234,234,0.3)",
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

// ─── Yes/No Buttons ───────────────────────────────────────────────────────────

interface YesNoProps {
  label: string;
  value: boolean | null;
  onChange: (val: boolean) => void;
  ocid?: string;
}

function YesNoButtons({ label, value, onChange, ocid }: YesNoProps) {
  return (
    <div className="space-y-3" data-ocid={ocid}>
      <p
        className="text-xs font-body font-medium"
        style={{ color: "rgba(234,234,234,0.5)" }}
      >
        {label}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {/* Yes button */}
        <button
          type="button"
          onClick={() => onChange(true)}
          data-ocid={`${ocid}-yes`}
          className="h-11 rounded-xl font-body text-sm font-semibold border transition-smooth"
          style={{
            borderColor:
              value === true
                ? "rgba(29,186,122,0.45)"
                : "rgba(255,255,255,0.08)",
            background:
              value === true
                ? "rgba(29,186,122,0.1)"
                : "rgba(255,255,255,0.04)",
            color: value === true ? "#1DBA7A" : "rgba(234,234,234,0.5)",
            boxShadow: "none",
          }}
        >
          Yes
        </button>
        {/* No button — neutral grey unselected, green selected */}
        <button
          type="button"
          onClick={() => onChange(false)}
          data-ocid={`${ocid}-no`}
          className="h-11 rounded-xl font-body text-sm font-semibold border transition-smooth"
          style={{
            borderColor:
              value === false
                ? "rgba(29,186,122,0.45)"
                : "rgba(255,255,255,0.08)",
            background:
              value === false
                ? "rgba(29,186,122,0.1)"
                : "rgba(255,255,255,0.04)",
            color: value === false ? "#1DBA7A" : "rgba(234,234,234,0.5)",
            boxShadow: "none",
          }}
        >
          No
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Step3FinancialProfile() {
  const { nextStep, prevStep, updateData, setAiTransitionActive, data } =
    useOnboardingStore();
  const [feedbackKey, setFeedbackKey] = useState(0);
  const [cachedFeedback, setCachedFeedback] = useState(() =>
    getLiveFeedback(data.income, data.assets, data.isInsured),
  );

  const triggerFeedback = (
    income: MonthlyIncome,
    assets: number,
    isInsured: boolean | null,
  ) => {
    setCachedFeedback(getLiveFeedback(income, assets, isInsured));
    setFeedbackKey((k) => k + 1);
  };

  const handleIncomeSelect = (val: MonthlyIncome) => {
    updateData({ income: val });
    triggerFeedback(val, data.assets, data.isInsured);
  };

  const handleAssetsChange = (val: number) => {
    updateData({ assets: val });
    triggerFeedback(data.income, val, data.isInsured);
  };

  const handleInsuredChange = (val: boolean) => {
    updateData({ isInsured: val });
    triggerFeedback(data.income, data.assets, val);
  };

  const canProceed = data.ageRange !== "" && data.income !== "";

  const handleNext = () => {
    setAiTransitionActive(true);
    nextStep();
  };

  const firstName = data.fullName ? data.fullName.split(" ")[0] : "";

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
            style={{ color: "rgba(234,234,234,0.45)" }}
          >
            Your finances
          </p>
          <h2
            className="font-display font-bold text-foreground tracking-tight"
            style={{ fontSize: "clamp(1.1rem, 5vw, 1.35rem)" }}
          >
            {firstName
              ? `Hi ${firstName}, let's get to know each other`
              : "Tell us about your finances"}
          </h2>
        </motion.div>

        {/* How old are you? */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.07, ease }}
        >
          <p
            className="text-xs font-body font-medium mb-2.5"
            style={{ color: "rgba(234,234,234,0.5)" }}
          >
            How old are you?
          </p>
          <div
            className="grid grid-cols-4 gap-1.5"
            data-ocid="age-range-options"
          >
            {AGE_OPTIONS.map((opt) => {
              const isSelected = data.ageRange === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateData({ ageRange: opt.value })}
                  data-ocid={`age-${opt.value}`}
                  className="h-9 rounded-xl font-body text-xs font-medium border transition-smooth"
                  style={{
                    borderColor: isSelected
                      ? "rgba(29,186,122,0.45)"
                      : "rgba(255,255,255,0.08)",
                    background: isSelected
                      ? "rgba(29,186,122,0.1)"
                      : "rgba(255,255,255,0.04)",
                    color: isSelected ? "#1DBA7A" : "rgba(234,234,234,0.5)",
                    boxShadow: "none",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Relationship status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.11, ease }}
        >
          <p
            className="text-xs font-body font-medium mb-2.5"
            style={{ color: "rgba(234,234,234,0.5)" }}
          >
            Relationship status
          </p>
          <div className="grid grid-cols-2 gap-2" data-ocid="marital-options">
            {MARITAL_OPTIONS.map((opt) => {
              const isSelected = data.maritalStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateData({ maritalStatus: opt.value })}
                  data-ocid={`marital-${opt.value}`}
                  className="h-10 rounded-xl font-body text-sm font-medium border transition-smooth"
                  style={{
                    borderColor: isSelected
                      ? "rgba(29,186,122,0.45)"
                      : "rgba(255,255,255,0.08)",
                    background: isSelected
                      ? "rgba(29,186,122,0.1)"
                      : "rgba(255,255,255,0.04)",
                    color: isSelected ? "#1DBA7A" : "rgba(234,234,234,0.5)",
                    boxShadow: "none",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Monthly income */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15, ease }}
        >
          <p
            className="text-xs font-body font-medium mb-2.5"
            style={{ color: "rgba(234,234,234,0.5)" }}
          >
            Monthly income
          </p>
          <div className="grid grid-cols-2 gap-2" data-ocid="income-options">
            {INCOME_OPTIONS.map((opt) => {
              const isSelected = data.income === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleIncomeSelect(opt.value)}
                  data-ocid={`income-${opt.value}`}
                  className="h-10 rounded-xl font-body text-sm font-medium border transition-smooth"
                  style={{
                    borderColor: isSelected
                      ? "rgba(29,186,122,0.45)"
                      : "rgba(255,255,255,0.08)",
                    background: isSelected
                      ? "rgba(29,186,122,0.1)"
                      : "rgba(255,255,255,0.04)",
                    color: isSelected ? "#1DBA7A" : "rgba(234,234,234,0.5)",
                    boxShadow: "none",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Sliders container — glass card, no glow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.19, ease }}
          style={{
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(12px)",
            padding: "20px 16px 4px",
            overflow: "visible",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
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

        {/* Yes/No binary questions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.23, ease }}
          className="space-y-5"
          data-ocid="yesno-section"
        >
          <YesNoButtons
            label="Are all your documents in one place?"
            value={data.hasDocuments}
            onChange={(val) => updateData({ hasDocuments: val })}
            ocid="documents"
          />
          <YesNoButtons
            label="Are you fully insured?"
            value={data.isInsured}
            onChange={handleInsuredChange}
            ocid="insured"
          />
        </motion.div>

        {/* Live feedback insight banner — soft green, advisory tone */}
        <motion.div
          key={feedbackKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease }}
          className="flex items-start gap-3 px-4 py-3 rounded-2xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(29,186,122,0.05), rgba(29,186,122,0.02))",
            border: "1px solid rgba(29,186,122,0.15)",
          }}
          data-ocid="feedback-badge"
        >
          {/* Shield icon */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(29,186,122,0.7)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0, marginTop: "1px" }}
            aria-hidden="true"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span
            className="text-xs font-body font-medium"
            style={{ color: "rgba(234,234,234,0.8)" }}
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
