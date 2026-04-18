import { ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useOnboardingStore } from "../../store/onboardingStore";

const ease = [0.4, 0, 0.2, 1] as const;

export function StepCreateVault() {
  const { nextStep, prevStep, updateData, data } = useOnboardingStore();
  const { isDark } = useTheme();

  const [fullName, setFullName] = useState(data.fullName);
  const [phone, setPhone] = useState(data.phone);

  const canProceed = fullName.trim().length > 0 && phone.trim().length > 0;

  const handleContinue = () => {
    if (!canProceed) return;
    updateData({ fullName: fullName.trim(), phone: phone.trim() });
    nextStep();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-3">
        {/* Phase label */}
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease }}
          className="text-xs font-body font-medium tracking-wide mb-3"
          style={{ color: "var(--text-secondary)" }}
        >
          Your identity
        </motion.p>

        {/* Vault icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.05, ease }}
          className="flex justify-center mb-5"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: "var(--accent-tint)",
              border: isDark
                ? "1px solid rgba(29,186,122,0.2)"
                : "1px solid rgba(24,167,110,0.2)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <ShieldCheck
              className="w-7 h-7"
              strokeWidth={1.8}
              color="var(--accent)"
            />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease }}
          className="text-2xl font-display font-bold tracking-tight text-center mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          Create your vault
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.13, ease }}
          className="text-xs font-body text-center mb-7"
          style={{ color: "var(--text-secondary)" }}
        >
          Private. Secure. Only yours.
        </motion.p>

        {/* Inputs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.18, ease }}
          className="space-y-3"
        >
          <div>
            <label
              htmlFor="vault-full-name"
              className="block text-xs font-body font-medium mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Full Name
            </label>
            <VaultInput
              id="vault-full-name"
              placeholder="Enter your full name"
              value={fullName}
              onChange={setFullName}
              isDark={isDark}
              dataOcid="input-vault-full-name"
            />
          </div>
          <div>
            <label
              htmlFor="vault-phone"
              className="block text-xs font-body font-medium mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Phone Number
            </label>
            <VaultInput
              id="vault-phone"
              placeholder="Enter your phone number"
              value={phone}
              onChange={setPhone}
              type="tel"
              isDark={isDark}
              dataOcid="input-vault-phone"
            />
          </div>
        </motion.div>

        {/* Trust text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25, ease }}
          className="flex items-center justify-center gap-1.5 text-xs font-body text-center mt-5"
          style={{ color: "var(--accent)", opacity: 0.7 }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{ flexShrink: 0 }}
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Your data stays encrypted. Always.
        </motion.p>
      </div>

      {/* CTA area */}
      <div className="px-5 pb-5 pt-2 flex-shrink-0 space-y-2">
        <motion.button
          type="button"
          onClick={handleContinue}
          disabled={!canProceed}
          data-ocid="vault-continue"
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
          Continue →
        </motion.button>

        <button
          type="button"
          onClick={prevStep}
          data-ocid="vault-back"
          className="w-full h-9 rounded-full text-xs font-body transition-smooth"
          style={{ color: "var(--text-muted)" }}
        >
          Back
        </button>
      </div>
    </div>
  );
}

// ── Vault input field ──────────────────────────────────────────────────────────
interface VaultInputProps {
  id: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  isDark: boolean;
  dataOcid?: string;
}

function VaultInput({
  id,
  placeholder,
  value,
  onChange,
  type = "text",
  isDark,
  dataOcid,
}: VaultInputProps) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-ocid={dataOcid}
        autoComplete="off"
        className="w-full h-12 px-4 rounded-2xl text-sm font-body outline-none transition-smooth"
        style={{
          background: "var(--input-bg)",
          border: "1px solid var(--input-border)",
          color: "var(--text-primary)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--input-focus-border)";
          e.currentTarget.style.boxShadow = "var(--input-focus-shadow)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--input-border)";
          e.currentTarget.style.boxShadow = "none";
        }}
        aria-label={placeholder}
      />
      {/* Placeholder opacity fix */}
      <style>{`
        #${id}::placeholder {
          color: ${isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"};
        }
      `}</style>
    </div>
  );
}
