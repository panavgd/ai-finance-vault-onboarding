import {
  ArrowRight,
  Camera,
  FileWarning,
  Lightbulb,
  Lock,
  Shield,
  TrendingDown,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useOnboardingStore } from "../../store/onboardingStore";
import type { AssetType, BuildingGoal } from "../../types/onboarding";

const ease = [0.4, 0, 0.2, 1] as const;

// ─── AI Signal Footer ─────────────────────────────────────────────────────────

const BAR_HEIGHTS = [
  { h: 6, id: "b1" },
  { h: 10, id: "b2" },
  { h: 14, id: "b3" },
  { h: 10, id: "b4" },
  { h: 6, id: "b5" },
];

function AiSignalFooter() {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className="flex items-center justify-center gap-2 pb-2"
      aria-hidden="true"
    >
      <div className="flex items-end gap-[3px]">
        {BAR_HEIGHTS.map(({ h, id }, i) => (
          <motion.div
            key={id}
            style={{
              width: "3px",
              height: `${h}px`,
              borderRadius: "2px",
              background: "var(--accent)",
              transformOrigin: "bottom",
              opacity: reducedMotion ? 0.5 : undefined,
              scaleY: reducedMotion ? 0.5 : undefined,
            }}
            animate={
              reducedMotion
                ? undefined
                : { scaleY: [0.35, 1, 0.35], opacity: [0.35, 0.7, 0.35] }
            }
            transition={
              reducedMotion
                ? undefined
                : {
                    duration: 1.2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: i * 0.14,
                  }
            }
          />
        ))}
      </div>
      <span
        className="font-body"
        style={{
          fontSize: "11px",
          color: "var(--ai-signal-text)",
          opacity: 0.75,
        }}
      >
        Vault intelligence active.
      </span>
    </div>
  );
}

// ─── Calculations ─────────────────────────────────────────────────────────────

function calcNetWorth(assets: number, income: string): string {
  const incomeCrore: Record<string, number> = {
    "0-5l": 0.3,
    "5-10": 0.8,
    "10-30": 2.5,
    "50+": 8,
  };
  const base = incomeCrore[income] ?? 1;
  const val = assets * base * 1.5;
  if (val < 1) return "< 1 Cr";
  if (val < 10) return `~${Number(val.toFixed(1))} Cr`;
  return `~${Math.round(val)} Cr`;
}

function calcRiskScore(selectedAssets: AssetType[]): {
  score: number;
  label: string;
  color: string;
} {
  const hasCrypto = selectedAssets.includes("crypto");
  const hasBonds = selectedAssets.includes("bonds");
  const hasSavings = selectedAssets.includes("savings");
  const diversified = selectedAssets.length >= 4;

  if (hasCrypto && !hasBonds)
    return { score: 78, label: "High risk", color: "#F59E0B" };
  if (diversified && (hasBonds || hasSavings))
    return { score: 42, label: "Low risk", color: "var(--accent)" };
  return { score: 58, label: "Medium risk", color: "#F59E0B" };
}

function calcProtection(
  isInsured: boolean | null,
  hasDocuments: boolean | null,
): { label: string; color: string; sub: string } {
  if (isInsured && hasDocuments)
    return { label: "Strong", color: "var(--accent)", sub: "Well protected" };
  if (isInsured || hasDocuments)
    return { label: "Partial", color: "#F59E0B", sub: "Gaps present" };
  return {
    label: "Review needed",
    color: "#F59E0B",
    sub: "Consider improving",
  };
}

function calcClarityScore(
  selectedAssets: AssetType[],
  isInsured: boolean | null,
  hasDocuments: boolean | null,
): {
  overall: number;
  assets: number;
  protection: number;
  organization: number;
} {
  const assetsScore = Math.min(selectedAssets.length * 14, 90);
  const protectionScore = isInsured ? 70 : 30;
  const organizationScore = hasDocuments ? 80 : 25;
  const overall = Math.round(
    (assetsScore + protectionScore + organizationScore) / 3,
  );
  return {
    overall,
    assets: assetsScore,
    protection: protectionScore,
    organization: organizationScore,
  };
}

// ─── Personalized tip ─────────────────────────────────────────────────────────

const GOAL_TIPS: Record<BuildingGoal, string> = {
  personal_wealth:
    "Start with a 3-month emergency fund — it's the foundation of every strong wealth plan.",
  business:
    "Keep business and personal accounts separate from day one to protect both.",
  family:
    "Your next step: get a protection plan in place for the people who depend on you.",
  legacy:
    "Consider setting up a trust or estate plan — it's how wealth outlives you.",
};

const GOAL_LABELS: Record<BuildingGoal, string> = {
  personal_wealth: "Personal Wealth",
  business: "Business",
  family: "Family",
  legacy: "Legacy",
};

