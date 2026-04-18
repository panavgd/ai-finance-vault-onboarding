import { motion } from "motion/react";
import { NavigationButtons } from "../../components/onboarding/NavigationButtons";
import { useTheme } from "../../context/ThemeContext";
import { useOnboardingStore } from "../../store/onboardingStore";
import type {
  AgeRange,
  MaritalStatus,
  MonthlyIncome,
} from "../../types/onboarding";

const smartVaultEngineStyle = `
  @keyframes smartVaultPulse {
    0%, 100% { opacity: 0.7; filter: brightness(1); }
    50% { opacity: 1; filter: brightness(1.25); }
  }
  .smart-vault-engine {
    animation: smartVaultPulse 2.5s ease-in-out infinite;
  }
`;

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

export function Step3PersonalContext() {
  const { nextStep, prevStep, updateData, data } = useOnboardingStore();
  const { isDark } = useTheme();

  const firstName = data.fullName ? data.fullName.split(" ")[0] : "";
  const canProceed = data.ageRange !== "" && data.income !== "";

  return (
    <div className="flex flex-col h-full">
      <style>{smartVaultEngineStyle}</style>
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
            Personal context
          </p>
          <h2
            className="font-display font-bold tracking-tight"
            style={{
              fontSize: "clamp(1.1rem, 5vw, 1.35rem)",
              color: "var(--text-primary)",
            }}
          >
            {firstName
              ? `Hi ${firstName}, tell us about you`
              : "Tell us about you"}
          </h2>
        </motion.div>

        {/* Smart Vault Engine badge */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.22, ease }}
          className="space-y-1 -mt-1"
        >
          <p
            className="font-body font-medium tracking-wide smart-vault-engine"
            style={{
              fontSize: "12px",
              color: "var(--accent)",
              letterSpacing: "0.03em",
            }}
          >
            Smart Vault Engine
          </p>
          <p
            className="font-body"
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              lineHeight: "1.45",
            }}
          >
            We're structuring your vault based on your profile
          </p>
        </motion.div>

        {/* Age */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.07, ease }}
        >
          <p
            className="text-xs font-body font-medium mb-2.5"
            style={{ color: "var(--text-secondary)" }}
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
                  className="h-9 rounded-xl font-body text-xs font-medium transition-smooth"
                  style={{
                    border: isSelected
                      ? "1px solid var(--accent)"
                      : "1px solid var(--card-border)",
                    background: isSelected
                      ? "var(--accent-tint)"
                      : isDark
                        ? "rgba(255,255,255,0.04)"
                        : "var(--app-bg-2)",
                    color: isSelected
                      ? "var(--accent)"
                      : "var(--text-secondary)",
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
            style={{ color: "var(--text-secondary)" }}
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
                  className="h-10 rounded-xl font-body text-sm font-medium transition-smooth"
                  style={{
                    border: isSelected
                      ? "1px solid var(--accent)"
                      : "1px solid var(--card-border)",
                    background: isSelected
                      ? "var(--accent-tint)"
                      : isDark
                        ? "rgba(255,255,255,0.04)"
                        : "var(--app-bg-2)",
                    color: isSelected
                      ? "var(--accent)"
                      : "var(--text-secondary)",
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
            style={{ color: "var(--text-secondary)" }}
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
                  onClick={() => updateData({ income: opt.value })}
                  data-ocid={`income-${opt.value}`}
                  className="h-10 rounded-xl font-body text-sm font-medium transition-smooth"
                  style={{
                    border: isSelected
                      ? "1px solid var(--accent)"
                      : "1px solid var(--card-border)",
                    background: isSelected
                      ? "var(--accent-tint)"
                      : isDark
                        ? "rgba(255,255,255,0.04)"
                        : "var(--app-bg-2)",
                    color: isSelected
                      ? "var(--accent)"
                      : "var(--text-secondary)",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* AI signal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6, ease }}
        className="flex items-center justify-center gap-2 pb-2"
        data-ocid="ai-signal"
      >
        <span className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{ opacity: [0.25, 0.8, 0.25] }}
              transition={{
                duration: 1.4,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.22,
                ease: "easeInOut",
              }}
              style={{
                display: "inline-block",
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: "var(--accent)",
              }}
            />
          ))}
        </span>
        <p
          className="font-body"
          style={{ fontSize: "11px", color: "var(--text-muted)" }}
        >
          AI is configuring your vault
        </p>
      </motion.div>

      <NavigationButtons
        onNext={nextStep}
        onPrev={prevStep}
        canNext={canProceed}
        nextLabel="Next step"
        showPrev
      />
    </div>
  );
}
