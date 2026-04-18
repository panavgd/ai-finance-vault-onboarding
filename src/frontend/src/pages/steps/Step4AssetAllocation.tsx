import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { NavigationButtons } from "../../components/onboarding/NavigationButtons";
import { useTheme } from "../../context/ThemeContext";
import { useOnboardingStore } from "../../store/onboardingStore";
import type { AssetType } from "../../types/onboarding";

const ASSET_OPTIONS: {
  value: AssetType;
  label: string;
  abbr: string;
  desc: string;
  borderColor?: string;
}[] = [
  {
    value: "property",
    label: "Property",
    abbr: "RE",
    desc: "Real estate & land",
    borderColor: "rgba(210, 180, 140, 0.3)",
  },
  {
    value: "stocks",
    label: "Stocks",
    abbr: "EQ",
    desc: "Equities & ETFs",
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  {
    value: "savings",
    label: "Savings",
    abbr: "SA",
    desc: "Bank & deposits",
    borderColor: "rgba(20, 184, 166, 0.3)",
  },
  {
    value: "crypto",
    label: "Crypto",
    abbr: "BTC",
    desc: "Digital assets",
    borderColor: "rgba(139, 92, 246, 0.3)",
  },
  {
    value: "bonds",
    label: "Bonds",
    abbr: "FI",
    desc: "Fixed income",
    borderColor: "rgba(156, 163, 175, 0.3)",
  },
  {
    value: "business",
    label: "Business",
    abbr: "BIZ",
    desc: "Ownership equity",
    borderColor: "rgba(234, 179, 8, 0.3)",
  },
  { value: "other", label: "Other", abbr: "ALT", desc: "Art, gold & more" },
];

const AI_MESSAGES = [
  "Building your financial profile",
  "Analyzing your wealth structure",
];

function getInsight(selected: AssetType[]): string {
  if (selected.length === 0) return "Select your assets to see insights";
  if (
    selected.includes("stocks") &&
    !selected.includes("savings") &&
    !selected.includes("bonds")
  )
    return "You're equity heavy";
  if (!selected.includes("savings")) return "Low liquidity detected";
  if (selected.length >= 3) return "Good diversification";
  return "Select your assets to see insights";
}

const ease = [0.4, 0, 0.2, 1] as const;

export function Step4AssetAllocation() {
  const {
    nextStep,
    prevStep,
    updateData,
    data,
    aiTransitionActive,
    setAiTransitionActive,
  } = useOnboardingStore();
  const { isDark } = useTheme();

  const [aiMessage, setAiMessage] = useState(AI_MESSAGES[0]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!aiTransitionActive) return;
    let msgIndex = 0;
    setAiMessage(AI_MESSAGES[0]);
    intervalRef.current = setInterval(() => {
      msgIndex = (msgIndex + 1) % AI_MESSAGES.length;
      setAiMessage(AI_MESSAGES[msgIndex]);
    }, 1200);
    timerRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setAiTransitionActive(false);
    }, 2500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [aiTransitionActive, setAiTransitionActive]);

  const toggle = (val: AssetType) => {
    const current = data.selectedAssets;
    const updated = current.includes(val)
      ? current.filter((t) => t !== val)
      : [...current, val];
    updateData({ selectedAssets: updated });
  };

  const isSelected = (val: AssetType) => data.selectedAssets.includes(val);
  const insight = getInsight(data.selectedAssets);

  return (
    <div className="flex flex-col h-full relative">
      {/* AI Loading Overlay */}
      <AnimatePresence>
        {aiTransitionActive && (
          <motion.div
            key="ai-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: "var(--app-bg)" }}
          >
            <div className="relative flex items-center justify-center mb-6">
              <motion.div
                animate={{ scale: [1, 1.35, 1], opacity: [0.4, 1, 0.4] }}
                transition={{
                  duration: 1.4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="absolute w-14 h-14 rounded-full"
                style={{ background: "var(--accent-tint)" }}
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1.6,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                className="w-9 h-9 rounded-full border-2 border-transparent"
                style={{
                  borderTopColor: "var(--accent)",
                  borderRightColor: isDark
                    ? "rgba(29,186,122,0.25)"
                    : "rgba(24,167,110,0.2)",
                }}
              />
              <div
                className="absolute w-3 h-3 rounded-full"
                style={{ background: "var(--accent)" }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={aiMessage}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease }}
                className="text-sm font-body font-medium text-center px-8"
                style={{ color: "var(--accent)" }}
              >
                {aiMessage}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col px-5 pt-4 pb-3 overflow-y-auto">
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          className="text-xs font-body font-medium tracking-wide mb-3"
          style={{ color: "var(--text-secondary)" }}
        >
          Your assets
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06, ease }}
          className="text-xl font-display font-bold tracking-tight text-center mb-1.5"
          style={{ color: "var(--text-primary)" }}
        >
          Where is your money today?
        </motion.h2>

        {/* Animated subtitle shimmer */}
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12, ease }}
          className="text-sm font-body text-center mb-4 relative overflow-hidden"
          style={{ color: "var(--text-secondary)" }}
        >
          <span
            className="relative inline-block"
            style={{
              background: isDark
                ? "linear-gradient(90deg, rgba(234,234,234,0.6) 0%, rgba(234,234,234,0.6) 30%, rgba(200,255,220,0.9) 50%, rgba(234,234,234,0.6) 70%, rgba(234,234,234,0.6) 100%)"
                : "linear-gradient(90deg, rgba(100,100,100,0.7) 0%, rgba(100,100,100,0.7) 30%, rgba(24,167,110,0.9) 50%, rgba(100,100,100,0.7) 70%, rgba(100,100,100,0.7) 100%)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmerSubtitle 2.8s ease-in-out infinite",
            }}
          >
            AI intelligence will create your wealth map
          </span>
          <style>{`
            @keyframes shimmerSubtitle {
              0%   { background-position: 200% center; }
              100% { background-position: -200% center; }
            }
          `}</style>
        </motion.p>

        {/* Asset grid */}
        <div className="grid grid-cols-2 gap-2.5" data-ocid="asset-options">
          {ASSET_OPTIONS.map((opt, i) => (
            <motion.button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              data-ocid={`asset-${opt.value}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.08 + i * 0.05, ease }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 px-3 py-3 rounded-2xl text-left transition-smooth"
              style={{
                background: isSelected(opt.value)
                  ? "var(--accent-tint)"
                  : "var(--card-bg)",
                border: isSelected(opt.value)
                  ? "1px solid var(--accent)"
                  : `1px solid ${opt.borderColor ?? "var(--card-border)"}`,
                boxShadow: "var(--shadow-card)",
              }}
              aria-pressed={isSelected(opt.value)}
            >
              <span
                className="text-xs font-body font-semibold w-8 flex-shrink-0 text-center px-1 py-0.5 rounded-lg"
                style={{
                  border: isSelected(opt.value)
                    ? "1px solid var(--accent)"
                    : "1px solid var(--card-border)",
                  color: isSelected(opt.value)
                    ? "var(--accent)"
                    : "var(--text-muted)",
                  background: isSelected(opt.value)
                    ? "var(--accent-tint)"
                    : isDark
                      ? "rgba(255,255,255,0.04)"
                      : "var(--app-bg-2)",
                }}
              >
                {opt.abbr}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className="font-display font-semibold text-xs leading-tight"
                  style={{
                    color: isSelected(opt.value)
                      ? "var(--accent)"
                      : "var(--text-primary)",
                  }}
                >
                  {opt.label}
                </p>
                <p
                  className="text-xs font-body truncate"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {opt.desc}
                </p>
              </div>
              {isSelected(opt.value) && (
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--accent)" }}
                >
                  <svg
                    viewBox="0 0 8 8"
                    fill="none"
                    className="w-2.5 h-2.5"
                    aria-hidden="true"
                  >
                    <path
                      d="M1.5 4l2 2 3-3"
                      stroke={isDark ? "#0D1F1A" : "#FFFFFF"}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Insight badge */}
        <motion.div
          key={data.selectedAssets.length}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease }}
          className="mt-3 flex items-center gap-2.5 px-4 py-3 rounded-2xl"
          style={{
            background: "var(--ai-signal-bg)",
            border: "1px solid var(--card-border)",
            borderLeft: "2px solid var(--accent)",
          }}
          data-ocid="insight-badge"
        >
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: "var(--accent)" }}
          />
          <span
            className="text-xs font-body font-medium leading-snug"
            style={{ color: "var(--ai-signal-text)" }}
          >
            {insight}
          </span>
        </motion.div>
      </div>

      <NavigationButtons
        onNext={nextStep}
        onPrev={prevStep}
        canNext={data.selectedAssets.length > 0}
        nextLabel="Analyze my wealth"
        showPrev
      />
    </div>
  );
}
