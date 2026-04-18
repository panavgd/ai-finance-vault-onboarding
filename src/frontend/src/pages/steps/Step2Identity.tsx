import { Briefcase, Heart, Star, Wallet } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useOnboardingStore } from "../../store/onboardingStore";
import type { BuildingGoal } from "../../types/onboarding";

type GoalOption = {
  id: BuildingGoal;
  label: string;
  description: string;
  icon: React.ComponentType<{
    className?: string;
    strokeWidth?: number;
    color?: string;
  }>;
};

const GOAL_OPTIONS: GoalOption[] = [
  {
    id: "personal_wealth",
    label: "Personal Wealth",
    description: "Your assets, fully controlled",
    icon: Wallet,
  },
  {
    id: "business",
    label: "Business",
    description: "Your company, structured securely",
    icon: Briefcase,
  },
  {
    id: "family",
    label: "Family",
    description: "Protect what matters most",
    icon: Heart,
  },
  {
    id: "legacy",
    label: "Legacy",
    description: "What you leave behind",
    icon: Star,
  },
];

function getSelectionMessage(selected: BuildingGoal[]): string {
  const sorted = [...selected].sort().join("+");

  const messages: Record<string, string> = {
    personal_wealth: "Mapping your assets and building your wealth layer.",
    business: "Structuring your business holdings and entity overview.",
    family: "Designing your family protection and legacy framework.",
    legacy: "Architecting your long-term legacy and estate structure.",
    "business+personal_wealth":
      "Unifying your personal and business wealth into one vault.",
    "family+personal_wealth":
      "Securing your assets to protect everything your family needs.",
    "legacy+personal_wealth":
      "Preserving your wealth and shaping a lasting legacy.",
    "business+family":
      "Integrating your business with your family's financial future.",
    "business+legacy":
      "Turning your business into a structured, enduring legacy.",
    "family+legacy":
      "Building a protected future for those you love and leave behind.",
    "business+family+personal_wealth":
      "Your complete wealth system: assets, business, and family — unified.",
    "business+legacy+personal_wealth":
      "Structuring your wealth and business for a lasting impact.",
    "family+legacy+personal_wealth":
      "Your private vault: assets, protection, and legacy — all in one place.",
    "business+family+legacy":
      "Integrating your business, family, and legacy into one secure structure.",
    "business+family+legacy+personal_wealth":
      "Your complete financial intelligence vault is taking shape.",
  };

  return messages[sorted] ?? "Structuring your vault.";
}

function getMultiFeedback(selected: BuildingGoal[]): string {
  if (selected.length === 0) return "";
  return getSelectionMessage(selected);
}

const ease = [0.4, 0, 0.2, 1] as const;
const BAR_HEIGHTS = [6, 10, 14, 10, 6] as const;
const AI_MESSAGES = ["Structuring your vault."] as const;

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function AiSignalFooter() {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.6, ease }}
      className="flex items-center justify-center gap-2 pb-2 flex-shrink-0"
      data-ocid="ai-signal"
    >
      <span className="flex items-end gap-[3px]" aria-hidden="true">
        {BAR_HEIGHTS.map((h, i) =>
          prefersReduced ? (
            <span
              key={`bar-static-${i}-${h}`}
              style={{
                display: "inline-block",
                width: "3px",
                height: `${h * 0.5}px`,
                borderRadius: "2px",
                background: "var(--accent)",
                opacity: 0.35,
              }}
            />
          ) : (
            <motion.span
              key={`bar-wave-${i}-${h}`}
              animate={{ scaleY: [0.35, 1, 0.35] }}
              transition={{
                duration: 1.2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.14,
                ease: "easeInOut",
              }}
              style={{
                display: "inline-block",
                width: "3px",
                height: `${h}px`,
                borderRadius: "2px",
                background: "var(--accent)",
                opacity: 0.7,
                transformOrigin: "bottom",
              }}
            />
          ),
        )}
      </span>

      <p
        className="font-body"
        style={{
          fontSize: "11px",
          color: "var(--ai-signal-text)",
          opacity: 0.75,
        }}
      >
        {AI_MESSAGES[0]}
      </p>
    </motion.div>
  );
}