// ─── SVG Gauge ────────────────────────────────────────────────────────────────

function ClarityGauge({ score }: { score: number }) {
  const size = 108;
  const strokeWidth = 8;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--progress-bg)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, delay: 0.7, ease: [0.4, 0, 0.2, 1] }}
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.7" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.9, ease }}
          className="font-display font-bold leading-none"
          style={{ fontSize: "26px", color: "var(--accent)" }}
        >
          {score}
        </motion.span>
        <span
          className="text-xs font-body"
          style={{ color: "var(--text-muted)" }}
        >
          /100
        </span>
      </div>
    </div>
  );
}

// ─── Score bar ────────────────────────────────────────────────────────────────

function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="text-xs font-body flex-shrink-0 w-24"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </span>
      <div
        className="flex-1 h-1.5 rounded-full"
        style={{ background: "var(--progress-bg)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: "var(--progress-fill)" }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, delay: 0.85, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
      <span
        className="text-xs font-display font-semibold w-7 text-right"
        style={{ color: "var(--accent)" }}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Gap item ─────────────────────────────────────────────────────────────────

function GapItem({
  icon: Icon,
  text,
  detail,
}: {
  icon: React.ElementType;
  text: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div
        className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.18)",
        }}
      >
        <Icon
          className="w-3.5 h-3.5"
          style={{ color: "#F59E0B" }}
          strokeWidth={2}
        />
      </div>
      <div className="min-w-0">
        <p
          className="text-sm font-body leading-snug"
          style={{ color: "var(--text-primary)" }}
        >
          {text}
        </p>
        <p
          className="text-xs font-body mt-0.5"
          style={{ color: "var(--text-secondary)" }}
        >
          {detail}
        </p>
      </div>
    </div>
  );
}

// ─── Metric card ─────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  valueColor,
}: {
  label: string;
  value: string;
  sub: string;
  valueColor?: string;
}) {
  return (
    <div
      className="rounded-2xl p-3 flex flex-col gap-0.5"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <p
        className="text-xs font-body font-medium leading-tight"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </p>
      <p
        className="font-display font-bold text-base leading-snug"
        style={{ color: valueColor ?? "var(--text-primary)" }}
      >
        {value}
      </p>
      <p
        className="text-xs font-body"
        style={{ color: "var(--text-secondary)" }}
      >
        {sub}
      </p>
    </div>
  );
}

// ─── Pulse rings ──────────────────────────────────────────────────────────────

function PulseRings() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      aria-hidden="true"
    >
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ border: "1px solid var(--card-border)" }}
          initial={{ width: 56, height: 56, opacity: 0.6 }}
          animate={{ width: 56 + i * 28, height: 56 + i * 28, opacity: 0 }}
          transition={{
            duration: 2.2,
            delay: i * 0.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// ─── Vault Summary Card ───────────────────────────────────────────────────────

function VaultSummaryCard({
  fullName,
  buildingGoals,
  netWorth,
  riskScore,
  clarityScore,
}: {
  fullName: string;
  buildingGoals: BuildingGoal[];
  netWorth: string;
  riskScore: number;
  clarityScore: number;
  onSaved: () => void;
}) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const goalLabels =
    buildingGoals.map((g) => GOAL_LABELS[g]).join(", ") || "Wealth";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.52, ease }}
      data-ocid="vault-summary-card"
    >
      <div
        className="rounded-2xl p-4 space-y-3"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-xs font-body font-medium uppercase tracking-widest"
              style={{ color: "var(--text-secondary)", letterSpacing: "0.1em" }}
            >
              Your Vault Summary
            </p>
            <p
              className="text-base font-display font-bold mt-0.5"
              style={{ color: "var(--text-primary)" }}
            >
              {fullName || "Your Vault"}
            </p>
          </div>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "var(--app-bg-2)",
              border: "1px solid var(--card-border)",
            }}
          >
            <Camera
              className="w-4 h-4"
              style={{ color: "var(--text-secondary)" }}
              strokeWidth={1.8}
            />
          </div>
        </div>

        {/* Goal tags */}
        <div className="flex flex-wrap gap-1.5">
          {buildingGoals.length > 0 ? (
            buildingGoals.map((g) => (
              <span
                key={g}
                className="px-2 py-0.5 rounded-full text-xs font-body font-medium"
                style={{
                  background: "var(--accent-tint)",
                  color: "var(--accent)",
                  border: "1px solid var(--card-border)",
                }}
              >
                {GOAL_LABELS[g]}
              </span>
            ))
          ) : (
            <span
              className="px-2 py-0.5 rounded-full text-xs font-body font-medium"
              style={{
                background: "var(--accent-tint)",
                color: "var(--accent)",
                border: "1px solid var(--card-border)",
              }}
            >
              {goalLabels}
            </span>
          )}
        </div>

        {/* Metrics row */}
        <div
          className="grid grid-cols-3 gap-2 pt-1 border-t"
          style={{ borderColor: "var(--card-border)" }}
        >
          <div className="text-center">
            <p
              className="text-xs font-body"
              style={{ color: "var(--text-muted)" }}
            >
              Net Worth
            </p>
            <p
              className="text-sm font-display font-bold mt-0.5"
              style={{ color: "var(--accent)" }}
            >
              {netWorth}
            </p>
          </div>
          <div className="text-center">
            <p
              className="text-xs font-body"
              style={{ color: "var(--text-muted)" }}
            >
              Risk
            </p>
            <p
              className="text-sm font-display font-bold mt-0.5"
              style={{ color: "var(--text-primary)" }}
            >
              {riskScore}/100
            </p>
          </div>
          <div className="text-center">
            <p
              className="text-xs font-body"
              style={{ color: "var(--text-muted)" }}
            >
              Clarity
            </p>
            <p
              className="text-sm font-display font-bold mt-0.5"
              style={{ color: "var(--accent)" }}
            >
              {clarityScore}/100
            </p>
          </div>
        </div>

        <p
          className="text-center text-xs font-body"
          style={{ color: "var(--text-muted)", opacity: 0.6 }}
        >
          Powered by SafeMint
        </p>
      </div>

      <motion.button
        type="button"
        onClick={handleSave}
        data-ocid="save-summary-btn"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl font-body text-sm font-medium transition-smooth"
        style={{
          height: "40px",
          background: saved ? "var(--accent-tint)" : "var(--card-bg)",
          border: saved
            ? "1px solid var(--accent)"
            : "1px solid var(--card-border)",
          color: saved ? "var(--accent)" : "var(--text-secondary)",
        }}
      >
        <Camera className="w-3.5 h-3.5" strokeWidth={2} />
        {saved ? "Copied!" : "Save Summary"}
      </motion.button>
    </motion.div>
  );
}

