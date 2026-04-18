import { Fingerprint, Shield } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { NavigationButtons } from "../../components/onboarding/NavigationButtons";
import { useTheme } from "../../context/ThemeContext";
import { useOnboardingStore } from "../../store/onboardingStore";

const PIN_LENGTH = 6;

export function Step7Security() {
  const { nextStep, prevStep } = useOnboardingStore();
  const { isDark } = useTheme();
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [pin, setPin] = useState("");
  const [pulseDot, setPulseDot] = useState<number | null>(null);
  const [pinSuccess, setPinSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timeout);
  }, []);

  const handlePinInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH);
    const prev = pin;
    setPin(raw);
    if (raw.length > prev.length) {
      const dotIndex = raw.length - 1;
      setPulseDot(dotIndex);
      setTimeout(() => setPulseDot(null), 400);
    }
    setPinSuccess(raw.length === PIN_LENGTH);
  };

  const canProceed = pin.length === PIN_LENGTH;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col min-h-full"
    >
      {/* Header */}
      <div className="px-6 pt-8 pb-5 text-center">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
          style={{
            background: "var(--accent-tint)",
            border: isDark
              ? "1px solid rgba(29,186,122,0.2)"
              : "1px solid rgba(24,167,110,0.2)",
          }}
        >
          <Shield className="w-7 h-7" style={{ color: "var(--accent)" }} />
        </motion.div>
        <h1
          className="font-display font-semibold text-2xl mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          Secure your vault
        </h1>
        <p
          className="text-sm font-body"
          style={{ color: "var(--text-secondary)" }}
        >
          Takes less than 10 seconds
        </p>
      </div>

      {/* Body */}
      <div className="flex-1 px-5 flex flex-col gap-4">
        {/* Biometric Section */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
              style={{
                background: biometricEnabled
                  ? "var(--accent-tint)"
                  : isDark
                    ? "rgba(255,255,255,0.05)"
                    : "var(--app-bg-2)",
                border: biometricEnabled
                  ? isDark
                    ? "1px solid rgba(29,186,122,0.2)"
                    : "1px solid rgba(24,167,110,0.2)"
                  : "1px solid var(--card-border)",
                transition: "all 0.2s ease",
              }}
            >
              <Fingerprint
                className="w-5 h-5"
                style={{
                  color: biometricEnabled
                    ? "var(--accent)"
                    : "var(--text-muted)",
                  transition: "color 0.2s ease",
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="font-display font-medium text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                Face ID / Touch ID
              </p>
              <p
                className="text-xs mt-0.5 font-body"
                style={{ color: "var(--text-secondary)" }}
              >
                Use Face ID for quick and secure access
              </p>
            </div>
            {/* Toggle */}
            <button
              type="button"
              role="switch"
              aria-checked={biometricEnabled}
              aria-label="Toggle biometric authentication"
              onClick={() => setBiometricEnabled((v) => !v)}
              data-ocid="biometric-toggle"
              className="shrink-0 relative w-11 h-6 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                background: biometricEnabled
                  ? "var(--accent)"
                  : isDark
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(0,0,0,0.1)",
              }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200"
                style={{
                  transform: biometricEnabled
                    ? "translateX(20px)"
                    : "translateX(0px)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                }}
              />
            </button>
          </div>
        </div>

        {/* PIN Section */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <p
              className="font-display font-medium text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              6-digit PIN
            </p>
            <AnimatePresence>
              {pinSuccess && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.25 }}
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--accent-tint)",
                    color: "var(--accent)",
                    border: isDark
                      ? "1px solid rgba(29,186,122,0.25)"
                      : "1px solid rgba(24,167,110,0.2)",
                  }}
                >
                  Set
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Dot indicators */}
          <div
            className="flex items-center justify-center gap-3 mb-3 relative"
            data-ocid="pin-dots"
          >
            {Array.from({ length: PIN_LENGTH }).map((_, i) => {
              const dotKey = `pin-dot-${i}`;
              const filled = i < pin.length;
              const isPulsing = pulseDot === i;
              const isSuccess = pinSuccess && filled;
              return (
                <motion.div
                  key={dotKey}
                  animate={
                    isPulsing
                      ? { scale: [1, 1.35, 1] }
                      : isSuccess
                        ? { scale: [1, 1.1, 1] }
                        : { scale: 1 }
                  }
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="w-4 h-4 rounded-full"
                  style={{
                    background: isSuccess
                      ? "var(--accent)"
                      : filled
                        ? "var(--text-primary)"
                        : "var(--card-border)",
                    border: filled ? "none" : "1px solid var(--card-border)",
                    transition: "background 0.15s ease, box-shadow 0.15s ease",
                  }}
                />
              );
            })}

            {/* Hidden input */}
            <input
              ref={inputRef}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={PIN_LENGTH}
              value={pin}
              onChange={handlePinInput}
              aria-label="Enter 6-digit PIN"
              data-ocid="pin-input"
              className="absolute inset-0 w-full h-full opacity-0 cursor-default"
              style={{ caretColor: "transparent" }}
            />
          </div>

          <p
            className="text-xs text-center font-body"
            style={{ color: "var(--text-muted)" }}
          >
            {pin.length === 0
              ? "Tap above to enter your PIN"
              : pin.length < PIN_LENGTH
                ? `${PIN_LENGTH - pin.length} digits remaining`
                : "PIN ready"}
          </p>
        </div>

        {/* Trust line */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          <Shield
            className="w-3.5 h-3.5"
            style={{ color: "var(--text-muted)" }}
          />
          <span
            className="text-xs font-body"
            style={{ color: "var(--text-muted)" }}
          >
            Protected with bank-level encryption
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="pt-4">
        <NavigationButtons
          onNext={nextStep}
          onPrev={prevStep}
          nextLabel="Secure My Vault"
          canNext={canProceed}
          isLast={false}
        />
      </div>
    </motion.div>
  );
}