export function Step2Identity() {
  const { nextStep, prevStep, updateData, data } = useOnboardingStore();
  const { isDark } = useTheme();

  const [selectedGoals, setSelectedGoals] = useState<BuildingGoal[]>(
    data.buildingGoals ?? [],
  );
  const [pulsingCards, setPulsingCards] = useState<Set<BuildingGoal>>(
    new Set(),
  );

  const toggleGoal = (id: BuildingGoal) => {
    setSelectedGoals((prev) => {
      const wasSelected = prev.includes(id);
      if (!wasSelected) {
        setPulsingCards((p) => new Set(p).add(id));
      }
      return wasSelected ? prev.filter((g) => g !== id) : [...prev, id];
    });
  };

  const clearPulse = (id: BuildingGoal) => {
    setPulsingCards((p) => {
      const next = new Set(p);
      next.delete(id);
      return next;
    });
  };

  const feedback = getMultiFeedback(selectedGoals);
  const canProceed = selectedGoals.length > 0;

  const handleNext = () => {
    if (!canProceed) return;
    updateData({ buildingGoals: selectedGoals });
    nextStep();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-36">
        <motion.h2
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-display font-bold tracking-tight text-center mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          What matters most to you?
        </motion.h2>

        <div
          className="grid grid-cols-2 gap-2.5"
          data-ocid="building-goal-options"
        >
          {GOAL_OPTIONS.map((opt, i) => {
            const Icon = opt.icon;
            const isActive = selectedGoals.includes(opt.id);
            const isPulsing = pulsingCards.has(opt.id);
            return (
              <motion.button
                key={opt.id}
                type="button"
                onClick={() => toggleGoal(opt.id)}
                data-ocid={`goal-${opt.id}`}
                initial={{ opacity: 0, scale: 0.93 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.32, delay: 0.1 + i * 0.06, ease }}
                whileTap={{ scale: 0.96 }}
                onAnimationEnd={() => {
                  if (isPulsing) clearPulse(opt.id);
                }}
                className={`flex flex-col items-start gap-1.5 p-3.5 rounded-2xl text-left relative transition-smooth${isPulsing ? " card-select-pulse" : ""}`}
                style={{
                  background: isActive
                    ? "var(--accent-tint)"
                    : "var(--card-bg)",
                  border: isActive
                    ? "1px solid var(--accent)"
                    : "1px solid var(--card-border)",
                  boxShadow: "var(--shadow-card)",
                  transform: isActive ? "scale(1.02)" : "scale(1)",
                  minHeight: "110px",
                }}
              >
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.18 }}
                      className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: "var(--accent)" }}
                    >
                      <svg
                        width="9"
                        height="7"
                        viewBox="0 0 9 7"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M1 3.5L3.5 6L8 1"
                          stroke={isDark ? "#0D1F1A" : "#FFFFFF"}
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isActive
                      ? "var(--accent-tint)"
                      : isDark
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.04)",
                  }}
                >
                  <Icon
                    className="w-4 h-4"
                    strokeWidth={2}
                    color={isActive ? "var(--accent)" : "var(--text-muted)"}
                  />
                </div>

                <p
                  className="text-sm font-display font-semibold tracking-tight leading-none"
                  style={{
                    color: isActive ? "var(--accent)" : "var(--text-primary)",
                  }}
                >
                  {opt.label}
                </p>

                <p
                  className="text-xs font-body leading-snug"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {opt.description}
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Feedback message in document flow */}
        <AnimatePresence mode="wait">
          {feedback && (
            <motion.div
              key={feedback}
              initial={{ opacity: 0, y: 5, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.28 }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-2xl mt-3"
              style={{
                background: "var(--ai-signal-bg)",
                border: "1px solid var(--card-border)",
              }}
              data-ocid="goal-feedback"
            >
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: "var(--accent)" }}
              />
              <span
                className="text-xs font-body font-medium"
                style={{ color: "var(--ai-signal-text)" }}
              >
                {feedback}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed footer */}
      <div
        className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4 flex-shrink-0 flex flex-col gap-3"
        style={{ background: "var(--overlay-footer)" }}
      >
        <AiSignalFooter />

        <motion.button
          type="button"
          onClick={handleNext}
          disabled={!canProceed}
          data-ocid="identity-continue"
          whileHover={canProceed ? { scale: 1.02 } : {}}
          whileTap={canProceed ? { scale: 0.97 } : {}}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-full font-display font-medium text-sm transition-smooth"
          style={
            canProceed
              ? {
                  background: "var(--btn-primary-bg)",
                  color: "var(--btn-primary-text)",
                  boxShadow: "var(--shadow-cta)",
                }
              : {
                  background: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.06)",
                  color: "var(--text-muted)",
                  border: "1px solid var(--card-border)",
                  cursor: "not-allowed",
                }
          }
        >
          Continue
        </motion.button>

        <button
          type="button"
          onClick={prevStep}
          data-ocid="identity-back"
          className="w-full h-9 rounded-full text-xs font-body transition-smooth"
          style={{ color: "var(--text-muted)", opacity: 0.4 }}
        >
          Back
        </button>
      </div>
    </div>
  );
}