// ─── Personalized Tip ─────────────────────────────────────────────────────────

function PersonalizedTip({ buildingGoals }: { buildingGoals: BuildingGoal[] }) {
  const primaryGoal =
    buildingGoals.length > 0
      ? buildingGoals[0]
      : ("personal_wealth" as BuildingGoal);
  const tip =
    GOAL_TIPS[primaryGoal] ??
    "Your vault is ready — explore your personalized financial insights inside.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6, ease }}
      className="rounded-2xl p-4"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        boxShadow: "var(--shadow-card)",
      }}
      data-ocid="personalized-tip"
    >
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5"
          style={{
            background: "var(--app-bg-2)",
            border: "1px solid var(--card-border)",
          }}
        >
          <Lightbulb
            className="w-4 h-4"
            style={{ color: "var(--text-secondary)" }}
            strokeWidth={1.8}
          />
        </div>
        <div className="min-w-0">
          <p
            className="text-xs font-body font-semibold mb-1"
            style={{ color: "var(--text-secondary)", letterSpacing: "0.04em" }}
          >
            Your First Step
          </p>
          <p
            className="text-sm font-body leading-relaxed"
            style={{ color: "var(--text-primary)" }}
          >
            {tip}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Step5VaultReady({
  onEnterVault,
}: { onEnterVault?: () => void }) {
  const { data } = useOnboardingStore();
  const { isDark } = useTheme();

  const netWorth = useMemo(
    () => calcNetWorth(data.assets, data.income),
    [data.assets, data.income],
  );
  const risk = useMemo(
    () => calcRiskScore(data.selectedAssets),
    [data.selectedAssets],
  );
  const protection = useMemo(
    () => calcProtection(data.isInsured, data.hasDocuments),
    [data.isInsured, data.hasDocuments],
  );
  const clarity = useMemo(
    () =>
      calcClarityScore(data.selectedAssets, data.isInsured, data.hasDocuments),
    [data.selectedAssets, data.isInsured, data.hasDocuments],
  );

  const gaps = useMemo(() => {
    const items: { icon: React.ElementType; text: string; detail: string }[] =
      [];
    if (!data.isInsured) {
      items.push({
        icon: Shield,
        text: "Consider reviewing your insurance coverage",
        detail: "Some assets may benefit from additional protection",
      });
    }
    if (!data.hasDocuments) {
      items.push({
        icon: FileWarning,
        text: "Consolidating your documents could improve visibility",
        detail: "Scattered documents can reduce financial clarity",
      });
    }
    if (
      data.selectedAssets.includes("crypto") &&
      !data.selectedAssets.includes("bonds")
    ) {
      items.push({
        icon: TrendingDown,
        text: "High volatility — consider adding hedge assets",
        detail: "Bonds or savings can help balance crypto exposure",
      });
    }
    if (items.length === 0) {
      items.push({
        icon: Shield,
        text: "Optimize asset diversification",
        detail: "Broaden allocation for long-term resilience",
      });
    }
    return items.slice(0, 3);
  }, [data.selectedAssets, data.isInsured, data.hasDocuments]);

  const name = data.fullName || "";

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Phase label */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease }}
        className="flex-shrink-0 px-5 pt-4 pb-1"
      >
        <p
          className="text-xs font-body font-medium tracking-wide text-center"
          style={{ color: "var(--text-secondary)" }}
        >
          All done
        </p>
      </motion.div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto min-h-0 px-5 pb-2 space-y-3">
        {/* Vault Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease }}
          className="flex flex-col items-center text-center pt-2 pb-1"
        >
          <div
            className="relative flex items-center justify-center mb-3"
            style={{ width: 64, height: 64 }}
          >
            <PulseRings />
            <div
              className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--card-border)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <Shield
                className="w-7 h-7"
                style={{ color: "var(--accent)" }}
                strokeWidth={1.5}
              />
            </div>
          </div>

          <h2
            className="font-display font-bold leading-tight"
            style={{
              fontSize: "clamp(18px, 5vw, 22px)",
              color: "var(--text-primary)",
            }}
          >
            Your vault is ready{name ? `, ${name}` : ""}.
          </h2>
          <p
            className="text-sm font-body mt-1"
            style={{ color: "var(--text-secondary)" }}
          >
            Here's your financial snapshot.
          </p>
        </motion.div>

        {/* Three metric cards */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22, ease }}
          className="grid grid-cols-3 gap-2"
        >
          <MetricCard label="Net worth" value={netWorth} sub="Estimated" />
          <MetricCard
            label="Risk score"
            value={`${risk.score}/100`}
            sub={risk.label}
            valueColor={risk.color}
          />
          <MetricCard
            label="Protection"
            value={protection.label}
            sub={protection.sub}
            valueColor={protection.color}
          />
        </motion.div>

        {/* Protection Gaps */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.34, ease }}
          className="rounded-2xl p-4 space-y-3"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <p
            className="text-xs font-body font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Here's what we'll focus on first
          </p>
          {gaps.map((gap) => (
            <GapItem
              key={gap.text}
              icon={gap.icon}
              text={gap.text}
              detail={gap.detail}
            />
          ))}
        </motion.div>

        {/* Financial Clarity Score */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.46, ease }}
          className="rounded-2xl p-4"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <p
            className="text-xs font-body font-medium mb-3"
            style={{ color: "var(--text-secondary)" }}
          >
            Financial clarity score
          </p>
          <div className="flex items-center gap-4">
            <ClarityGauge score={clarity.overall} />
            <div className="flex-1 space-y-2 min-w-0">
              <ScoreRow label="Assets visibility" value={clarity.assets} />
              <ScoreRow label="Protection" value={clarity.protection} />
              <ScoreRow label="Organisation" value={clarity.organization} />
            </div>
          </div>
        </motion.div>

        {/* Vault Summary Card */}
        <VaultSummaryCard
          fullName={name}
          buildingGoals={data.buildingGoals}
          netWorth={netWorth}
          riskScore={risk.score}
          clarityScore={clarity.overall}
          onSaved={() => {}}
        />

        {/* Personalized Tip */}
        <PersonalizedTip buildingGoals={data.buildingGoals} />
      </div>

      {/* CTA */}
      <div className="flex-shrink-0 px-5 pt-2 pb-5">
        <AiSignalFooter />
        <motion.button
          type="button"
          onClick={onEnterVault ?? (() => {})}
          data-ocid="enter-vault-btn"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.68, ease }}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98, y: 0 }}
          className="w-full flex items-center justify-center gap-2.5 rounded-full font-display font-medium text-base"
          style={{
            background: "var(--btn-primary-bg)",
            color: "var(--btn-primary-text)",
            height: "52px",
            boxShadow: "var(--shadow-cta)",
            transition: "box-shadow 0.15s ease, background 0.3s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = isDark
              ? "0 4px 20px rgba(29,186,122,0.45)"
              : "0 4px 16px rgba(0,0,0,0.25)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "var(--shadow-cta)";
          }}
        >
          Enter My Vault
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </motion.button>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.8, ease }}
          className="text-center text-xs font-body mt-2 flex items-center justify-center gap-1.5"
          style={{ color: "var(--text-muted)" }}
        >
          <Lock
            className="w-3 h-3"
            strokeWidth={2}
            style={{ color: "var(--text-muted)", opacity: 0.6 }}
          />
          Your vault is secured with end-to-end encryption
        </motion.p>
      </div>
    </div>
  );
}
