import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useOnboardingStore } from "../../store/onboardingStore";
import { NeuralBackground } from "../backgrounds/NeuralBackground";
import { ProgressBar } from "./ProgressBar";

interface OnboardingLayoutProps {
  children: ReactNode;
}

export function OnboardingLayout({ children }: OnboardingLayoutProps) {
  const { currentStep, direction } = useOnboardingStore();
  const { isDark } = useTheme();

  const variants = {
    enter: (dir: string) => ({
      x: dir === "forward" ? 30 : -30,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: string) => ({
      x: dir === "forward" ? -30 : 30,
      opacity: 0,
    }),
  };

  return (
    <div
      className="relative flex flex-col items-center justify-start overflow-hidden"
      style={{
        minHeight: "100dvh",
        maxHeight: "100dvh",
        height: "100dvh",
        background: "var(--overlay-bg)",
        transition: "background 0.3s ease",
      }}
    >
      {isDark && <NeuralBackground />}

      <div
        className="relative w-full max-w-md mx-auto flex flex-col"
        style={{ zIndex: 2, height: "100dvh" }}
      >
        {/* Logo bar */}
        <div className="flex items-center justify-center gap-3 py-4 flex-shrink-0">
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{
              background: isDark
                ? "linear-gradient(135deg, #1DBA7A, #2ED19A)"
                : "linear-gradient(135deg, #18A76E, #1DBA7A)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-5 h-5"
              aria-label="Vault shield"
            >
              <title>Vault shield</title>
              <path
                d="M12 2L4 7v5c0 4.5 3.3 8.7 8 9.9 4.7-1.2 8-5.4 8-9.9V7L12 2z"
                fill={isDark ? "#0D1F1A" : "#FFFFFF"}
                stroke={isDark ? "#0D1F1A" : "#FFFFFF"}
                strokeWidth="0.5"
              />
            </svg>
          </div>
          <div>
            <p
              className="font-display font-semibold text-base leading-tight tracking-normal"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, #1DBA7A, #2ED19A)"
                  : "linear-gradient(135deg, #18A76E, #1DBA7A)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              SafeMint
            </p>
            <p
              className="font-body text-xs tracking-normal"
              style={{ color: "var(--text-muted)" }}
            >
              Vault
            </p>
          </div>
        </div>

        {/* Card */}
        <div
          className="flex flex-col mx-4 flex-1 min-h-0"
          style={{
            overflow: "hidden",
            borderRadius: "16px",
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            backdropFilter: isDark ? "blur(8px)" : "none",
            boxShadow: "var(--shadow-card)",
            transition:
              "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
          }}
        >
          <div className="flex-shrink-0">
            <ProgressBar currentStep={currentStep} />
          </div>

          <div className="flex-1 min-h-0" style={{ overflowY: "auto" }}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                className="h-full"
              >
                <div className="h-full flex flex-col">{children}</div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <p
          className="text-center text-xs py-3 flex-shrink-0"
          style={{ color: "var(--text-muted)" }}
        >
          {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            className="hover:opacity-80 transition-smooth"
            style={{ color: "var(--accent)" }}
            target="_blank"
            rel="noreferrer"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
