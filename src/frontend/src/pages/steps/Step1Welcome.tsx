import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type CSSProperties, useEffect, useState } from "react";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { useTheme } from "../../context/ThemeContext";
import { useOnboardingStore } from "../../store/onboardingStore";

const ease = [0.4, 0, 0.2, 1] as const;

const ROLLING_WORDS = ["Legacy", "Assets", "Family", "Dreams", "Finances"];

const WORD_FONT_STYLE: CSSProperties = {
  fontSize: "clamp(2.5rem, 12vw, 3.5rem)",
  letterSpacing: "-0.03em",
  lineHeight: 1.05,
  fontWeight: 700,
};

function RollingWordTicker() {
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { isDark } = useTheme();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const initialDelay = setTimeout(() => setStarted(true), 300);
    return () => clearTimeout(initialDelay);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!started || prefersReducedMotion) return;
    let intervalId: ReturnType<typeof setInterval>;
    const firstWordTimeout = setTimeout(() => {
      setIndex(1);
      intervalId = setInterval(() => {
        setIndex((prev) => (prev + 1) % ROLLING_WORDS.length);
      }, 1800);
    }, 1200);
    return () => {
      clearTimeout(firstWordTimeout);
      clearInterval(intervalId);
    };
  }, [started, prefersReducedMotion]);

  const wordStyle: CSSProperties = {
    ...WORD_FONT_STYLE,
    background: isDark
      ? "linear-gradient(135deg, #1DBA7A, #2ED19A)"
      : "linear-gradient(135deg, #18A76E, #1DBA7A)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    willChange: "transform, opacity",
    display: "block",
  };

  return (
    <div
      className="flex flex-col items-center font-display"
      style={{ gap: "2px", lineHeight: 1.1 }}
    >
      <span
        className="font-display font-bold block"
        style={{ ...WORD_FONT_STYLE, color: "var(--text-primary)" }}
      >
        Your
      </span>

      <div
        style={{
          height: "clamp(2.75rem, 13vw, 3.85rem)",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
        aria-live="polite"
        aria-atomic="true"
        aria-label={`Your ${ROLLING_WORDS[index]}`}
      >
        {prefersReducedMotion ? (
          <span className="font-display font-bold" style={wordStyle}>
            Legacy
          </span>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={ROLLING_WORDS[index]}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="font-display font-bold"
              style={wordStyle}
            >
              {ROLLING_WORDS[index]}
            </motion.span>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

export function Step1Welcome() {
  const { nextStep } = useOnboardingStore();
  const { isDark } = useTheme();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-6">
        {/* SafeMint wordmark logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease }}
          className="text-center mb-5"
        >
          <span
            className="font-display font-bold"
            style={{
              fontSize: "clamp(1.6rem, 7vw, 2rem)",
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
            }}
          >
            Safe
          </span>
          <span
            className="font-display font-bold"
            style={{
              fontSize: "clamp(1.6rem, 7vw, 2rem)",
              letterSpacing: "-0.03em",
              color: "var(--accent)",
            }}
          >
            Mint
          </span>
        </motion.div>

        {/* Rolling hero animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12, ease }}
          className="text-center"
        >
          <RollingWordTicker />
        </motion.div>

        {/* Primary tagline */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22, ease }}
          className="font-display text-center"
          style={{
            fontSize: "clamp(1.5rem, 4vw, 2rem)",
            color: "var(--text-primary)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            marginTop: "24px",
            marginBottom: "10px",
          }}
        >
          Private by Design.
        </motion.p>

        {/* Asset description */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.32, ease }}
          className="text-center"
          style={{ marginTop: "20px" }}
        >
          <p
            className="font-body"
            style={{
              fontSize: "1.1rem",
              color: "var(--text-primary)",
              fontWeight: 500,
              lineHeight: 1.4,
              marginBottom: "4px",
            }}
          >
            All your assets in one private vault.
          </p>
          <p
            className="font-body"
            style={{
              fontSize: "0.95rem",
              color: "var(--text-secondary)",
              fontWeight: 400,
              lineHeight: 1.45,
            }}
          >
            Full control. Always.
          </p>

          {/* Apple-style theme toggle — centered under "Full control. Always." */}
          <div style={{ marginTop: "16px" }}>
            <ThemeToggle />
          </div>
        </motion.div>

        {/* Encryption trust copy */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.42, ease }}
          className="text-center"
          style={{ marginTop: "24px" }}
        >
          <p
            className="font-body"
            style={{
              fontSize: "0.9rem",
              color: "var(--text-primary)",
              fontWeight: 700,
              lineHeight: 1.5,
              marginBottom: "2px",
            }}
          >
            End-to-end encrypted
          </p>
          <p
            className="font-body"
            style={{
              fontSize: "0.9rem",
              color: "var(--text-muted)",
              lineHeight: 1.5,
            }}
          >
            We can&apos;t see your data. Ever.
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.52, ease }}
          className="w-full flex flex-col items-center"
          style={{
            marginTop: "26px",
            borderRadius: "16px",
            padding: "16px 0 0 0",
          }}
        >
          <motion.button
            type="button"
            onClick={nextStep}
            data-ocid="create-vault-btn"
            whileHover={{
              scale: 1.015,
              boxShadow: isDark
                ? "0 2px 12px rgba(29,186,122,0.22)"
                : "0 2px 12px rgba(0,0,0,0.2)",
            }}
            whileTap={{ scale: 0.97 }}
            className="font-display font-semibold"
            style={{
              background: "var(--btn-primary-bg)",
              color: "var(--btn-primary-text)",
              borderRadius: "14px",
              fontSize: "16px",
              padding: "16px 24px",
              width: "100%",
              maxWidth: "320px",
              border: "none",
              cursor: "pointer",
              letterSpacing: "-0.01em",
              boxShadow: "var(--shadow-cta)",
              transition: "background 0.3s ease, box-shadow 0.3s ease",
            }}
          >
            Create Vault
          </motion.button>

          {/* Trust strip */}
          <p
            className="text-center font-body"
            style={{
              fontSize: "10.5px",
              color: "var(--text-muted)",
              letterSpacing: "0.01em",
              marginTop: "12px",
            }}
          >
            AES-256 encryption · Zero data access
          </p>
        </motion.div>
      </div>
    </div>
  );
}
