import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Cloud,
  CloudRain,
  Coins,
  CreditCard,
  FileText,
  Globe,
  Heart,
  Home,
  Lock,
  LockOpen,
  MessageSquare,
  Plus,
  ScrollText,
  Shield,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  TrendingUp,
  Upload,
  User,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import React from "react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useOnboardingStore } from "../store/onboardingStore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Asset {
  id: string;
  category: "property" | "bank" | "investment" | "gold";
  name: string;
  value: number;
  details: Record<string, string>;
  addedAt: Date;
}

interface Document {
  id: string;
  category: string;
  filename: string;
  note?: string;
  addedAt: Date;
}

interface Nominee {
  id: string;
  name: string;
  relationship: string;
  allocationPct?: number;
}

interface LegacyPlan {
  executor: string;
  primaryBeneficiary: string;
  specialWishes: string;
}

interface VaultHomeProps {
  onExit: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_ICONS = {
  property: Home,
  bank: Wallet,
  investment: Briefcase,
  gold: Coins,
} as const;

const CATEGORY_LABELS = {
  property: "Property",
  bank: "Bank Account",
  investment: "Investments",
  gold: "Gold / Others",
} as const;

const DOC_CATEGORIES = ["Identity", "Financial", "Insurance", "Medical"];

const RELATIONSHIPS = ["Spouse", "Child", "Parent", "Sibling", "Other"];

const LEGACY_ASSET_THRESHOLD = 3;

const AI_AUTOFILL: Record<
  "property" | "bank" | "investment" | "gold",
  { name: string; value: string; details: string }
> = {
  property: {
    name: "Family Home",
    value: "5000000",
    details: "Mumbai, Maharashtra",
  },
  bank: { name: "Primary Savings", value: "250000", details: "HDFC Bank" },
  investment: {
    name: "Equity Portfolio",
    value: "1200000",
    details: "Zerodha / NSE",
  },
  gold: { name: "Gold Jewellery", value: "300000", details: "Home Safe" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatINR(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin === 1) return "1 min ago";
  if (diffMin < 60) return `${diffMin} min ago`;
  return `${Math.floor(diffMin / 60)}h ago`;
}

// ─── Card Shell ───────────────────────────────────────────────────────────────

function Card({
  children,
  className = "",
  accentBar = false,
  locked = false,
}: {
  children: React.ReactNode;
  className?: string;
  accentBar?: boolean;
  locked?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 relative overflow-hidden ${className}`}
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        boxShadow: "var(--shadow-card)",
        opacity: locked ? 0.6 : 1,
        transition: "opacity 0.4s ease",
      }}
    >
      {accentBar && (
        <div
          className="absolute left-0 top-3 bottom-3 rounded-r-full"
          style={{ width: 3, background: "var(--accent)" }}
        />
      )}
      <div className={accentBar ? "pl-3" : ""}>{children}</div>
    </div>
  );
}

// ─── CountUp ──────────────────────────────────────────────────────────────────

function CountUp({
  target,
  duration = 1200,
}: { target: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number>(0);
  const start = useRef(Date.now());

  useEffect(() => {
    start.current = Date.now();
    const step = () => {
      const elapsed = Date.now() - start.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(target * eased));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return <>{formatINR(display)}</>;
}

// ─── Net Worth History Card ───────────────────────────────────────────────────

function NetWorthHistoryCard({ assets }: { assets: Asset[] }) {
  const total = assets.reduce((sum, a) => sum + a.value, 0);
  const hasAssets = assets.length > 0;
  const recent = [...assets].reverse().slice(0, 4);
  const reduced = useReducedMotion();

  // Track previous asset count to detect new additions → trigger glow pulse
  const prevCountRef = useRef(assets.length);
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (assets.length > prevCountRef.current && assets.length > 0) {
      if (!reduced) {
        setIsPulsing(true);
        const t = setTimeout(() => setIsPulsing(false), 900);
        return () => clearTimeout(t);
      }
    }
    prevCountRef.current = assets.length;
  }, [assets.length, reduced]);

  // Breathing animation — only when hasAssets and motion is allowed
  const breathingAnimation =
    hasAssets && !reduced
      ? {
          scale: [1, 1.015, 1],
          boxShadow: [
            "var(--shadow-card)",
            "0 4px 28px 0 rgba(29,186,122,0.14), 0 0 0 1px rgba(29,186,122,0.18)",
            "var(--shadow-card)",
          ],
        }
      : {};

  const breathingTransition =
    hasAssets && !reduced
      ? {
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse" as const,
          ease: "easeInOut" as const,
        }
      : {};

  // Glow pulse when a new asset is added
  const pulseAnimation =
    isPulsing && !reduced
      ? {
          boxShadow: [
            "var(--shadow-card)",
            "0 0 0 3px rgba(29,186,122,0.45), 0 8px 32px rgba(29,186,122,0.28)",
            "var(--shadow-card)",
          ],
        }
      : undefined;

  const pulseTransition =
    isPulsing && !reduced
      ? { duration: 0.85, ease: [0.4, 0, 0.2, 1] as const }
      : undefined;

  return (
    <motion.div
      animate={isPulsing ? pulseAnimation : breathingAnimation}
      transition={isPulsing ? pulseTransition : breathingTransition}
      style={{ borderRadius: 16 }}
    >
      <Card accentBar>
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp
            className="w-4 h-4"
            style={{ color: "var(--accent)" }}
            strokeWidth={1.8}
          />
          <p
            className="font-display font-semibold text-base"
            style={{ color: "var(--text-primary)" }}
          >
            Net Worth
          </p>
          {hasAssets && (
            <span
              className="ml-auto text-xs font-body font-medium px-2 py-0.5 rounded-full"
              style={{
                background: "var(--accent-tint)",
                color: "var(--accent)",
              }}
            >
              Active
            </span>
          )}
        </div>

        {hasAssets ? (
          <>
            <motion.p
              key={total}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display font-bold mb-1"
              style={{ fontSize: 28, color: "var(--text-primary)" }}
            >
              <CountUp target={total} />
            </motion.p>
            {/* Faint residual heartbeat waves — always alive below the number */}
            <div
              className="relative overflow-hidden rounded-lg"
              style={{ height: 28, marginBottom: 4, marginTop: 2 }}
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 400 28"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full"
                aria-hidden="true"
              >
                <defs>
                  <style>{`
                    @keyframes nwResidual1 { from { transform: translateX(0); } to { transform: translateX(-50%); } }
                    @keyframes nwResidual2 { from { transform: translateX(-25%); } to { transform: translateX(-75%); } }
                    @keyframes nwResidual3 { from { transform: translateX(-10%); } to { transform: translateX(-60%); } }
                    @media (prefers-reduced-motion: reduce) {
                      .nw-r1, .nw-r2, .nw-r3 { animation: none !important; }
                    }
                  `}</style>
                </defs>
                <path
                  className="nw-r1"
                  style={{
                    fill: "var(--accent)",
                    opacity: 0.06,
                    animation: "nwResidual1 11s linear infinite",
                    transformOrigin: "0 100%",
                  }}
                  d="M0,16 C50,10 100,22 150,16 C200,10 250,22 300,16 C350,10 400,22 450,16 C500,10 550,22 600,16 C650,10 700,22 750,16 C800,10 850,22 900,16 L900,28 L0,28 Z"
                />
                <path
                  className="nw-r2"
                  style={{
                    fill: "var(--accent)",
                    opacity: 0.04,
                    animation: "nwResidual2 8s linear infinite",
                    transformOrigin: "0 100%",
                  }}
                  d="M0,19 C60,13 110,25 170,19 C230,13 280,25 340,19 C400,13 450,25 510,19 C570,13 620,25 680,19 C740,13 790,25 850,19 L850,28 L0,28 Z"
                />
                <path
                  className="nw-r3"
                  style={{
                    fill: "var(--accent)",
                    opacity: 0.03,
                    animation: "nwResidual3 6s linear infinite",
                    transformOrigin: "0 100%",
                  }}
                  d="M0,22 C40,18 90,26 140,22 C190,18 240,26 290,22 C340,18 390,26 440,22 C490,18 540,26 590,22 C640,18 690,26 740,22 L740,28 L0,28 Z"
                />
              </svg>
            </div>
          </>
        ) : (
          <div className="mb-1">
            <p
              className="text-xs font-body mb-2 text-center"
              style={{ color: "var(--text-secondary)" }}
            >
              Add your first asset to see your vault value
            </p>
            <div
              className="relative overflow-hidden rounded-xl"
              style={{ height: 56 }}
            >
              <svg
                viewBox="0 0 400 56"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full"
                aria-hidden="true"
              >
                <defs>
                  <style>{`
                    @keyframes wave1 { from { transform: translateX(0); } to { transform: translateX(-50%); } }
                    @keyframes wave2 { from { transform: translateX(-25%); } to { transform: translateX(-75%); } }
                    @keyframes wave3 { from { transform: translateX(-10%); } to { transform: translateX(-60%); } }
                    @media (prefers-reduced-motion: reduce) {
                      .sm-wave1, .sm-wave2, .sm-wave3 { animation: none !important; }
                    }
                  `}</style>
                </defs>
                {/* Wave 1 — slowest, deepest */}
                <path
                  className="sm-wave1"
                  style={{
                    fill: "var(--accent)",
                    opacity: 0.18,
                    animation: "wave1 11s linear infinite",
                    transformOrigin: "0 100%",
                  }}
                  d="M0,32 C50,20 100,44 150,32 C200,20 250,44 300,32 C350,20 400,44 450,32 C500,20 550,44 600,32 C650,20 700,44 750,32 C800,20 850,44 900,32 L900,56 L0,56 Z"
                />
                {/* Wave 2 — medium speed, mid opacity */}
                <path
                  className="sm-wave2"
                  style={{
                    fill: "var(--accent)",
                    opacity: 0.12,
                    animation: "wave2 8s linear infinite",
                    transformOrigin: "0 100%",
                  }}
                  d="M0,38 C60,26 110,50 170,38 C230,26 280,50 340,38 C400,26 450,50 510,38 C570,26 620,50 680,38 C740,26 790,50 850,38 L850,56 L0,56 Z"
                />
                {/* Wave 3 — fastest, lightest */}
                <path
                  className="sm-wave3"
                  style={{
                    fill: "var(--accent)",
                    opacity: 0.08,
                    animation: "wave3 6s linear infinite",
                    transformOrigin: "0 100%",
                  }}
                  d="M0,44 C40,36 90,52 140,44 C190,36 240,52 290,44 C340,36 390,52 440,44 C490,36 540,52 590,44 C640,36 690,52 740,44 L740,56 L0,56 Z"
                />
              </svg>
            </div>
          </div>
        )}

        {hasAssets && (
          <div className="mt-1 space-y-2">
            {recent.map((a) => {
              const Icon = CATEGORY_ICONS[a.category];
              return (
                <div key={a.id} className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--app-bg-2)" }}
                  >
                    <Icon
                      className="w-3 h-3"
                      style={{ color: "var(--accent)" }}
                      strokeWidth={1.8}
                    />
                  </div>
                  <p
                    className="flex-1 text-xs font-body truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {a.name}
                    <span style={{ color: "var(--accent)" }}>
                      {" "}
                      · +{formatINR(a.value)}
                    </span>
                  </p>
                  <p
                    className="text-xs font-body flex-shrink-0"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {relativeTime(a.addedAt)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </motion.div>
  );
}

// ─── Add Asset Card ───────────────────────────────────────────────────────────

function AddAssetCard({
  assets,
  onAddAsset,
}: {
  assets: Asset[];
  onAddAsset: (category?: "property" | "bank" | "investment" | "gold") => void;
}) {
  const categories: Array<"property" | "bank" | "investment" | "gold"> = [
    "property",
    "bank",
    "investment",
    "gold",
  ];

  return (
    <Card>
      <p
        className="font-display font-semibold text-base mb-0.5"
        style={{ color: "var(--text-primary)" }}
      >
        {assets.length === 0 ? "Add your first asset" : "Add an asset"}
      </p>
      <p
        className="text-xs font-body mb-3"
        style={{ color: "var(--text-secondary)" }}
      >
        Property, investments, gold &amp; more
      </p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {categories.map((cat) => {
          const Icon = CATEGORY_ICONS[cat];
          return (
            <button
              key={cat}
              type="button"
              data-ocid={`add-asset-category.${cat}`}
              onClick={() => onAddAsset(cat)}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 transition-smooth text-left"
              style={{
                background: "var(--app-bg-2)",
                border: "1px solid var(--card-border)",
              }}
            >
              <Icon
                className="w-3.5 h-3.5 flex-shrink-0"
                style={{ color: "var(--accent)" }}
                strokeWidth={1.8}
              />
              <span
                className="text-xs font-body font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {CATEGORY_LABELS[cat]}
              </span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        data-ocid="add-asset.primary_button"
        onClick={() => onAddAsset()}
        className="w-full flex items-center justify-center gap-2 rounded-full font-body font-medium text-sm transition-smooth"
        style={{
          height: 44,
          background: "var(--btn-primary-bg)",
          color: "var(--btn-primary-text)",
        }}
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        Add Asset
      </button>
    </Card>
  );
}

// ─── Vault Sections Card ──────────────────────────────────────────────────────

const VAULT_SECTIONS = [
  {
    id: "identity",
    label: "Identity",
    description: "Passport, Aadhaar, PAN, licences",
    Icon: User,
  },
  {
    id: "banking",
    label: "Banking",
    description: "Accounts, cards, statements",
    Icon: CreditCard,
  },
  {
    id: "insurance",
    label: "Insurance",
    description: "Life, health, vehicle policies",
    Icon: ShieldCheck,
  },
  {
    id: "digital-life",
    label: "Digital Life",
    description: "Passwords, subscriptions, accounts",
    Icon: Globe,
  },
] as const;

type VaultSectionId = (typeof VAULT_SECTIONS)[number]["id"];

interface VaultSectionItem {
  id: string;
  label: string;
  addedAt: Date;
}

function VaultSectionsCard() {
  const [expandedSection, setExpandedSection] = useState<VaultSectionId | null>(
    null,
  );
  const [sectionItems, setSectionItems] = useState<
    Record<VaultSectionId, VaultSectionItem[]>
  >({
    identity: [],
    banking: [],
    insurance: [],
    "digital-life": [],
  });
  const [addingIn, setAddingIn] = useState<VaultSectionId | null>(null);
  const [addLabel, setAddLabel] = useState("");
  const prefersReduced = useReducedMotion();

  const toggleSection = (id: VaultSectionId) => {
    setExpandedSection((prev) => (prev === id ? null : id));
    setAddingIn(null);
    setAddLabel("");
  };

  const handleAddItem = (sectionId: VaultSectionId) => {
    const trimmed = addLabel.trim();
    if (!trimmed) return;
    setSectionItems((prev) => ({
      ...prev,
      [sectionId]: [
        ...prev[sectionId],
        { id: generateId(), label: trimmed, addedAt: new Date() },
      ],
    }));
    setAddLabel("");
    setAddingIn(null);
  };

  const handleRemoveItem = (sectionId: VaultSectionId, itemId: string) => {
    setSectionItems((prev) => ({
      ...prev,
      [sectionId]: prev[sectionId].filter((i) => i.id !== itemId),
    }));
  };

  const totalItems = Object.values(sectionItems).reduce(
    (sum, arr) => sum + arr.length,
    0,
  );

  return (
    <Card accentBar>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p
          className="font-display font-semibold text-base"
          style={{ color: "var(--text-primary)" }}
        >
          Your Vault
        </p>
        {totalItems > 0 && (
          <span
            className="text-xs font-body font-medium px-2 py-0.5 rounded-full"
            style={{ background: "var(--accent-tint)", color: "var(--accent)" }}
          >
            {totalItems} stored
          </span>
        )}
      </div>

      {/* Section rows */}
      <div className="flex flex-col gap-1.5" data-ocid="vault-sections.list">
        {VAULT_SECTIONS.map((section) => {
          const isOpen = expandedSection === section.id;
          const items = sectionItems[section.id];
          const count = items.length;

          return (
            <div key={section.id}>
              {/* Row trigger */}
              <button
                type="button"
                data-ocid={`vault-sections.${section.id}.toggle`}
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-smooth"
                style={{
                  background: isOpen ? "var(--accent-tint)" : "var(--app-bg-2)",
                  border: `1px solid ${isOpen ? "var(--accent)" : "var(--card-border)"}`,
                  transition: "background 0.25s ease, border-color 0.25s ease",
                }}
              >
                {/* Icon */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isOpen ? "var(--accent)" : "var(--card-border)",
                    transition: "background 0.25s ease",
                  }}
                >
                  <section.Icon
                    className="w-4 h-4"
                    style={{
                      color: isOpen ? "#fff" : "var(--text-secondary)",
                      transition: "color 0.25s ease",
                    }}
                    strokeWidth={1.8}
                  />
                </div>

                {/* Label + description */}
                <div className="flex-1 text-left min-w-0">
                  <p
                    className="text-sm font-body font-semibold leading-tight"
                    style={{
                      color: isOpen ? "var(--accent)" : "var(--text-primary)",
                      transition: "color 0.25s ease",
                    }}
                  >
                    {section.label}
                  </p>
                  <p
                    className="text-xs font-body leading-tight mt-0.5 truncate"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {section.description}
                  </p>
                </div>

                {/* Count badge + chevron */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {count > 0 ? (
                    <span
                      className="text-xs font-body font-medium px-1.5 py-0.5 rounded-full"
                      style={{
                        background: "var(--accent-tint)",
                        color: "var(--accent)",
                      }}
                    >
                      {count}
                    </span>
                  ) : (
                    <span
                      className="text-xs font-body"
                      style={{ color: "var(--text-muted)" }}
                    >
                      0
                    </span>
                  )}
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{
                      duration: prefersReduced ? 0 : 0.22,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  >
                    <ChevronDown
                      className="w-3.5 h-3.5"
                      style={{ color: "var(--text-muted)" }}
                      strokeWidth={2}
                    />
                  </motion.div>
                </div>
              </button>

              {/* Expanded panel */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key={`panel-${section.id}`}
                    initial={
                      prefersReduced
                        ? { opacity: 0 }
                        : { opacity: 0, height: 0 }
                    }
                    animate={
                      prefersReduced
                        ? { opacity: 1 }
                        : { opacity: 1, height: "auto" }
                    }
                    exit={
                      prefersReduced
                        ? { opacity: 0 }
                        : { opacity: 0, height: 0 }
                    }
                    transition={{
                      duration: prefersReduced ? 0 : 0.28,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    style={{ overflow: "hidden" }}
                    data-ocid={`vault-sections.${section.id}.panel`}
                  >
                    <div
                      className="rounded-b-xl px-3 pb-3 pt-2 flex flex-col gap-2"
                      style={{
                        background: "var(--app-bg-2)",
                        borderLeft: "1px solid var(--card-border)",
                        borderRight: "1px solid var(--card-border)",
                        borderBottom: "1px solid var(--card-border)",
                        marginTop: -2,
                      }}
                    >
                      {/* Existing items */}
                      {items.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                          {items.map((item, idx) => (
                            <div
                              key={item.id}
                              data-ocid={`vault-sections.${section.id}.item.${idx + 1}`}
                              className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                              style={{ background: "var(--card-bg)" }}
                            >
                              <FileText
                                className="w-3.5 h-3.5 flex-shrink-0"
                                style={{ color: "var(--accent)" }}
                                strokeWidth={1.6}
                              />
                              <span
                                className="flex-1 text-xs font-body font-medium truncate min-w-0"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {item.label}
                              </span>
                              <button
                                type="button"
                                aria-label={`Remove ${item.label}`}
                                data-ocid={`vault-sections.${section.id}.delete_button.${idx + 1}`}
                                onClick={() =>
                                  handleRemoveItem(section.id, item.id)
                                }
                                className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full transition-smooth"
                              >
                                <X
                                  className="w-3 h-3"
                                  style={{ color: "var(--text-muted)" }}
                                  strokeWidth={2}
                                />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Empty state */}
                      {items.length === 0 && addingIn !== section.id && (
                        <div
                          data-ocid={`vault-sections.${section.id}.empty_state`}
                          className="flex flex-col items-center gap-1.5 py-3"
                        >
                          <section.Icon
                            className="w-6 h-6"
                            style={{ color: "var(--text-muted)", opacity: 0.5 }}
                            strokeWidth={1.4}
                          />
                          <p
                            className="text-xs font-body text-center"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Nothing added yet
                          </p>
                        </div>
                      )}

                      {/* Add form */}
                      {addingIn === section.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            ref={(el) => el?.focus()}
                            type="text"
                            placeholder={`e.g. ${section.description.split(",")[0].trim()}`}
                            value={addLabel}
                            onChange={(e) => setAddLabel(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddItem(section.id);
                              if (e.key === "Escape") {
                                setAddingIn(null);
                                setAddLabel("");
                              }
                            }}
                            data-ocid={`vault-sections.${section.id}.input`}
                            className="flex-1 text-xs font-body rounded-lg px-3 py-2 outline-none"
                            style={{
                              background: "var(--card-bg)",
                              border: "1px solid var(--input-focus-border)",
                              color: "var(--text-primary)",
                              boxShadow: "var(--input-focus-shadow)",
                            }}
                          />
                          <button
                            type="button"
                            data-ocid={`vault-sections.${section.id}.save_button`}
                            onClick={() => handleAddItem(section.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              background: "var(--accent)",
                              color: "#fff",
                            }}
                          >
                            <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                          </button>
                          <button
                            type="button"
                            data-ocid={`vault-sections.${section.id}.cancel_button`}
                            onClick={() => {
                              setAddingIn(null);
                              setAddLabel("");
                            }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              background: "var(--app-bg-2)",
                              border: "1px solid var(--card-border)",
                            }}
                          >
                            <X
                              className="w-3.5 h-3.5"
                              style={{ color: "var(--text-muted)" }}
                              strokeWidth={2}
                            />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          data-ocid={`vault-sections.${section.id}.add_button`}
                          onClick={() => setAddingIn(section.id)}
                          className="flex items-center gap-1.5 self-start text-xs font-body font-medium rounded-lg px-3 py-1.5 transition-smooth"
                          style={{
                            background: "var(--card-bg)",
                            border: "1px solid var(--card-border)",
                            color: "var(--accent)",
                          }}
                        >
                          <Plus
                            className="w-3 h-3"
                            strokeWidth={2.5}
                            style={{ color: "var(--accent)" }}
                          />
                          Add
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Documents Vault Card ─────────────────────────────────────────────────────

function DocumentsVaultCard({
  documents,
  onAddDocument,
  onCameraCapture,
  onRemoveDocument,
}: {
  documents: Document[];
  onAddDocument: () => void;
  onCameraCapture: (file: File) => void;
  onRemoveDocument: (id: string) => void;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  const toggleCat = (cat: string) =>
    setExpandedCats((prev) => ({ ...prev, [cat]: !prev[cat] }));

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onCameraCapture(file);
    // Reset so same file can be re-captured
    e.target.value = "";
  };

  const docsByCategory = DOC_CATEGORIES.map((cat) => ({
    cat,
    docs: documents.filter((d) => d.category === cat),
  }));

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <p
          className="font-display font-semibold text-base"
          style={{ color: "var(--text-primary)" }}
        >
          Documents
        </p>
        {documents.length > 0 && (
          <span
            className="text-xs font-body font-medium px-2 py-0.5 rounded-full"
            style={{ background: "var(--accent-tint)", color: "var(--accent)" }}
          >
            {documents.length} secured
          </span>
        )}
      </div>

      {/* Camera + Upload action buttons */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {/* Hidden camera input */}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleCameraChange}
          data-ocid="documents.camera_input"
        />
        <button
          type="button"
          data-ocid="documents.camera_button"
          onClick={() => cameraRef.current?.click()}
          className="flex items-center justify-center gap-2 rounded-xl px-3 py-3 transition-smooth"
          style={{
            background: "var(--app-bg-2)",
            border: "1px solid var(--card-border)",
          }}
        >
          <Camera
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "var(--accent)" }}
            strokeWidth={1.8}
          />
          <span
            className="text-xs font-body font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Camera
          </span>
        </button>
        <button
          type="button"
          data-ocid="documents.upload_button"
          onClick={onAddDocument}
          className="flex items-center justify-center gap-2 rounded-xl px-3 py-3 transition-smooth"
          style={{
            background: "var(--app-bg-2)",
            border: "1px solid var(--card-border)",
          }}
        >
          <Upload
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "var(--accent)" }}
            strokeWidth={1.8}
          />
          <span
            className="text-xs font-body font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Upload
          </span>
        </button>
      </div>

      {/* Documents by category */}
      {documents.length === 0 ? (
        <div
          className="flex flex-col items-center py-5 gap-2"
          data-ocid="documents.empty_state"
          style={{ opacity: 0.9 }}
        >
          <style>{`
            @keyframes docFloat {
              0%, 100% { transform: translateY(0px); opacity: 0.55; }
              50% { transform: translateY(-4px); opacity: 0.85; }
            }
          `}</style>
          <FileText
            className="w-7 h-7"
            style={{
              color: "var(--accent)",
              animation: "docFloat 2.8s ease-in-out infinite",
            }}
            strokeWidth={1.4}
          />
          <p
            className="text-sm font-body font-medium text-center"
            style={{ color: "var(--text-primary)" }}
          >
            Add your first document
          </p>
          <p
            className="text-xs font-body text-center"
            style={{ color: "var(--text-secondary)" }}
          >
            Tap camera or upload to get started
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {docsByCategory.map(({ cat, docs }) => {
            const isExpanded = expandedCats[cat] !== false; // default expanded
            return (
              <div key={cat}>
                <button
                  type="button"
                  data-ocid={`documents.category.${cat.toLowerCase()}`}
                  onClick={() => toggleCat(cat)}
                  className="w-full flex items-center justify-between py-1.5 transition-smooth"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-body font-semibold"
                      style={{
                        color:
                          docs.length > 0
                            ? "var(--text-primary)"
                            : "var(--text-muted)",
                      }}
                    >
                      {cat}
                    </span>
                    {docs.length > 0 && (
                      <span
                        className="text-xs font-body px-1.5 py-0.5 rounded-full"
                        style={{
                          background: "var(--accent-tint)",
                          color: "var(--accent)",
                        }}
                      >
                        {docs.length}
                      </span>
                    )}
                  </div>
                  {docs.length > 0 ? (
                    isExpanded ? (
                      <ChevronUp
                        className="w-3 h-3"
                        style={{ color: "var(--text-muted)" }}
                        strokeWidth={2}
                      />
                    ) : (
                      <ChevronDown
                        className="w-3 h-3"
                        style={{ color: "var(--text-muted)" }}
                        strokeWidth={2}
                      />
                    )
                  ) : (
                    <span
                      className="text-xs font-body"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Empty
                    </span>
                  )}
                </button>
                {docs.length > 0 && isExpanded && (
                  <div className="space-y-1.5 mb-1">
                    {docs.map((doc, i) => (
                      <div
                        key={doc.id}
                        data-ocid={`documents.item.${i + 1}`}
                        className="flex items-center gap-2 px-2 py-2 rounded-xl"
                        style={{ background: "var(--app-bg-2)" }}
                      >
                        <FileText
                          className="w-3.5 h-3.5 flex-shrink-0"
                          style={{ color: "var(--accent)" }}
                          strokeWidth={1.6}
                        />
                        <p
                          className="flex-1 text-xs font-body font-medium truncate min-w-0"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {doc.filename}
                        </p>
                        <button
                          type="button"
                          data-ocid={`documents.delete_button.${i + 1}`}
                          onClick={() => onRemoveDocument(doc.id)}
                          aria-label={`Remove ${doc.filename}`}
                          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-smooth"
                          style={{ background: "transparent" }}
                        >
                          <Trash2
                            className="w-3 h-3"
                            style={{ color: "var(--text-muted)" }}
                            strokeWidth={1.8}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// ─── Legacy Breathing Card (post-unlock) ─────────────────────────────────────

function LegacyBreathingCard({
  onTap,
  firstName,
  shimmer,
}: {
  onTap: () => void;
  firstName: string;
  shimmer: boolean;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.button
      type="button"
      data-ocid="legacy.breathing_card"
      aria-label="Open Legacy System"
      onClick={onTap}
      className={`w-full rounded-2xl p-5 relative overflow-hidden text-center${shimmer && !reduced ? " legacy-shimmer" : ""}`}
      style={{
        outline: "none",
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        boxShadow: "var(--shadow-card)",
      }}
      animate={
        reduced
          ? {}
          : {
              scale: [1, 1.02, 1],
              boxShadow: [
                "0 2px 16px 0 rgba(29,186,122,0.08), 0 0 0 1.5px rgba(29,186,122,0.22)",
                "0 4px 28px 0 rgba(29,186,122,0.22), 0 0 0 2px rgba(29,186,122,0.55)",
                "0 2px 16px 0 rgba(29,186,122,0.08), 0 0 0 1.5px rgba(29,186,122,0.22)",
              ],
            }
      }
      transition={
        reduced
          ? {}
          : { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
      }
      whileTap={{ scale: 0.98 }}
    >
      <p
        className="font-display font-semibold text-xl text-center"
        style={{ color: "var(--accent)", letterSpacing: "-0.01em" }}
      >
        Legacy
      </p>
      <p
        className="text-sm font-body mt-0.5 text-center"
        style={{ color: "var(--text-secondary)" }}
      >
        Your continuity plan is now active{firstName ? `, ${firstName}` : ""}
      </p>
    </motion.button>
  );
}

// ─── Legacy Progress Card ─────────────────────────────────────────────────────

function LegacyProgressCard({
  assets,
  legacyPermanentlySecured,
}: {
  assets: Asset[];
  legacyPermanentlySecured: boolean;
}) {
  const count = Math.min(assets.length, LEGACY_ASSET_THRESHOLD);
  const unlocked = assets.length >= LEGACY_ASSET_THRESHOLD;
  const reduced = useReducedMotion();

  return (
    <Card>
      <div className="flex items-center gap-2 mb-1">
        {unlocked ? (
          <LockOpen
            className="w-4 h-4"
            style={{ color: "var(--accent)" }}
            strokeWidth={1.8}
          />
        ) : (
          <Lock
            className="w-4 h-4"
            style={{ color: "var(--text-secondary)" }}
            strokeWidth={1.8}
          />
        )}
        <p
          className="font-display font-semibold text-base"
          style={{ color: "var(--text-primary)" }}
        >
          Legacy
        </p>
        {unlocked && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs font-body font-medium px-2 py-0.5 rounded-full"
            style={{ background: "var(--accent-tint)", color: "var(--accent)" }}
          >
            Unlocked
          </motion.span>
        )}
      </div>

      {!unlocked && (
        <p
          className="text-xs font-body mb-3"
          style={{ color: "var(--text-secondary)" }}
        >
          Legacy unlocks after {LEGACY_ASSET_THRESHOLD} assets
        </p>
      )}

      <div className="flex items-center justify-between mb-2">
        <p
          className="text-sm font-body font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          {count} / {LEGACY_ASSET_THRESHOLD} assets secured
        </p>
      </div>

      {/* Progress bar — key changes with count so Framer Motion re-triggers */}
      <div
        className="h-1 rounded-full mb-3"
        style={{ background: "var(--progress-bg)" }}
      >
        <motion.div
          key={count}
          className="h-full rounded-full"
          style={{ background: "var(--accent)" }}
          initial={{ width: 0 }}
          animate={{ width: `${(count / LEGACY_ASSET_THRESHOLD) * 100}%` }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 1.2, ease: [0.4, 0, 0.2, 1] }
          }
        />
      </div>

      {/* Milestone dots */}
      <div className="flex gap-1.5 mb-3">
        {([1, 2, 3] as const).map((milestoneNum) => {
          const milestoneIdx = milestoneNum - 1;
          return (
            <motion.div
              key={milestoneNum}
              data-ocid={`legacy.milestone.${milestoneNum}`}
              className="flex-1 h-1 rounded-full"
              style={{
                background:
                  milestoneIdx < count ? "var(--accent)" : "var(--progress-bg)",
              }}
              initial={false}
              animate={{ opacity: milestoneIdx < count ? 1 : 0.4 }}
              transition={{ duration: 0.3, delay: milestoneIdx * 0.08 }}
            />
          );
        })}
      </div>

      <p
        className="text-xs font-body"
        style={{ color: "var(--text-secondary)" }}
      >
        {unlocked
          ? "Your legacy plan is ready — Will, nominee structuring & more."
          : "Your legacy plan unlocks here — a Will, nominee structuring & more."}
      </p>

      {unlocked && !legacyPermanentlySecured && (
        <motion.button
          type="button"
          data-ocid="legacy.begin_button"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-3 w-full flex items-center justify-center gap-2 rounded-full font-body font-medium text-sm"
          style={{
            height: 40,
            background: "var(--accent)",
            color: "#fff",
          }}
        >
          Begin Legacy Planning
        </motion.button>
      )}
    </Card>
  );
}

// ─── Vault Completion Tracker ─────────────────────────────────────────────────

function VaultCompletionTracker({
  assets,
  documents,
  nominees,
  trackerReset,
}: {
  assets: Asset[];
  documents: Document[];
  nominees: Nominee[];
  trackerReset: boolean;
}) {
  const reduced = useReducedMotion();
  const legacyUnlocked = assets.length >= LEGACY_ASSET_THRESHOLD;

  // When trackerReset is true, only show "Add Asset" as done
  const steps = [
    {
      id: "asset",
      label: "Add Asset",
      done: trackerReset ? assets.length > 0 : assets.length > 0,
    },
    {
      id: "document",
      label: "Add Document",
      done: trackerReset ? false : documents.length > 0,
    },
    {
      id: "nominee",
      label: "Add Nominee",
      done: trackerReset ? false : nominees.length > 0,
    },
    {
      id: "legacy",
      label: "Unlock Legacy",
      done: trackerReset ? false : legacyUnlocked,
      isLegacy: true,
    },
  ];

  const subtitle = (() => {
    if (assets.length === 0) return "Start by adding your first asset";
    if (documents.length === 0) return "Add a document to secure your vault";
    if (nominees.length === 0) return "Assign a nominee to protect your family";
    if (legacyUnlocked) return "Your legacy is secured";
    return `Add ${LEGACY_ASSET_THRESHOLD - assets.length} more asset${LEGACY_ASSET_THRESHOLD - assets.length === 1 ? "" : "s"} to unlock Legacy`;
  })();

  // The "current" step is the first incomplete one
  const currentIdx = steps.findIndex((s) => !s.done);

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles
          className="w-4 h-4"
          style={{ color: "var(--accent)" }}
          strokeWidth={1.8}
        />
        <p
          className="font-display font-semibold text-base"
          style={{ color: "var(--text-primary)" }}
        >
          Vault Progress
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-3">
        {steps.map((step, idx) => {
          const isCurrent = idx === currentIdx;
          const isDone = step.done;
          const isFuture = !isDone && !isCurrent;

          return (
            <div
              key={step.id}
              className="flex items-center"
              style={{ flex: idx < steps.length - 1 ? "1 1 0" : "0 0 auto" }}
            >
              {/* Step circle */}
              <div className="flex flex-col items-center gap-1">
                <motion.div
                  data-ocid={`vault-tracker.step.${idx + 1}`}
                  initial={false}
                  animate={
                    isDone
                      ? { scale: reduced ? 1 : [1, 1.12, 1] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="relative flex items-center justify-center rounded-full"
                  style={{
                    width: 28,
                    height: 28,
                    background: isDone
                      ? "var(--accent)"
                      : isCurrent
                        ? "var(--card-bg)"
                        : "var(--app-bg-2)",
                    border: isDone
                      ? "2px solid var(--accent)"
                      : isCurrent
                        ? "2px solid var(--accent)"
                        : "2px solid var(--card-border)",
                    flexShrink: 0,
                  }}
                >
                  {isDone ? (
                    <Check
                      className="w-3.5 h-3.5"
                      style={{ color: "#fff" }}
                      strokeWidth={2.5}
                    />
                  ) : step.isLegacy && isFuture ? (
                    <Lock
                      className="w-3 h-3"
                      style={{ color: "var(--text-muted)" }}
                      strokeWidth={2}
                    />
                  ) : isCurrent ? null : (
                    <Lock
                      className="w-3 h-3"
                      style={{ color: "var(--text-muted)" }}
                      strokeWidth={2}
                    />
                  )}

                  {/* Pulsing ring for current step */}
                  {isCurrent && !reduced && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: "2px solid var(--accent)" }}
                      animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                      transition={{
                        duration: 1.8,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeOut",
                      }}
                    />
                  )}
                </motion.div>
                <span
                  className="text-center font-body"
                  style={{
                    fontSize: 9,
                    lineHeight: "12px",
                    color: isDone
                      ? "var(--accent)"
                      : isCurrent
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                    fontWeight: isCurrent ? 600 : 400,
                    maxWidth: 52,
                  }}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line between steps */}
              {idx < steps.length - 1 && (
                <div
                  className="h-px flex-1 mx-1"
                  style={{
                    marginTop: -14,
                    background: step.done
                      ? "var(--accent)"
                      : "var(--card-border)",
                    opacity: step.done ? 1 : 0.5,
                    transition: "background 0.4s ease",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Subtitle */}
      <motion.p
        key={subtitle}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="text-xs font-body text-center"
        style={{ color: "var(--text-secondary)" }}
      >
        {subtitle}
      </motion.p>
    </Card>
  );
}

// ─── Nominees Card ────────────────────────────────────────────────────────────

function NomineesCard({
  nominees,
  onAddNominee,
}: {
  nominees: Nominee[];
  onAddNominee: () => void;
}) {
  const visible = nominees.slice(0, 3);
  const hasMore = nominees.length > 3;

  return (
    <Card>
      <div className="flex items-center gap-2 mb-1">
        <Users
          className="w-4 h-4"
          style={{ color: "var(--accent)" }}
          strokeWidth={1.8}
        />
        <p
          className="font-display font-semibold text-base"
          style={{ color: "var(--text-primary)" }}
        >
          Nominees
        </p>
        {nominees.length > 0 && (
          <span
            className="ml-auto text-xs font-body font-medium px-2 py-0.5 rounded-full"
            style={{ background: "var(--accent-tint)", color: "var(--accent)" }}
          >
            {nominees.length} assigned
          </span>
        )}
      </div>
      <p
        className="text-xs font-body mb-3"
        style={{ color: "var(--text-secondary)" }}
      >
        Assign who inherits each asset
      </p>

      {nominees.length === 0 ? (
        <p
          className="text-sm font-body text-center py-3"
          style={{ color: "var(--text-muted)" }}
          data-ocid="nominees.empty_state"
        >
          No nominees assigned yet
        </p>
      ) : (
        <div className="space-y-2 mb-3">
          {visible.map((n, i) => (
            <div
              key={n.id}
              data-ocid={`nominees.item.${i + 1}`}
              className="flex items-center gap-2"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--app-bg-2)" }}
              >
                <Users
                  className="w-3.5 h-3.5"
                  style={{ color: "var(--text-secondary)" }}
                  strokeWidth={1.6}
                />
              </div>
              <p
                className="flex-1 text-sm font-body font-medium truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {n.name}
              </p>
              <span
                className="text-xs font-body px-2 py-0.5 rounded-full flex-shrink-0"
                style={{
                  background: "var(--app-bg-2)",
                  color: "var(--text-secondary)",
                }}
              >
                {n.relationship}
              </span>
            </div>
          ))}
          {hasMore && (
            <button
              type="button"
              data-ocid="nominees.view-all"
              className="flex items-center gap-1 text-xs font-body font-medium"
              style={{ color: "var(--accent)" }}
            >
              View all {nominees.length}
              <ChevronRight className="w-3 h-3" strokeWidth={2} />
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        data-ocid="nominees.add_button"
        onClick={onAddNominee}
        className="w-full flex items-center justify-center gap-2 rounded-full font-body font-medium text-sm transition-smooth"
        style={{
          height: 40,
          background: "transparent",
          border: "1px solid var(--card-border)",
          color: "var(--text-primary)",
        }}
      >
        <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
        Add Nominee
      </button>
    </Card>
  );
}

// ─── Will Builder Card ────────────────────────────────────────────────────────

function WillBuilderCard({
  assets,
  plan,
  onSavePlan,
}: {
  assets: Asset[];
  plan: LegacyPlan | null;
  onSavePlan: (p: LegacyPlan) => void;
}) {
  const count = Math.min(assets.length, LEGACY_ASSET_THRESHOLD);
  const unlocked = assets.length >= LEGACY_ASSET_THRESHOLD;
  const reduced = useReducedMotion();
  const [editing, setEditing] = useState(false);
  const [executor, setExecutor] = useState(plan?.executor ?? "");
  const [primaryBeneficiary, setPrimaryBeneficiary] = useState(
    plan?.primaryBeneficiary ?? "",
  );
  const [specialWishes, setSpecialWishes] = useState(plan?.specialWishes ?? "");
  const { isDark } = useTheme();

  const isValid = executor.trim() && primaryBeneficiary.trim();

  const handleSave = () => {
    onSavePlan({ executor, primaryBeneficiary, specialWishes });
    setEditing(false);
  };

  return (
    <motion.div
      animate={unlocked ? { scale: 1, opacity: 1 } : { scale: 1, opacity: 0.6 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <Card
        className={
          unlocked ? "ring-1 ring-[var(--accent)] ring-opacity-20" : ""
        }
        locked={!unlocked}
      >
        <div className="flex items-center gap-2 mb-1">
          <ScrollText
            className="w-4 h-4"
            style={{
              color: unlocked ? "var(--accent)" : "var(--text-secondary)",
            }}
            strokeWidth={1.8}
          />
          <p
            className="font-display font-semibold text-base"
            style={{ color: "var(--text-primary)" }}
          >
            Will &amp; Legacy
          </p>
          {unlocked && plan && (
            <span
              className="ml-auto text-xs font-body font-medium px-2 py-0.5 rounded-full"
              style={{
                background: "var(--accent-tint)",
                color: "var(--accent)",
              }}
            >
              Saved
            </span>
          )}
        </div>

        {!unlocked ? (
          <>
            <p
              className="text-xs font-body mb-3"
              style={{ color: "var(--text-secondary)" }}
            >
              Unlocks when you add {LEGACY_ASSET_THRESHOLD} assets
            </p>
            <div
              className="h-1 rounded-full mb-2"
              style={{ background: "var(--progress-bg)" }}
            >
              <motion.div
                key={`will-${count}`}
                className="h-full rounded-full"
                style={{ background: "var(--accent)" }}
                initial={{ width: 0 }}
                animate={{
                  width: `${(count / LEGACY_ASSET_THRESHOLD) * 100}%`,
                }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { duration: 1, ease: [0.4, 0, 0.2, 1] }
                }
              />
            </div>
            <p
              className="text-xs font-body"
              style={{ color: "var(--text-muted)" }}
            >
              {LEGACY_ASSET_THRESHOLD - count} more asset
              {LEGACY_ASSET_THRESHOLD - count !== 1 ? "s" : ""} needed
            </p>
          </>
        ) : plan && !editing ? (
          <>
            <p
              className="text-sm font-body font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Your Legacy Plan
            </p>
            <div className="space-y-1.5 mb-3">
              <div className="flex gap-2 text-xs font-body">
                <span style={{ color: "var(--text-secondary)", minWidth: 80 }}>
                  Executor
                </span>
                <span style={{ color: "var(--text-primary)" }}>
                  {plan.executor}
                </span>
              </div>
              <div className="flex gap-2 text-xs font-body">
                <span style={{ color: "var(--text-secondary)", minWidth: 80 }}>
                  Beneficiary
                </span>
                <span style={{ color: "var(--text-primary)" }}>
                  {plan.primaryBeneficiary}
                </span>
              </div>
              {plan.specialWishes && (
                <div className="flex gap-2 text-xs font-body">
                  <span
                    style={{ color: "var(--text-secondary)", minWidth: 80 }}
                  >
                    Wishes
                  </span>
                  <span
                    style={{ color: "var(--text-primary)" }}
                    className="line-clamp-2"
                  >
                    {plan.specialWishes}
                  </span>
                </div>
              )}
            </div>
            <button
              type="button"
              data-ocid="will-builder.edit_button"
              onClick={() => setEditing(true)}
              className="w-full flex items-center justify-center rounded-full font-body font-medium text-sm transition-smooth"
              style={{
                height: 38,
                background: "transparent",
                border: "1px solid var(--card-border)",
                color: "var(--text-primary)",
              }}
            >
              Edit Plan
            </button>
          </>
        ) : (
          <>
            <p
              className="text-xs font-body mb-3"
              style={{ color: "var(--text-secondary)" }}
            >
              Structure your will, assign trustees, and protect what matters
              most.
            </p>
            <div className="space-y-3 mb-4">
              {[
                {
                  id: "executor",
                  label: "Executor Name",
                  value: executor,
                  setter: setExecutor,
                },
                {
                  id: "beneficiary",
                  label: "Primary Beneficiary",
                  value: primaryBeneficiary,
                  setter: setPrimaryBeneficiary,
                },
              ].map(({ id, label, value, setter }) => (
                <div key={id}>
                  <label
                    htmlFor={`will-${id}`}
                    className="block text-xs font-body font-medium mb-1.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {label}
                  </label>
                  <input
                    id={`will-${id}`}
                    type="text"
                    data-ocid={`will-builder.${id}.input`}
                    placeholder={label}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 text-sm font-body outline-none transition-smooth"
                    style={{
                      background: "var(--input-bg)",
                      border: "1px solid var(--input-border)",
                      color: "var(--text-primary)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border =
                        "1px solid var(--input-focus-border)";
                      e.currentTarget.style.boxShadow =
                        "var(--input-focus-shadow)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border =
                        "1px solid var(--input-border)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
              ))}
              <div>
                <label
                  htmlFor="will-wishes"
                  className="block text-xs font-body font-medium mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Special Wishes (optional)
                </label>
                <textarea
                  id="will-wishes"
                  data-ocid="will-builder.wishes.textarea"
                  placeholder="Any special instructions..."
                  value={specialWishes}
                  onChange={(e) => setSpecialWishes(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl px-3 py-2.5 text-sm font-body outline-none resize-none transition-smooth"
                  style={{
                    background: isDark ? "var(--input-bg)" : "var(--input-bg)",
                    border: "1px solid var(--input-border)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border =
                      "1px solid var(--input-focus-border)";
                    e.currentTarget.style.boxShadow =
                      "var(--input-focus-shadow)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border =
                      "1px solid var(--input-border)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>
            <button
              type="button"
              data-ocid="will-builder.submit_button"
              onClick={handleSave}
              disabled={!isValid}
              className="w-full flex items-center justify-center rounded-full font-body font-medium text-sm transition-smooth"
              style={{
                height: 44,
                background: isValid ? "var(--accent)" : "var(--app-bg-2)",
                color: isValid ? "#fff" : "var(--text-muted)",
                cursor: isValid ? "pointer" : "not-allowed",
              }}
            >
              Save Legacy Plan
            </button>
          </>
        )}
      </Card>
    </motion.div>
  );
}

// ─── AI Insight Card ──────────────────────────────────────────────────────────

function AIInsightCard({
  assets,
  documents,
  nominees,
  willPlan,
  legacyPermanentlySecured,
}: {
  assets: Asset[];
  documents: Document[];
  nominees: Nominee[];
  willPlan: LegacyPlan | null;
  legacyPermanentlySecured: boolean;
}) {
  const docsCount = documents.length;
  const assetsCount = assets.length;
  const remaining = LEGACY_ASSET_THRESHOLD - assetsCount;

  let insight = "";
  let cta = "";

  if (legacyPermanentlySecured) {
    // Phase 2 — behavioral insights based on actual user data
    if (assetsCount > 3) {
      insight = `You've added ${assetsCount} assets. Consider reviewing nominees for each.`;
    } else if (docsCount > 3) {
      insight = "Strong document trail. Your vault is well-protected.";
    } else if (nominees.length === 0 && assetsCount > 0) {
      insight =
        "None of your assets have a nominee. Add one to ensure your legacy reaches the right person.";
      cta = "Add Nominee";
    } else if (nominees.length > 0 && nominees.length < assetsCount) {
      insight =
        "Some assets still lack nominees. Complete the assignment to protect your full estate.";
      cta = "Add Nominee";
    } else if (willPlan && nominees.length >= assetsCount && assetsCount > 0) {
      insight =
        "Your vault is fully secured. Review it annually to keep it current.";
    } else {
      insight =
        "Your legacy is secured. Keep your vault updated as your life evolves.";
    }
  } else {
    // Phase 1 — guide the vault completion tracker
    if (assetsCount === 0) {
      insight = "Start by adding your first asset to activate your vault.";
      cta = "Add Asset";
    } else if (assetsCount === 1 && docsCount === 0) {
      insight =
        "Good start. Add a document to pair with your asset — this is what protects it.";
      cta = "Add Document";
    } else if (assetsCount === 2) {
      insight = "One more asset and your Legacy unlocks. Keep going.";
    } else if (assetsCount > 0 && docsCount === 0) {
      insight =
        "Your assets are unprotected. Add at least one document to secure them.";
      cta = "Add Document";
    } else if (assetsCount > 0 && docsCount > 0 && nominees.length === 0) {
      insight =
        "Assets and documents secured. Assign a nominee to complete your vault.";
      cta = "Add Nominee";
    } else if (remaining >= 1 && remaining < LEGACY_ASSET_THRESHOLD) {
      insight = "Almost there — add one more asset to unlock Legacy.";
    } else if (willPlan && assetsCount >= LEGACY_ASSET_THRESHOLD) {
      insight = "Legacy plan secured. Your vault is fully protected.";
    } else if (assetsCount >= LEGACY_ASSET_THRESHOLD && !willPlan) {
      insight = "Your vault is complete — time to build your legacy plan.";
    } else {
      return null;
    }
  }

  if (!insight) return null;

  return (
    <Card className="!p-3.5">
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 px-1.5 py-0.5 rounded-md text-xs font-body font-semibold mt-0.5"
          style={{ background: "var(--accent-tint)", color: "var(--accent)" }}
        >
          AI
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-body leading-snug"
            style={{ color: "var(--text-primary)" }}
          >
            {insight}
          </p>
          {cta && (
            <button
              type="button"
              data-ocid="ai-insight.cta"
              className="mt-2 text-xs font-body font-medium flex items-center gap-1"
              style={{ color: "var(--accent)" }}
            >
              {cta}
              <ChevronRight className="w-3 h-3" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─── AI Autofill Chip ─────────────────────────────────────────────────────────

type AutofillState = "idle" | "filling" | "done";

// ─── Add Asset Modal ──────────────────────────────────────────────────────────

type AssetCategory = "property" | "bank" | "investment" | "gold";

function AddAssetModal({
  initialCategory,
  onClose,
  onSave,
}: {
  initialCategory?: AssetCategory;
  onClose: () => void;
  onSave: (asset: Omit<Asset, "id" | "addedAt">) => void;
}) {
  const [category, setCategory] = useState<AssetCategory>(
    initialCategory ?? "property",
  );
  const [fields, setFields] = useState<Record<string, string>>({});
  const [aiQuery, setAiQuery] = useState("");
  const [aiState, setAiState] = useState<AutofillState>("idle");
  const { isDark } = useTheme();

  const categories: AssetCategory[] = [
    "property",
    "bank",
    "investment",
    "gold",
  ];

  const fieldDefs: Record<
    AssetCategory,
    Array<{ key: string; label: string; type?: string }>
  > = {
    property: [
      { key: "name", label: "Property Name" },
      { key: "value", label: "Value (₹)", type: "number" },
      { key: "location", label: "Location" },
    ],
    bank: [
      { key: "name", label: "Bank Name" },
      { key: "accountType", label: "Account Type (Savings / Current / FD)" },
      { key: "value", label: "Balance (₹)", type: "number" },
    ],
    investment: [
      { key: "name", label: "Investment Name" },
      { key: "type", label: "Type (Stocks / Mutual Funds / PPF / NPS)" },
      { key: "value", label: "Value (₹)", type: "number" },
    ],
    gold: [
      { key: "name", label: "Description" },
      { key: "value", label: "Value (₹)", type: "number" },
      { key: "location", label: "Location (optional)" },
    ],
  };

  // Map field keys → form fields used for autofill
  const detailsKeyMap: Record<AssetCategory, string> = {
    property: "location",
    bank: "accountType",
    investment: "type",
    gold: "location",
  };

  const handleAutofill = (name: string, value: string, details: string) => {
    const detailKey = detailsKeyMap[category];
    setFields({ name, value, [detailKey]: details });
  };

  const triggerAiFill = () => {
    if (aiState !== "idle" || !aiQuery.trim()) return;
    setAiState("filling");
    const target = AI_AUTOFILL[category];
    const { name, value, details } = target;
    let nIdx = 0;
    let vIdx = 0;
    let dIdx = 0;
    const total = name.length + value.length + details.length;
    let done = 0;
    const interval = setInterval(() => {
      done++;
      if (nIdx < name.length) nIdx++;
      else if (vIdx < value.length) vIdx++;
      else if (dIdx < details.length) dIdx++;
      handleAutofill(
        name.slice(0, nIdx),
        value.slice(0, vIdx),
        details.slice(0, dIdx),
      );
      if (done >= total) {
        clearInterval(interval);
        setAiState("done");
      }
    }, 50);
  };

  const handleSave = () => {
    const val = Number.parseFloat(fields.value ?? "0") || 0;
    onSave({
      category,
      name: fields.name || CATEGORY_LABELS[category],
      value: val,
      details: { ...fields },
    });
  };

  const isValid =
    fields.name?.trim() && Number.parseFloat(fields.value ?? "0") > 0;

  return (
    <motion.div
      key="asset-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: isDark ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <motion.div
        key="asset-modal-sheet"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 320 }}
        className="w-full max-w-[390px] rounded-t-3xl overflow-hidden"
        style={{
          background: "var(--app-bg)",
          maxHeight: "90dvh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
        data-ocid="add-asset.dialog"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: "var(--card-border)" }}
          />
        </div>

        <div className="px-5 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between py-3 mb-4">
            <p
              className="font-display font-semibold text-lg"
              style={{ color: "var(--text-primary)" }}
            >
              Add Asset
            </p>
            <button
              type="button"
              data-ocid="add-asset.close_button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "var(--app-bg-2)" }}
            >
              <X
                className="w-4 h-4"
                style={{ color: "var(--text-secondary)" }}
                strokeWidth={2}
              />
            </button>
          </div>

          {/* Category selector */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat];
              const selected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  data-ocid={`add-asset.modal-category.${cat}`}
                  onClick={() => {
                    setCategory(cat);
                    setFields({});
                    setAiQuery("");
                    setAiState("idle");
                  }}
                  className="flex items-center gap-2 rounded-xl px-3 py-3 transition-smooth text-left"
                  style={{
                    background: selected
                      ? "var(--accent-tint)"
                      : "var(--app-bg-2)",
                    border: selected
                      ? "1.5px solid var(--accent)"
                      : "1px solid var(--card-border)",
                  }}
                >
                  <Icon
                    className="w-4 h-4 flex-shrink-0"
                    style={{
                      color: selected
                        ? "var(--accent)"
                        : "var(--text-secondary)",
                    }}
                    strokeWidth={1.8}
                  />
                  <span
                    className="text-xs font-body font-medium"
                    style={{
                      color: selected ? "var(--accent)" : "var(--text-primary)",
                    }}
                  >
                    {CATEGORY_LABELS[cat]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* AI Autofill — conversational single-line input */}
          <div className="mb-4">
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 transition-smooth"
              style={{
                background: "var(--accent-tint)",
                border:
                  "1px solid color-mix(in srgb, var(--accent) 22%, transparent)",
              }}
            >
              <Sparkles
                className="w-3.5 h-3.5 flex-shrink-0"
                style={{ color: "var(--accent)" }}
                strokeWidth={2}
              />
              <input
                type="text"
                data-ocid="add-asset.ai_query.input"
                placeholder="describe your asset, e.g. my apartment in Bandra"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    triggerAiFill();
                  }
                }}
                disabled={aiState !== "idle"}
                className="flex-1 min-w-0 bg-transparent outline-none text-sm font-body"
                style={{
                  color: "var(--text-primary)",
                  caretColor: "var(--accent)",
                }}
              />
              <button
                type="button"
                data-ocid="add-asset.ai_submit_button"
                onClick={triggerAiFill}
                disabled={aiState !== "idle" || !aiQuery.trim()}
                aria-label="Submit AI autofill"
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-smooth"
                style={{
                  background:
                    aiQuery.trim() && aiState === "idle"
                      ? "var(--accent)"
                      : "transparent",
                  color:
                    aiQuery.trim() && aiState === "idle"
                      ? "#fff"
                      : "var(--text-muted)",
                  opacity: aiState !== "idle" ? 0.5 : 1,
                }}
              >
                <span className="text-xs font-body font-bold leading-none">
                  →
                </span>
              </button>
            </div>
            <p
              className="text-xs font-body mt-1.5 px-1"
              style={{ color: "var(--text-secondary)" }}
            >
              {aiState === "idle"
                ? "AI will fill in the details"
                : aiState === "filling"
                  ? "Filling in details..."
                  : "Filled — edit as needed"}
            </p>
          </div>

          {/* Dynamic fields */}
          <div className="space-y-3 mt-3 mb-5">
            {fieldDefs[category].map(({ key, label, type }) => (
              <div key={key}>
                <label
                  htmlFor={`asset-field-${key}`}
                  className="block text-xs font-body font-medium mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {label}
                </label>
                <input
                  id={`asset-field-${key}`}
                  type={type ?? "text"}
                  data-ocid={`add-asset.${key}.input`}
                  placeholder={label}
                  value={fields[key] ?? ""}
                  onChange={(e) =>
                    setFields((p) => ({ ...p, [key]: e.target.value }))
                  }
                  className="w-full rounded-xl px-3 py-3 text-sm font-body outline-none transition-smooth"
                  style={{
                    background: "var(--input-bg)",
                    border: "1px solid var(--input-border)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border =
                      "1px solid var(--input-focus-border)";
                    e.currentTarget.style.boxShadow =
                      "var(--input-focus-shadow)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border =
                      "1px solid var(--input-border)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            ))}
          </div>

          {/* Save CTA */}
          <button
            type="button"
            data-ocid="add-asset.submit_button"
            onClick={handleSave}
            disabled={!isValid}
            className="w-full flex items-center justify-center rounded-full font-body font-medium text-sm transition-smooth"
            style={{
              height: 48,
              background: isValid ? "var(--accent)" : "var(--app-bg-2)",
              color: isValid ? "#fff" : "var(--text-muted)",
              cursor: isValid ? "pointer" : "not-allowed",
            }}
          >
            Save Asset
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Add Document Modal ───────────────────────────────────────────────────────

function AddDocumentModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (doc: Omit<Document, "id" | "addedAt">) => void;
}) {
  const [selectedCat, setSelectedCat] = useState("");
  const [filename, setFilename] = useState("");
  const [note, setNote] = useState("");
  const [uploaded, setUploaded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const { isDark } = useTheme();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFilename(file.name);
      setUploaded(true);
    }
    e.target.value = "";
  };

  const isValid = selectedCat && uploaded;

  const handleSave = () => {
    onSave({ category: selectedCat, filename, note });
  };

  return (
    <motion.div
      key="doc-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: isDark ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <motion.div
        key="doc-modal-sheet"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 320 }}
        className="w-full max-w-[390px] rounded-t-3xl overflow-hidden"
        style={{
          background: "var(--app-bg)",
          maxHeight: "90dvh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
        data-ocid="add-document.dialog"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: "var(--card-border)" }}
          />
        </div>

        <div className="px-5 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between py-3 mb-4">
            <p
              className="font-display font-semibold text-lg"
              style={{ color: "var(--text-primary)" }}
            >
              Add Document
            </p>
            <button
              type="button"
              data-ocid="add-document.close_button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "var(--app-bg-2)" }}
            >
              <X
                className="w-4 h-4"
                style={{ color: "var(--text-secondary)" }}
                strokeWidth={2}
              />
            </button>
          </div>

          {/* Category */}
          <p
            className="text-xs font-body font-medium mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Document Type
          </p>
          <div className="grid grid-cols-2 gap-2 mb-5">
            {DOC_CATEGORIES.map((cat) => {
              const selected = selectedCat === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  data-ocid={`add-document.category.${cat.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => setSelectedCat(cat)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-smooth"
                  style={{
                    background: selected
                      ? "var(--accent-tint)"
                      : "var(--app-bg-2)",
                    border: selected
                      ? "1.5px solid var(--accent)"
                      : "1px solid var(--card-border)",
                  }}
                >
                  <span
                    className="text-xs font-body font-medium"
                    style={{
                      color: selected ? "var(--accent)" : "var(--text-primary)",
                    }}
                  >
                    {cat}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Camera + Upload — side by side */}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            className="hidden"
            onChange={handleFileChange}
            data-ocid="add-document.file_input"
          />
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
            data-ocid="add-document.camera_input"
          />

          {!uploaded ? (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                data-ocid="add-document.capture_button"
                onClick={() => cameraRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl py-5 transition-smooth"
                style={{
                  border: "1.5px dashed var(--card-border)",
                  background: "var(--app-bg-2)",
                }}
              >
                <Camera
                  className="w-5 h-5"
                  style={{ color: "var(--accent)" }}
                  strokeWidth={1.5}
                />
                <p
                  className="text-xs font-body font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Capture
                </p>
                <p
                  className="text-xs font-body"
                  style={{ color: "var(--text-muted)" }}
                >
                  with Camera
                </p>
              </button>
              <button
                type="button"
                data-ocid="add-document.dropzone"
                onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl py-5 transition-smooth"
                style={{
                  border: "1.5px dashed var(--card-border)",
                  background: "var(--app-bg-2)",
                }}
              >
                <Upload
                  className="w-5 h-5"
                  style={{ color: "var(--text-secondary)" }}
                  strokeWidth={1.5}
                />
                <p
                  className="text-xs font-body font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Upload File
                </p>
                <p
                  className="text-xs font-body"
                  style={{ color: "var(--text-muted)" }}
                >
                  PDF, JPG, PNG
                </p>
              </button>
            </div>
          ) : (
            <div
              className="w-full rounded-2xl flex items-center gap-3 px-4 py-4 mb-4"
              style={{
                border: "1.5px solid var(--accent)",
                background: "var(--accent-tint)",
              }}
            >
              <FileText
                className="w-5 h-5 flex-shrink-0"
                style={{ color: "var(--accent)" }}
                strokeWidth={1.5}
              />
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-body font-medium truncate"
                  style={{ color: "var(--accent)" }}
                >
                  {filename}
                </p>
                <p
                  className="text-xs font-body"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Ready to save
                </p>
              </div>
              <button
                type="button"
                data-ocid="add-document.clear_button"
                onClick={() => {
                  setUploaded(false);
                  setFilename("");
                }}
                aria-label="Remove file"
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "transparent" }}
              >
                <X
                  className="w-3.5 h-3.5"
                  style={{ color: "var(--text-muted)" }}
                  strokeWidth={2}
                />
              </button>
            </div>
          )}

          {/* Note */}
          <label
            htmlFor="doc-note"
            className="block text-xs font-body font-medium mb-1.5"
            style={{ color: "var(--text-secondary)" }}
          >
            Note (optional)
          </label>
          <textarea
            id="doc-note"
            data-ocid="add-document.note.textarea"
            placeholder="Add a note about this document"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full rounded-xl px-3 py-3 text-sm font-body outline-none resize-none mb-5 transition-smooth"
            style={{
              background: "var(--input-bg)",
              border: "1px solid var(--input-border)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.border =
                "1px solid var(--input-focus-border)";
              e.currentTarget.style.boxShadow = "var(--input-focus-shadow)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.border = "1px solid var(--input-border)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />

          {/* Save CTA */}
          <button
            type="button"
            data-ocid="add-document.submit_button"
            onClick={handleSave}
            disabled={!isValid}
            className="w-full flex items-center justify-center rounded-full font-body font-medium text-sm transition-smooth"
            style={{
              height: 48,
              background: isValid ? "var(--accent)" : "var(--app-bg-2)",
              color: isValid ? "#fff" : "var(--text-muted)",
              cursor: isValid ? "pointer" : "not-allowed",
            }}
          >
            Save Document
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Add Nominee Modal ────────────────────────────────────────────────────────

function AddNomineeModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (n: Omit<Nominee, "id">) => void;
}) {
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [allocationPct, setAllocationPct] = useState("");
  const { isDark } = useTheme();

  const isValid = name.trim() && relationship;

  const handleSave = () => {
    onSave({
      name: name.trim(),
      relationship,
      allocationPct: allocationPct ? Number(allocationPct) : undefined,
    });
  };

  return (
    <motion.div
      key="nominee-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: isDark ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <motion.div
        key="nominee-modal-sheet"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 320 }}
        className="w-full max-w-[390px] rounded-t-3xl overflow-hidden"
        style={{
          background: "var(--app-bg)",
          maxHeight: "90dvh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
        data-ocid="add-nominee.dialog"
      >
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: "var(--card-border)" }}
          />
        </div>

        <div className="px-5 pb-8">
          <div className="flex items-center justify-between py-3 mb-4">
            <p
              className="font-display font-semibold text-lg"
              style={{ color: "var(--text-primary)" }}
            >
              Add Nominee
            </p>
            <button
              type="button"
              data-ocid="add-nominee.close_button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "var(--app-bg-2)" }}
            >
              <X
                className="w-4 h-4"
                style={{ color: "var(--text-secondary)" }}
                strokeWidth={2}
              />
            </button>
          </div>

          <div className="space-y-3 mb-4">
            {/* Name */}
            <div>
              <label
                htmlFor="nominee-name"
                className="block text-xs font-body font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Full Name
              </label>
              <input
                id="nominee-name"
                type="text"
                data-ocid="add-nominee.name.input"
                placeholder="Nominee's full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl px-3 py-3 text-sm font-body outline-none transition-smooth"
                style={{
                  background: "var(--input-bg)",
                  border: "1px solid var(--input-border)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border =
                    "1px solid var(--input-focus-border)";
                  e.currentTarget.style.boxShadow = "var(--input-focus-shadow)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border =
                    "1px solid var(--input-border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Relationship */}
            <div>
              <p
                className="text-xs font-body font-medium mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Relationship
              </p>
              <div className="flex flex-wrap gap-2">
                {RELATIONSHIPS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    data-ocid={`add-nominee.relationship.${r.toLowerCase()}`}
                    onClick={() => setRelationship(r)}
                    className="px-3 py-1.5 rounded-full text-xs font-body font-medium transition-smooth"
                    style={{
                      background:
                        relationship === r
                          ? "var(--accent-tint)"
                          : "var(--app-bg-2)",
                      border:
                        relationship === r
                          ? "1.5px solid var(--accent)"
                          : "1px solid var(--card-border)",
                      color:
                        relationship === r
                          ? "var(--accent)"
                          : "var(--text-primary)",
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Allocation */}
            <div>
              <label
                htmlFor="nominee-alloc"
                className="block text-xs font-body font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Asset Allocation % (optional)
              </label>
              <input
                id="nominee-alloc"
                type="number"
                data-ocid="add-nominee.allocation.input"
                placeholder="e.g. 50"
                value={allocationPct}
                min="0"
                max="100"
                onChange={(e) => setAllocationPct(e.target.value)}
                className="w-full rounded-xl px-3 py-3 text-sm font-body outline-none transition-smooth"
                style={{
                  background: "var(--input-bg)",
                  border: "1px solid var(--input-border)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border =
                    "1px solid var(--input-focus-border)";
                  e.currentTarget.style.boxShadow = "var(--input-focus-shadow)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border =
                    "1px solid var(--input-border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          <button
            type="button"
            data-ocid="add-nominee.submit_button"
            onClick={handleSave}
            disabled={!isValid}
            className="w-full flex items-center justify-center rounded-full font-body font-medium text-sm transition-smooth"
            style={{
              height: 48,
              background: isValid ? "var(--btn-primary-bg)" : "var(--app-bg-2)",
              color: isValid ? "var(--btn-primary-text)" : "var(--text-muted)",
              cursor: isValid ? "pointer" : "not-allowed",
            }}
          >
            Save Nominee
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Floating FAB with Radial Menu ───────────────────────────────────────────

function FloatingFAB({
  onAddAsset,
  onAddDocument,
  isDark,
}: {
  onAddAsset: () => void;
  onAddDocument: () => void;
  isDark: boolean;
}) {
  const [open, setOpen] = useState(false);

  const fabBg = isDark ? "rgba(13,13,13,0.88)" : "rgba(255,255,255,0.88)";
  const fabBorder = isDark
    ? "1px solid rgba(255,255,255,0.12)"
    : "1px solid rgba(0,0,0,0.10)";
  const fabColor = isDark ? "var(--accent)" : "var(--btn-primary-bg)";
  const pillBg = isDark ? "rgba(13,13,13,0.92)" : "rgba(255,255,255,0.96)";

  const menuItems = [
    {
      id: "asset",
      label: "Add Asset",
      icon: <Briefcase className="w-3.5 h-3.5" strokeWidth={2} />,
      action: () => {
        setOpen(false);
        onAddAsset();
      },
      ocid: "fab.add_asset_button",
      // fan left
      offsetX: -68,
      offsetY: -62,
    },
    {
      id: "document",
      label: "Add Document",
      icon: <FileText className="w-3.5 h-3.5" strokeWidth={2} />,
      action: () => {
        setOpen(false);
        onAddDocument();
      },
      ocid: "fab.add_document_button",
      // fan right
      offsetX: 12,
      offsetY: -62,
    },
  ];

  return (
    <>
      {/* Backdrop to close menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="fab-backdrop"
            className="fixed inset-0"
            style={{ zIndex: 19 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Pill menu items */}
      <AnimatePresence>
        {open &&
          menuItems.map((item, idx) => (
            <motion.button
              key={item.id}
              type="button"
              data-ocid={item.ocid}
              onClick={item.action}
              aria-label={item.label}
              className="fixed flex items-center gap-1.5 rounded-full font-body font-medium"
              style={{
                bottom: 68,
                right: "calc(50% - 195px + 16px)",
                height: 34,
                paddingLeft: 10,
                paddingRight: 12,
                fontSize: 11,
                background: pillBg,
                border: fabBorder,
                color: "var(--text-primary)",
                boxShadow:
                  "0 4px 24px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.10)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                zIndex: 22,
                originX: "50%",
                originY: "100%",
              }}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0.7 }}
              animate={{
                opacity: 1,
                x: item.offsetX,
                y: item.offsetY,
                scale: 1,
              }}
              exit={{ opacity: 0, x: 0, y: 0, scale: 0.7 }}
              transition={{
                duration: 0.25,
                ease: [0.34, 1.3, 0.64, 1],
                delay: idx * 0.06,
              }}
              whileTap={{ scale: 0.94 }}
            >
              <span style={{ color: "var(--accent)" }}>{item.icon}</span>
              {item.label}
            </motion.button>
          ))}
      </AnimatePresence>

      {/* FAB core */}
      <motion.button
        type="button"
        data-ocid="vault-home.add_fab"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.93 }}
        className="fixed flex items-center justify-center rounded-full"
        style={{
          width: 44,
          height: 44,
          bottom: 68,
          right: "calc(50% - 195px + 16px)",
          background: fabBg,
          border: fabBorder,
          color: fabColor,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.10)",
          zIndex: 20,
        }}
        aria-label={open ? "Close menu" : "Add item"}
        aria-expanded={open}
      >
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </motion.div>
      </motion.button>
    </>
  );
}

// ─── Weather Widget (header) ──────────────────────────────────────────────────

function WeatherWidget() {
  const [temp] = useState(24);
  const [condition] = useState<"sun" | "cloud" | "rain">("sun");
  const icon =
    condition === "rain" ? (
      <CloudRain className="w-4 h-4 flex-shrink-0" strokeWidth={1.6} />
    ) : condition === "cloud" ? (
      <Cloud className="w-4 h-4 flex-shrink-0" strokeWidth={1.6} />
    ) : (
      <Sun className="w-4 h-4 flex-shrink-0" strokeWidth={1.6} />
    );
  return (
    <div
      className="flex items-center gap-1"
      style={{ color: "var(--text-secondary)" }}
      aria-label={`Weather: ${temp} degrees`}
    >
      {icon}
      <span
        className="text-xs font-body font-medium"
        style={{ color: "var(--text-secondary)", letterSpacing: "0.01em" }}
      >
        {temp}°
      </span>
    </div>
  );
}

// ─── Compact Theme Toggle (header) ────────────────────────────────────────────

function CompactThemeToggle() {
  const { isDark, toggle } = useTheme();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      data-ocid="vault-home.theme_toggle"
      onClick={toggle}
      style={{
        position: "relative",
        width: 36,
        height: 20,
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        padding: 0,
        outline: "none",
        background: isDark ? "#1DBA7A" : "rgba(0,0,0,0.12)",
        transition: "background 0.3s ease",
        flexShrink: 0,
      }}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow = isDark
          ? "0 0 0 2px rgba(29,186,122,0.4)"
          : "0 0 0 2px rgba(0,0,0,0.15)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: isDark ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
          transition: "left 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      />
    </button>
  );
}

// ─── Legacy System Types ──────────────────────────────────────────────────────

interface LegacyState {
  nominees: { count: number; hasBackup: boolean; list: Nominee[] };
  vaultCheckIn: { isActive: boolean; lastCheckedAt: Date | null };
  releaseLogic: { inactivityDays: number; verificationSet: boolean };
  messages: {
    exists: boolean;
    list: Array<{
      id: string;
      recipient: string;
      text: string;
      condition: string;
    }>;
  };
  will: { exists: boolean };
}

// ─── Neural Legacy Canvas ─────────────────────────────────────────────────────
// AI Alive Neural Legacy System — living network representing real user data.
// Nodes = assets, nominees, documents, system anchors.
// Connections = real relationships only (asset→nominee, doc→vault, etc.)
// Density and behavior scale with completionScore. Reacts to user actions.

interface NeuralLegacyNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  radius: number;
  type: "asset" | "nominee" | "document" | "vault" | "release" | "inactive";
  state: "inactive" | "active" | "new";
  glow: number; // 0.0 – 1.5
  depth: 0 | 1 | 2; // 0=background, 1=mid, 2=foreground
  pulsePhase: number;
  linkedIds: string[];
  opacity: number; // fade-in (0→1)
  activatedAt: number; // timestamp ms, 0 if never
  spawnTime: number; // staggered delay before appearing (ms from mount)
  isHuman: boolean; // true for nominee nodes → warm amber tint
}

interface NeuralSignalPulse {
  fromIdx: number;
  toIdx: number;
  progress: number;
  speed: number;
}

interface NeuralRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

// Per-type base colors
const N_COLOR = {
  asset: { r: 62, g: 213, b: 152 }, // mint green
  nominee: { r: 240, g: 160, b: 112 }, // warm amber — human feel
  document: { r: 126, g: 200, b: 227 }, // soft cyan
  vault: { r: 62, g: 213, b: 152 }, // bright mint
  release: { r: 160, g: 196, b: 255 }, // soft blue
  inactive: { r: 62, g: 213, b: 152 }, // very dim green
};

const NEURAL_CANVAS_BG = "#0D1F1A";
const CONN_DIST = 170; // max proximity connection distance
const MAX_NODES = 50;
const SIG_MIN = 4000; // ms between signal pulses (normal)
const SIG_MIN_HIGH = 8000; // ms at high completion (80%+)
const SIG_MAX = 6000;
const SIG_MAX_HIGH = 12000;

function rgbA(r: number, g: number, b: number, a: number): string {
  return `rgba(${r},${g},${b},${Math.min(1, Math.max(0, a)).toFixed(3)})`;
}

// Section → node type focus mapping
const SECTION_FOCUS: Record<string, NeuralLegacyNode["type"][]> = {
  nominees: ["nominee"],
  checkin: ["vault"],
  release: ["release"],
  messages: ["document"],
};

function buildNodes(
  w: number,
  h: number,
  assets: Array<{ id: string; name: string; type: string }>,
  nominees: Array<{ id: string; name: string; role: string }>,
  documents: Array<{ id: string; name: string; category: string }>,
  completionScore: number,
): NeuralLegacyNode[] {
  const nodes: NeuralLegacyNode[] = [];
  let si = 0; // spawn index

  const visibleTarget = Math.max(
    5,
    Math.floor((completionScore / 100) * MAX_NODES),
  );

  // ── 3 system anchor nodes (always present) ─────────────────────────────────
  const vaultId = "anchor_vault";
  const releaseId = "anchor_release";
  const systemId = "anchor_system";

  const anchors: Array<{
    id: string;
    type: NeuralLegacyNode["type"];
    x: number;
    y: number;
    links: string[];
  }> = [
    { id: vaultId, type: "vault", x: w * 0.5, y: h * 0.42, links: [releaseId] },
    {
      id: releaseId,
      type: "release",
      x: w * 0.72,
      y: h * 0.6,
      links: [systemId, vaultId],
    },
    { id: systemId, type: "vault", x: w * 0.28, y: h * 0.65, links: [vaultId] },
  ];
  for (const a of anchors) {
    nodes.push({
      id: a.id,
      x: a.x,
      y: a.y,
      vx: (Math.random() - 0.5) * 0.14,
      vy: (Math.random() - 0.5) * 0.14,
      baseVx: (Math.random() - 0.5) * 0.14,
      baseVy: (Math.random() - 0.5) * 0.14,
      radius: 5 + Math.random() * 2,
      type: a.type,
      state: "active",
      glow: 0.7,
      depth: 2,
      pulsePhase: Math.random() * Math.PI * 2,
      linkedIds: a.links,
      opacity: 0,
      activatedAt: 0,
      spawnTime: si++ * 50,
      isHuman: false,
    });
  }

  // ── Real asset nodes (left-center area) ────────────────────────────────────
  const assetIds = assets.slice(0, 15).map((_, i) => `asset_${i}`);
  assets.slice(0, 15).forEach((_, i) => {
    // Connect each asset → up to 2 nearest nominees, and vault anchor
    const nomLinks = nominees.slice(0, 2).map((_, j) => `nominee_${j}`);
    nodes.push({
      id: assetIds[i],
      x: w * (0.08 + Math.random() * 0.38),
      y: h * (0.15 + Math.random() * 0.65),
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      baseVx: (Math.random() - 0.5) * 0.22,
      baseVy: (Math.random() - 0.5) * 0.22,
      radius: 5 + Math.random() * 3,
      type: "asset",
      state: "active",
      glow: 0.85,
      depth: 2,
      pulsePhase: Math.random() * Math.PI * 2,
      linkedIds: [...nomLinks, vaultId],
      opacity: 0,
      activatedAt: 0,
      spawnTime: si++ * 50,
      isHuman: false,
    });
  });

  // ── Real nominee nodes (right area, warm tint) ──────────────────────────────
  const nomineeIds = nominees.slice(0, 8).map((_, i) => `nominee_${i}`);
  nominees.slice(0, 8).forEach((_, i) => {
    nodes.push({
      id: nomineeIds[i],
      x: w * (0.58 + Math.random() * 0.36),
      y: h * (0.12 + Math.random() * 0.72),
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      baseVx: (Math.random() - 0.5) * 0.18,
      baseVy: (Math.random() - 0.5) * 0.18,
      radius: 5 + Math.random() * 2.5,
      type: "nominee",
      state: "active",
      glow: 0.9,
      depth: 2,
      pulsePhase: Math.random() * Math.PI * 2,
      // nominee → asset links + vault anchor
      linkedIds: [...assetIds.slice(0, Math.min(assetIds.length, 2)), vaultId],
      opacity: 0,
      activatedAt: 0,
      spawnTime: si++ * 50,
      isHuman: true,
    });
  });

  // ── Real document nodes (lower area) ───────────────────────────────────────
  documents.slice(0, 10).forEach((_, i) => {
    nodes.push({
      id: `doc_${i}`,
      x: w * (0.08 + Math.random() * 0.84),
      y: h * (0.58 + Math.random() * 0.38),
      vx: (Math.random() - 0.5) * 0.16,
      vy: (Math.random() - 0.5) * 0.16,
      baseVx: (Math.random() - 0.5) * 0.16,
      baseVy: (Math.random() - 0.5) * 0.16,
      radius: 3.5 + Math.random() * 2,
      type: "document",
      state: "active",
      glow: 0.7,
      depth: 1,
      pulsePhase: Math.random() * Math.PI * 2,
      linkedIds: [vaultId, systemId], // document → vault
      opacity: 0,
      activatedAt: 0,
      spawnTime: si++ * 50,
      isHuman: false,
    });
  });

  // ── Background fill nodes up to visibleTarget ──────────────────────────────
  const filled = nodes.length;
  const bgCount = Math.min(
    MAX_NODES - filled,
    Math.max(0, visibleTarget - filled),
  );
  for (let i = 0; i < bgCount; i++) {
    // Distribute across depth layers: 30% bg, 50% mid, 20% fg
    const r = Math.random();
    const depth: 0 | 1 | 2 = r < 0.3 ? 0 : r < 0.8 ? 1 : 2;
    nodes.push({
      id: `bg_${i}`,
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.11,
      vy: (Math.random() - 0.5) * 0.11,
      baseVx: (Math.random() - 0.5) * 0.11,
      baseVy: (Math.random() - 0.5) * 0.11,
      radius:
        depth === 0
          ? 2 + Math.random()
          : depth === 1
            ? 3 + Math.random() * 1.5
            : 4 + Math.random() * 2,
      type: "inactive",
      state: "inactive",
      glow: 0.2,
      depth,
      pulsePhase: Math.random() * Math.PI * 2,
      linkedIds: [],
      opacity: 0,
      activatedAt: 0,
      spawnTime: si++ * 30,
      isHuman: false,
    });
  }

  return nodes;
}

function NeuralLegacyCanvas({
  assets,
  nominees,
  documents,
  completionScore,
  activeSection,
}: {
  assets: Array<{ id: string; name: string; type: string }>;
  nominees: Array<{ id: string; name: string; role: string }>;
  documents: Array<{ id: string; name: string; category: string }>;
  completionScore: number;
  activeSection: string | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<NeuralLegacyNode[]>([]);
  const signalsRef = useRef<NeuralSignalPulse[]>([]);
  const ripplesRef = useRef<NeuralRipple[]>([]);
  // Opening pulse rings — concentric ripples fired from center on mount
  const openRingsRef = useRef<
    Array<{
      spawnedAt: number;
      delay: number;
      duration: number;
      maxRadius: number;
    }>
  >([]);
  const rafRef = useRef<number>(0);
  const mountTimeRef = useRef<number>(0);
  const lastSigTimeRef = useRef<number>(0);
  const nextSigDelayRef = useRef<number>(SIG_MIN);
  const frameCountRef = useRef<number>(0);
  const lowBatteryRef = useRef<boolean>(false);
  const reduced = useReducedMotion();

  // Stable refs for props to avoid restarting the animation loop
  const propsRef = useRef({
    assets,
    nominees,
    documents,
    completionScore,
    activeSection,
  });
  propsRef.current = {
    assets,
    nominees,
    documents,
    completionScore,
    activeSection,
  };

  // Focus lerp targets per node [0..1] — 0=dimmed, 1=normal/bright
  const focusRef = useRef<Float32Array>(new Float32Array(MAX_NODES).fill(1));

  // Track prior data lengths to detect new additions
  const prevCountRef = useRef({ assets: 0, nominees: 0, docs: 0 });

  // Battery API — reduce tick rate on low battery
  useEffect(() => {
    if (!("getBattery" in navigator)) return;
    type BatteryManager = {
      level: number;
      charging: boolean;
      onlevelchange: (() => void) | null;
    };
    (navigator as unknown as { getBattery: () => Promise<BatteryManager> })
      .getBattery()
      .then((b) => {
        lowBatteryRef.current = b.level < 0.2 && !b.charging;
        b.onlevelchange = () => {
          lowBatteryRef.current = b.level < 0.2 && !b.charging;
        };
      })
      .catch(() => {});
  }, []);

  // Detect new items → activate a matching node + ripple + nearby glow
  useEffect(() => {
    const prev = prevCountRef.current;
    const nodes = nodesRef.current;
    if (!nodes.length) return;

    const activate = (
      newCount: number,
      prevCount: number,
      type: NeuralLegacyNode["type"],
    ) => {
      if (newCount <= prevCount) return;
      const candidates = nodes.filter(
        (n) => n.type === type && n.state === "active",
      );
      if (!candidates.length) return;
      const target = candidates[Math.floor(Math.random() * candidates.length)];
      target.state = "new";
      target.glow = 1.5;
      target.activatedAt = Date.now();
      ripplesRef.current.push({
        x: target.x,
        y: target.y,
        radius: target.radius * 2,
        maxRadius: 80,
        opacity: 0.65,
      });
      for (const n of nodes) {
        if (n.id === target.id) continue;
        const d = Math.sqrt((n.x - target.x) ** 2 + (n.y - target.y) ** 2);
        if (d < 100) n.glow = Math.min(1.2, n.glow + 0.4);
      }
    };

    activate(assets.length, prev.assets, "asset");
    activate(nominees.length, prev.nominees, "nominee");
    activate(documents.length, prev.docs, "document");
    prevCountRef.current = {
      assets: assets.length,
      nominees: nominees.length,
      docs: documents.length,
    };
  }, [assets.length, nominees.length, documents.length]);

  // Main canvas effect — build nodes + run animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // DPR-aware resize
    const resize = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (!w || !h) return;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!nodesRef.current.length) {
        nodesRef.current = buildNodes(
          w,
          h,
          propsRef.current.assets,
          propsRef.current.nominees,
          propsRef.current.documents,
          propsRef.current.completionScore,
        );
        focusRef.current = new Float32Array(nodesRef.current.length).fill(1);
        prevCountRef.current = {
          assets: propsRef.current.assets.length,
          nominees: propsRef.current.nominees.length,
          docs: propsRef.current.documents.length,
        };
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    mountTimeRef.current = performance.now();
    lastSigTimeRef.current = mountTimeRef.current;

    // Spawn 3 concentric opening pulse rings from center nucleus, staggered
    const cardW = canvas.offsetWidth || 320;
    const cardH = canvas.offsetHeight || 200;
    openRingsRef.current = [
      {
        spawnedAt: mountTimeRef.current,
        delay: 0,
        duration: 2200,
        maxRadius: Math.max(cardW, cardH) * 0.55,
      },
      {
        spawnedAt: mountTimeRef.current,
        delay: 350,
        duration: 2500,
        maxRadius: Math.max(cardW, cardH) * 0.75,
      },
      {
        spawnedAt: mountTimeRef.current,
        delay: 700,
        duration: 2800,
        maxRadius: Math.max(cardW, cardH) * 0.95,
      },
    ];

    // IntersectionObserver — pause when off-screen
    let visible = true;
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
        if (visible && !rafRef.current)
          rafRef.current = requestAnimationFrame(tick);
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    // ── Reduced motion: draw one static frame and exit ──────────────────────
    if (reduced) {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.fillStyle = NEURAL_CANVAS_BG;
      ctx.fillRect(0, 0, w, h);
      const ns = nodesRef.current;
      for (let i = 0; i < ns.length && i < 25; i++) {
        for (let j = i + 1; j < ns.length && j < 25; j++) {
          const dx = ns[i].x - ns[j].x;
          const dy = ns[i].y - ns[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < CONN_DIST) {
            const c = N_COLOR[ns[i].type];
            ctx.beginPath();
            ctx.moveTo(ns[i].x, ns[i].y);
            ctx.lineTo(ns[j].x, ns[j].y);
            ctx.strokeStyle = rgbA(c.r, c.g, c.b, 0.18 * (1 - d / CONN_DIST));
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      for (const n of ns) {
        if (n.state === "inactive") continue;
        const c = N_COLOR[n.type];
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = rgbA(c.r, c.g, c.b, 0.6);
        ctx.fill();
      }
      return;
    }

    // ── Main animation tick ──────────────────────────────────────────────────
    const tick = (now: number) => {
      if (!visible) {
        rafRef.current = 0;
        return;
      }

      frameCountRef.current++;
      // Throttle to ~20fps on low battery (skip 2 of every 3 frames)
      if (lowBatteryRef.current && frameCountRef.current % 3 !== 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const { completionScore: score, activeSection: section } =
        propsRef.current;
      const elapsed = now - mountTimeRef.current;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (!w || !h) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const nodes = nodesRef.current;
      const highComp = score >= 80;
      const sigMin = highComp ? SIG_MIN_HIGH : SIG_MIN;
      const sigMax = highComp ? SIG_MAX_HIGH : SIG_MAX;

      // ── Update focus lerp targets based on activeSection ────────────────
      const focusTypes = section ? (SECTION_FOCUS[section] ?? []) : [];
      const hasFocus = focusTypes.length > 0;

      // ── Clear ────────────────────────────────────────────────────────────
      ctx.fillStyle = NEURAL_CANVAS_BG;
      ctx.fillRect(0, 0, w, h);

      // ── Burst glow from center on open (5s expanding radial) — enhanced ────
      if (elapsed < 5000) {
        const t = elapsed / 5000;
        const alpha = (1 - t) * 0.4; // increased from 0.25 → 0.4 for more prominence
        const r = Math.max(w, h) * 0.85 * t ** 0.4;
        const cx = w / 2;
        const cy = h / 2;
        if (r > 0) {
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
          grad.addColorStop(
            0,
            `rgba(62,213,152,${Math.min(1, alpha * 1.5).toFixed(3)})`,
          );
          grad.addColorStop(0.35, `rgba(62,213,152,${alpha.toFixed(3)})`);
          grad.addColorStop(
            0.7,
            `rgba(62,213,152,${(alpha * 0.4).toFixed(3)})`,
          );
          grad.addColorStop(1, "rgba(62,213,152,0)");
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // ── Nucleus flash — bright filled circle at center that quickly fades ──
        if (elapsed < 400) {
          const flashAlpha = 0.85 * (1 - elapsed / 400);
          const flashR = 22 * (1 - elapsed / 400) + 6;
          ctx.save();
          ctx.shadowBlur = 28;
          ctx.shadowColor = "rgba(62,213,152,0.95)";
          ctx.beginPath();
          ctx.arc(cx, cy, flashR, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(62,213,152,${flashAlpha.toFixed(3)})`;
          ctx.fill();
          ctx.restore();
        }
      }

      // ── Opening pulse rings — concentric expanding stroke rings ──────────
      for (const ring of openRingsRef.current) {
        const ringElapsed = now - (ring.spawnedAt + ring.delay);
        if (ringElapsed < 0) continue;
        if (ringElapsed > ring.duration) continue;
        const tRing = ringElapsed / ring.duration;
        const ringRadius = ring.maxRadius * tRing ** 0.5;
        const ringAlpha = (1 - tRing) * 0.55;
        if (ringRadius > 0 && ringAlpha > 0.005) {
          const cx = w / 2;
          const cy = h / 2;
          ctx.save();
          ctx.shadowBlur = 8;
          ctx.shadowColor = "rgba(62,213,152,0.5)";
          ctx.beginPath();
          ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(62,213,152,${ringAlpha.toFixed(3)})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        }
      }

      // ── Update node positions and states ─────────────────────────────────
      const speedMul = highComp ? 0.3 : 1.0;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // Staggered fade-in
        const sinceSpawn = elapsed - n.spawnTime;
        n.opacity = Math.min(1, Math.max(0, sinceSpawn / 600));

        // Layer-based speed (foreground faster, background slower)
        const layerMul = n.depth === 0 ? 0.35 : n.depth === 2 ? 1.2 : 1.0;
        n.vx = n.baseVx * speedMul * layerMul;
        n.vy = n.baseVy * speedMul * layerMul;
        n.x += n.vx;
        n.y += n.vy;

        // Soft wrap-around
        const mg = 24;
        if (n.x < -mg) n.x = w + mg;
        if (n.x > w + mg) n.x = -mg;
        if (n.y < -mg) n.y = h + mg;
        if (n.y > h + mg) n.y = -mg;

        n.pulsePhase += 0.018;

        // "new" node pulse → settle to "active" after 1800ms (3 pulses)
        if (n.state === "new") {
          const age = Date.now() - n.activatedAt;
          if (age > 1800) {
            n.state = "active";
            n.glow =
              n.type === "asset"
                ? 0.85
                : n.type === "nominee"
                  ? 0.9
                  : n.type === "document"
                    ? 0.7
                    : 0.65;
          } else {
            const t = age / 1800;
            n.glow = 1.5 - Math.sin(t * Math.PI * 3) * 0.6;
          }
        }

        // Stabilize glow at high completion
        if (highComp && n.state === "active" && n.glow < 0.8) {
          n.glow = Math.min(0.8, n.glow + 0.002);
        }

        // Focus lerp — smoothly dim/brighten based on activeSection
        const isFocused = hasFocus && focusTypes.includes(n.type);
        const targetFocus = hasFocus ? (isFocused ? 1.0 : 0.12) : 1.0;
        const cur = focusRef.current[i] ?? 1;
        focusRef.current[i] = cur + (targetFocus - cur) * 0.06; // lerp
      }

      // ── Spawn signal pulses ───────────────────────────────────────────────
      if (now - lastSigTimeRef.current > nextSigDelayRef.current) {
        lastSigTimeRef.current = now;
        nextSigDelayRef.current = sigMin + Math.random() * (sigMax - sigMin);
        const candidates = nodes.filter(
          (n) =>
            n.linkedIds.length > 0 && n.opacity > 0.7 && n.state !== "inactive",
        );
        if (candidates.length > 1) {
          const from =
            candidates[Math.floor(Math.random() * candidates.length)];
          const linkedId =
            from.linkedIds[Math.floor(Math.random() * from.linkedIds.length)];
          const toIdx = nodes.findIndex((n) => n.id === linkedId);
          const fromIdx = nodes.indexOf(from);
          if (toIdx >= 0 && fromIdx >= 0) {
            signalsRef.current.push({
              fromIdx,
              toIdx,
              progress: 0,
              speed: 0.01 + Math.random() * 0.012,
            });
          }
        }
      }

      // Sort by depth for painter's algorithm
      const sorted = [...nodes.keys()].sort(
        (a, b) => nodes[a].depth - nodes[b].depth,
      );

      // ── PASS 1: Background-depth nodes with blur ──────────────────────────
      ctx.save();
      ctx.filter = "blur(1.5px)";
      for (const i of sorted) {
        const n = nodes[i];
        if (n.depth !== 0 || n.opacity < 0.05) continue;
        const c = N_COLOR[n.type];
        const fa = n.opacity * 0.3 * (focusRef.current[i] ?? 1);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = rgbA(c.r, c.g, c.b, fa * 0.8);
        ctx.fill();
      }
      ctx.filter = "none";
      ctx.restore();

      // ── PASS 2: Connections ───────────────────────────────────────────────
      const drawn = new Set<string>();
      const time = performance.now() * 0.001;

      // Relationship-based connections
      for (const n of nodes) {
        if (n.opacity < 0.05 || n.depth === 0) continue;
        const ni = nodes.indexOf(n);
        const fi = focusRef.current[ni] ?? 1;
        for (const lid of n.linkedIds) {
          const oi = nodes.findIndex((x) => x.id === lid);
          if (oi < 0) continue;
          const other = nodes[oi];
          const fo = focusRef.current[oi] ?? 1;
          const key = [n.id, lid].sort().join("--");
          if (drawn.has(key)) continue;
          drawn.add(key);
          if (other.opacity < 0.05) continue;
          const dx = n.x - other.x;
          const dy = n.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > CONN_DIST * 1.6) continue;
          const prox = Math.max(0, 1 - dist / (CONN_DIST * 1.6));
          const osc = 0.2 + Math.sin(time + n.pulsePhase * 0.5) * 0.05;
          const focusScale = Math.min(fi, fo);
          // Highlighted when section focused and line is connected to focused node
          const isHighlit =
            hasFocus &&
            (focusTypes.includes(n.type) || focusTypes.includes(other.type));
          const alpha = isHighlit
            ? 0.6 * prox * Math.min(n.opacity, other.opacity)
            : osc *
              0.28 *
              prox *
              Math.min(n.opacity, other.opacity) *
              focusScale;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(other.x, other.y);
          ctx.strokeStyle = rgbA(62, 213, 152, Math.min(0.6, alpha));
          ctx.lineWidth = isHighlit ? 1.5 : 0.7 + prox * 0.6;
          if (isHighlit) {
            ctx.shadowBlur = 4;
            ctx.shadowColor = "rgba(62,213,152,0.5)";
          } else {
            ctx.shadowBlur = 0;
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      // Proximity connections for mid/foreground nodes
      for (let i = 0; i < sorted.length; i++) {
        const ni = nodes[sorted[i]];
        if (ni.opacity < 0.25 || ni.depth === 0) continue;
        const fni = focusRef.current[sorted[i]] ?? 1;
        let checked = 0;
        for (let j = i + 1; j < sorted.length && checked < 14; j++, checked++) {
          const nj = nodes[sorted[j]];
          if (nj.opacity < 0.25 || nj.depth === 0) continue;
          const fnj = focusRef.current[sorted[j]] ?? 1;
          const key = [ni.id, nj.id].sort().join("--");
          if (drawn.has(key)) continue;
          const dx = ni.x - nj.x;
          const dy = ni.y - nj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist >= CONN_DIST) continue;
          drawn.add(key);
          const prox = 1 - dist / CONN_DIST;
          const osc = 0.2 + Math.sin(time + ni.pulsePhase) * 0.05;
          const focusScale = Math.min(fni, fnj);
          const alpha =
            osc * 0.35 * prox * Math.min(ni.opacity, nj.opacity) * focusScale;
          ctx.beginPath();
          ctx.moveTo(ni.x, ni.y);
          ctx.lineTo(nj.x, nj.y);
          ctx.strokeStyle = rgbA(62, 213, 152, Math.min(0.4, alpha));
          ctx.lineWidth = 0.5 + prox * 0.45;
          ctx.shadowBlur = 0;
          ctx.stroke();
        }
      }

      // ── PASS 3: Signal pulses ─────────────────────────────────────────────
      signalsRef.current = signalsRef.current.filter((p) => p.progress < 1);
      for (const p of signalsRef.current) {
        p.progress = Math.min(1, p.progress + p.speed);
        const fn = nodes[p.fromIdx];
        const tn = nodes[p.toIdx];
        if (!fn || !tn) continue;
        const px = fn.x + (tn.x - fn.x) * p.progress;
        const py = fn.y + (tn.y - fn.y) * p.progress;
        const pa = Math.sin(p.progress * Math.PI) * 0.95;
        ctx.save();
        ctx.shadowBlur = 14;
        ctx.shadowColor = "rgba(62,213,152,0.9)";
        ctx.beginPath();
        ctx.arc(px, py, 2.8, 0, Math.PI * 2);
        ctx.fillStyle = rgbA(200, 255, 230, pa);
        ctx.fill();
        ctx.restore();
      }

      // ── PASS 4: Ripples ───────────────────────────────────────────────────
      ripplesRef.current = ripplesRef.current.filter((r) => r.opacity > 0.01);
      for (const rip of ripplesRef.current) {
        rip.radius += 2.0;
        rip.opacity = Math.max(0, rip.opacity - 0.02);
        if (rip.radius > rip.maxRadius) rip.opacity = 0;
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = rgbA(62, 213, 152, rip.opacity * 0.65);
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // ── PASS 5: Mid & Foreground nodes ───────────────────────────────────
      for (const i of sorted) {
        const n = nodes[i];
        if (n.depth === 0 || n.opacity < 0.02) continue;
        const c = N_COLOR[n.type];
        const fi = focusRef.current[i] ?? 1;
        const baseAlpha =
          n.state === "inactive" ? 0.25 : n.depth === 1 ? 0.7 : 1.0;
        const finalAlpha = n.opacity * baseAlpha * fi;

        // Glow halo (mid + foreground only)
        if (n.depth > 0) {
          const glowR = n.radius * (2.8 + n.glow * 1.6);
          if (glowR > 0) {
            const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
            grad.addColorStop(
              0,
              rgbA(c.r, c.g, c.b, Math.min(0.55, finalAlpha * n.glow * 0.5)),
            );
            grad.addColorStop(1, rgbA(c.r, c.g, c.b, 0));
            ctx.beginPath();
            ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
          }
        }

        // Node core with shadow blur glow
        ctx.save();
        if (n.depth > 0) {
          const blurVal =
            n.state === "new" ? 32 : n.depth === 2 ? 16 + n.glow * 10 : 6;
          ctx.shadowBlur = blurVal * fi;
          ctx.shadowColor = rgbA(c.r, c.g, c.b, 0.9);
        }
        const coreA =
          n.state === "inactive"
            ? Math.min(1, 0.3 * finalAlpha * 3.5)
            : Math.min(1, finalAlpha * (0.78 + Math.sin(n.pulsePhase) * 0.14));
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = rgbA(c.r, c.g, c.b, coreA);
        ctx.fill();
        ctx.restore();
      }

      // ── 100% completion overlay ───────────────────────────────────────────
      if (score >= 100) {
        const fadeIn = Math.min(1, (elapsed - 500) / 2000);
        if (fadeIn > 0) {
          ctx.save();
          ctx.fillStyle = `rgba(13,31,26,${(fadeIn * 0.6).toFixed(3)})`;
          ctx.fillRect(0, 0, w, h);
          // "Your legacy is now connected." text
          if (fadeIn > 0.5) {
            const textAlpha = (fadeIn - 0.5) * 2;
            ctx.globalAlpha = textAlpha;
            ctx.font = "500 15px -apple-system, BlinkMacSystemFont, sans-serif";
            ctx.fillStyle = "#ffffff";
            ctx.letterSpacing = "0.1em";
            ctx.textAlign = "center";
            ctx.fillText("Your legacy is now connected.", w / 2, h - 40);
            ctx.globalAlpha = 1;
          }
          ctx.restore();
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      io.disconnect();
      ro.disconnect();
    };
  }, [reduced]);

  // Touch tap → highlight cluster + ripple
  const handleTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const t = e.touches[0];
    if (!t) return;
    const tx = t.clientX - rect.left;
    const ty = t.clientY - rect.top;
    const nodes = nodesRef.current;
    let nearest: NeuralLegacyNode | null = null;
    let nearDist = 65;
    for (const n of nodes) {
      const d = Math.sqrt((n.x - tx) ** 2 + (n.y - ty) ** 2);
      if (d < nearDist) {
        nearDist = d;
        nearest = n;
      }
    }
    if (nearest) {
      for (const lid of nearest.linkedIds) {
        const ln = nodes.find((x) => x.id === lid);
        if (ln) ln.glow = Math.min(1.5, ln.glow + 0.5);
      }
      nearest.glow = 1.5;
      ripplesRef.current.push({
        x: nearest.x,
        y: nearest.y,
        radius: nearest.radius,
        maxRadius: 64,
        opacity: 0.85,
      });
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
      onTouchStart={handleTouch}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

// ─── Legacy: Preparedness Header (Neural Net + Score + Insight) ───────────────

function LegacyProgressArc({
  score,
}: {
  score: number;
  isDark: boolean;
}) {
  const reduced = useReducedMotion();
  const [displayScore, setDisplayScore] = useState(0);
  const [insightVisible, setInsightVisible] = useState(true);
  const prevInsightRef = useRef("");
  const prevScoreRef = useRef(0);

  // Count-up animation (600ms ease-out cubic)
  useEffect(() => {
    const from = prevScoreRef.current;
    prevScoreRef.current = score;
    if (reduced) {
      setDisplayScore(score);
      return;
    }
    const start = Date.now();
    const dur = 600;
    let rafId: number;
    const step = () => {
      const p = Math.min((Date.now() - start) / dur, 1);
      const eased = 1 - (1 - p) ** 3;
      setDisplayScore(Math.round(from + (score - from) * eased));
      if (p < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [score, reduced]);

  // Dynamic insight text
  const dynamicInsight =
    score === 0
      ? "Begin building your legacy plan"
      : score <= 30
        ? "Your plan is taking shape"
        : score <= 60
          ? "Good coverage established"
          : score <= 89
            ? "Nearly complete"
            : "Comprehensive plan active";

  useEffect(() => {
    if (prevInsightRef.current !== dynamicInsight) {
      setInsightVisible(false);
      const t = setTimeout(() => {
        prevInsightRef.current = dynamicInsight;
        setInsightVisible(true);
      }, 180);
      return () => clearTimeout(t);
    }
  }, [dynamicInsight]);

  return (
    <div
      aria-label={`Legacy preparedness score: ${score}%`}
      style={{ padding: "24px 0 14px", position: "relative" }}
    >
      {/* ── Score display ── */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "center",
          gap: 2,
          marginTop: 14,
          marginBottom: 8,
          lineHeight: 1,
        }}
      >
        <span
          className="font-display"
          style={{
            fontSize: 32,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "#ffffff",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {displayScore}
        </span>
        <span
          className="font-body"
          style={{
            fontSize: 14,
            fontWeight: 400,
            color: "rgba(255,255,255,0.5)",
            marginBottom: 2,
          }}
        >
          %
        </span>
      </div>

      {/* ── AI insight text ── */}
      <p
        className="font-body"
        style={{
          fontSize: 12.5,
          color: "rgba(255,255,255,0.55)",
          textAlign: "center",
          margin: 0,
          lineHeight: 1.45,
          opacity: insightVisible ? 1 : 0,
          transition: reduced ? "none" : "opacity 0.4s ease",
        }}
      >
        {dynamicInsight}
      </p>
    </div>
  );
}

// ─── Legacy: AI Insights Strip ────────────────────────────────────────────────

function LegacyInsightsStrip({ state }: { state: LegacyState }) {
  type Insight = {
    key: string;
    text: string;
    type: "warning" | "neutral" | "success";
  };

  const insights = React.useMemo<Insight[]>(() => {
    const all: Array<Insight | false> = [
      state.nominees.count < 1 && {
        key: "no-nominees",
        text: "Add a nominee to protect your family",
        type: "warning" as const,
      },
      !state.nominees.hasBackup &&
        state.nominees.count >= 1 && {
          key: "add-backup-nominee",
          text: "Add a second nominee to strengthen coverage",
          type: "warning" as const,
        },
      !state.will.exists && {
        key: "no-will",
        text: "No will created yet",
        type: "warning" as const,
      },
      !state.messages.exists && {
        key: "no-messages",
        text: "No guidance prepared for your family",
        type: "neutral" as const,
      },
      state.vaultCheckIn.isActive && {
        key: "checkin-active",
        text: "Vault is actively maintained",
        type: "success" as const,
      },
    ];
    return all.filter((i): i is Insight => Boolean(i)).slice(0, 3);
  }, [
    state.nominees.count,
    state.nominees.hasBackup,
    state.will.exists,
    state.messages.exists,
    state.vaultCheckIn.isActive,
  ]);

  const dotColor = {
    warning: "#F59E0B",
    neutral: "rgba(255,255,255,0.4)",
    success: "#3ed598",
  };

  return (
    <div>
      <p
        className="font-body font-semibold mb-3"
        style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.4)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        AI Insights
      </p>
      {insights.map((insight, i) => (
        <motion.div
          key={insight.key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
          className="flex items-start gap-2.5"
          style={{ marginBottom: i < insights.length - 1 ? 10 : 0 }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: dotColor[insight.type],
              flexShrink: 0,
              marginTop: 4,
            }}
          />
          <span
            className="font-body"
            style={{
              fontSize: 13,
              color:
                insight.type === "warning"
                  ? "#ffffff"
                  : insight.type === "success"
                    ? "#3ed598"
                    : "rgba(255,255,255,0.55)",
              lineHeight: 1.45,
            }}
          >
            {insight.text}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Legacy: Section Card Button ──────────────────────────────────────────────

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  summary: string;
  chip?: { label: string; type: "active" | "pending" | "grey" | "soon" };
  onClick: () => void;
  ocid: string;
  delay?: number;
}

function LegacySectionCard({
  icon,
  title,
  summary,
  chip,
  onClick,
  ocid,
  delay = 0,
}: SectionCardProps) {
  const chipStyles = {
    active: { bg: "rgba(62,213,152,0.18)", color: "#3ed598" },
    pending: { bg: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" },
    grey: { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" },
    soon: { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" },
  };
  const cs = chip ? chipStyles[chip.type] : null;

  return (
    <motion.button
      type="button"
      data-ocid={ocid}
      onClick={onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      whileTap={{ scale: 0.97 }}
      className="w-full text-left"
      style={{
        background: "rgba(13,31,26,0.88)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(62,213,152,0.14)",
        borderRadius: 18,
        padding: "15px 16px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        gap: 14,
        cursor: "pointer",
        outline: "none",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "rgba(62,213,152,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "#3ed598",
        }}
      >
        {icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className="font-body font-medium truncate"
          style={{
            fontSize: 15,
            color: "#ffffff",
            lineHeight: 1.3,
          }}
        >
          {title}
        </p>
        <p
          className="font-body truncate"
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.3,
            marginTop: 2,
          }}
        >
          {summary}
        </p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {chip && cs && (
          <span
            className="font-body font-medium"
            style={{
              fontSize: 11,
              color: cs.color,
              background: cs.bg,
              borderRadius: 100,
              padding: "2px 8px",
              letterSpacing: "0.03em",
              animation:
                chip.type === "active"
                  ? "legacyChipPulse 3s ease-in-out infinite"
                  : "none",
            }}
          >
            {chip.label}
          </span>
        )}
        <ChevronRight
          style={{ color: "rgba(255,255,255,0.3)", width: 16, height: 16 }}
          strokeWidth={2}
        />
      </div>
    </motion.button>
  );
}

// ─── Legacy: Sub-pages ────────────────────────────────────────────────────────

function SubPageWrapper({
  title,
  onBack,
  children,
  ocid,
}: {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
  ocid: string;
}) {
  return (
    <motion.div
      key={`sub-${title}`}
      data-ocid={ocid}
      initial={{ x: 30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 30, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex flex-col h-full"
      style={{ background: "var(--app-bg)" }}
    >
      {/* Sub-page header */}
      <div
        className="flex items-center gap-2.5 flex-shrink-0"
        style={{
          padding: "16px 20px 12px",
          borderBottom: "1px solid var(--card-border)",
          background: "var(--app-bg)",
        }}
      >
        <button
          type="button"
          aria-label={`Back from ${title}`}
          onClick={onBack}
          className="flex items-center gap-1 transition-smooth"
          style={{
            background: "none",
            border: "none",
            padding: 0,
            color: "var(--accent)",
            cursor: "pointer",
          }}
        >
          <ChevronRight className="w-4 h-4 rotate-180" strokeWidth={2} />
        </button>
        <p
          className="font-display font-semibold"
          style={{
            fontSize: 16,
            color: "var(--text-primary)",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </p>
      </div>

      {/* Sub-page body */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "20px 20px 32px" }}
      >
        {children}
      </div>
    </motion.div>
  );
}

// ─── Legacy: Nominees Sub-page ────────────────────────────────────────────────

function NomineesSubPage({
  state,
  onAddNominee,
  onBack,
}: {
  state: LegacyState;
  onAddNominee: () => void;
  onBack: () => void;
}) {
  const roleLabels = ["Primary", "Secondary", "Executor"];

  return (
    <SubPageWrapper
      title="Nominees & Roles"
      onBack={onBack}
      ocid="legacy.nominees.panel"
    >
      <p
        className="font-body"
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          marginBottom: 20,
        }}
      >
        Assign who protects and inherits your assets.
      </p>

      {state.nominees.list.length === 0 ? (
        <div
          data-ocid="legacy.nominees.empty_state"
          style={{
            padding: "32px 20px",
            textAlign: "center",
            background: "var(--app-bg-2)",
            borderRadius: 12,
            marginBottom: 16,
            border: "1px solid var(--card-border)",
          }}
        >
          <Users
            className="mx-auto mb-3"
            style={{ width: 32, height: 32, color: "var(--text-muted)" }}
            strokeWidth={1.4}
          />
          <p
            className="font-body"
            style={{
              fontSize: 14,
              color: "var(--text-secondary)",
            }}
          >
            No nominees added yet
          </p>
        </div>
      ) : (
        <div style={{ marginBottom: 16 }}>
          {state.nominees.list.map((n, i) => (
            <motion.div
              key={n.id}
              data-ocid={`legacy.nominees.item.${i + 1}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.3, ease: "easeOut" }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                background: "var(--card-bg)",
                borderRadius: 12,
                marginBottom: 8,
                border: "1px solid var(--card-border)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "var(--accent-tint)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <User
                  style={{ width: 16, height: 16, color: "var(--accent)" }}
                  strokeWidth={1.8}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="font-body font-medium truncate"
                  style={{
                    fontSize: 14,
                    color: "var(--text-primary)",
                  }}
                >
                  {n.name}
                </p>
                <p
                  className="font-body"
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                  }}
                >
                  {n.relationship}
                </p>
              </div>
              <span
                className="font-body font-medium"
                style={{
                  fontSize: 11,
                  color: i === 0 ? "var(--accent)" : "var(--text-secondary)",
                  background:
                    i === 0 ? "var(--accent-tint)" : "var(--app-bg-2)",
                  borderRadius: 100,
                  padding: "2px 8px",
                }}
              >
                {roleLabels[Math.min(i, 2)]}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      <button
        type="button"
        data-ocid="legacy.nominees.add_button"
        onClick={onAddNominee}
        className="font-body font-medium"
        style={{
          width: "100%",
          height: 48,
          borderRadius: 12,
          border: "1.5px dashed var(--card-border)",
          background: "var(--accent-tint)",
          color: "var(--accent)",
          fontSize: 14,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <Plus style={{ width: 16, height: 16 }} strokeWidth={2} />
        Add Nominee
      </button>
    </SubPageWrapper>
  );
}

// ─── Legacy: Inline Vault Check-in row ───────────────────────────────────────

function InlineVaultCheckIn({
  vaultCheckIn,
  onCheckIn,
}: {
  vaultCheckIn: { isActive: boolean; lastCheckedAt: Date | null };
  onCheckIn: () => void;
}) {
  const [justCheckedIn, setJustCheckedIn] = useState(false);
  const [pulsing, setPulsing] = useState(false);

  const isCheckedToday = (() => {
    if (!vaultCheckIn.lastCheckedAt) return false;
    const today = new Date();
    const last = new Date(vaultCheckIn.lastCheckedAt);
    return (
      today.getFullYear() === last.getFullYear() &&
      today.getMonth() === last.getMonth() &&
      today.getDate() === last.getDate()
    );
  })();

  const alreadyDone = vaultCheckIn.isActive && isCheckedToday;

  const handleTap = () => {
    if (alreadyDone || justCheckedIn) return;
    setPulsing(true);
    onCheckIn();
    setJustCheckedIn(true);
    setTimeout(() => setPulsing(false), 1200);
  };

  const confirmed = alreadyDone || justCheckedIn;

  return (
    <div
      data-ocid="legacy.inline_checkin.row"
      onClick={confirmed ? undefined : handleTap}
      onKeyDown={
        confirmed ? undefined : (e) => e.key === "Enter" && handleTap()
      }
      role={confirmed ? undefined : "button"}
      tabIndex={confirmed ? undefined : 0}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        borderRadius: 14,
        padding: "11px 14px",
        marginBottom: 12,
        border: `1px solid ${confirmed ? "rgba(62,213,152,0.30)" : "rgba(62,213,152,0.15)"}`,
        background: confirmed
          ? "rgba(62,213,152,0.07)"
          : "rgba(255,255,255,0.04)",
        cursor: confirmed ? "default" : "pointer",
        transition: "background 0.3s ease, border-color 0.3s ease",
        animation: pulsing ? "checkinRowPulse 0.9s ease-out" : undefined,
      }}
    >
      {/* Left: heartbeat icon + label */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Minimal inline heartbeat SVG */}
        <svg
          width="28"
          height="18"
          viewBox="0 0 28 18"
          fill="none"
          aria-hidden="true"
          style={{
            flexShrink: 0,
            opacity: confirmed ? 1 : 0.7,
          }}
        >
          <polyline
            points="0,9 5,9 8,3 11,15 14,6 17,12 20,9 28,9"
            fill="none"
            stroke={confirmed ? "#3ED598" : "rgba(62,213,152,0.6)"}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={
              !confirmed
                ? { animation: "inlineHeartbeatPulse 3s ease-in-out infinite" }
                : undefined
            }
          />
        </svg>
        <div>
          <p
            className="font-body font-medium"
            style={{
              fontSize: 13,
              color: confirmed ? "#3ED598" : "rgba(255,255,255,0.85)",
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
            }}
          >
            Vault Check-in
          </p>
          <p
            className="font-body"
            style={{
              fontSize: 11,
              color: confirmed
                ? "rgba(62,213,152,0.7)"
                : "rgba(255,255,255,0.35)",
              marginTop: 1,
            }}
          >
            {confirmed
              ? "Vault protected · active"
              : "Tap to confirm vault is active"}
          </p>
        </div>
      </div>

      {/* Right: action button or confirmed state */}
      {confirmed ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            color: "#3ED598",
            fontSize: 12,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="7" cy="7" r="6.5" stroke="#3ED598" strokeWidth={1} />
            <polyline
              points="4,7 6.2,9.2 10,5"
              stroke="#3ED598"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Checked today
        </div>
      ) : (
        <button
          type="button"
          data-ocid="legacy.inline_checkin.button"
          onClick={(e) => {
            e.stopPropagation();
            handleTap();
          }}
          style={{
            flexShrink: 0,
            padding: "6px 14px",
            borderRadius: 20,
            background: "rgba(62,213,152,0.15)",
            border: "1px solid rgba(62,213,152,0.35)",
            color: "#3ED598",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            letterSpacing: "-0.01em",
            transition: "background 0.2s ease, transform 0.15s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(62,213,152,0.25)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(62,213,152,0.15)";
          }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform =
              "scale(0.95)";
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          }}
        >
          Check in
        </button>
      )}
    </div>
  );
}

// ─── Legacy: Vault Check-in Sub-page ─────────────────────────────────────────

function VaultCheckInSubPage({
  state,
  onCheckIn,
  onBack,
}: {
  state: LegacyState;
  onCheckIn: () => void;
  onBack: () => void;
}) {
  const [didCheckIn, setDidCheckIn] = useState(false);

  const handleCheckIn = () => {
    setDidCheckIn(true);
    onCheckIn();
  };

  const now = new Date();
  const nextDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const fmtDate = (d: Date) =>
    d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <SubPageWrapper
      title="Vault Check-in"
      onBack={onBack}
      ocid="legacy.checkin.panel"
    >
      {/* Heartbeat visualisation */}
      <div
        style={{
          height: 56,
          borderRadius: 12,
          background: "var(--app-bg-2)",
          overflow: "hidden",
          position: "relative",
          marginBottom: 24,
          border: "1px solid var(--card-border)",
        }}
      >
        {/* Static waveform baseline */}
        <svg
          viewBox="0 0 320 56"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
        >
          <polyline
            points="0,28 30,28 45,14 55,40 65,20 75,36 85,28 320,28"
            fill="none"
            stroke="var(--accent)"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.6}
          />
        </svg>

        {/* Travelling highlight */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, var(--accent-tint) 40%, var(--accent-tint) 60%, transparent 100%)",
            width: "60%",
            animation: "legacyHeartbeat 2.5s ease-in-out infinite",
          }}
        />
      </div>

      {/* Info rows */}
      <div style={{ marginBottom: 24 }}>
        {[
          {
            label: "Status",
            value:
              state.vaultCheckIn.isActive || didCheckIn
                ? "Vault protected"
                : "Not yet checked in",
          },
          {
            label: "Last check-in",
            value: state.vaultCheckIn.lastCheckedAt
              ? fmtDate(state.vaultCheckIn.lastCheckedAt)
              : "Never",
          },
          { label: "Next window", value: fmtDate(nextDate) },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: "1px solid var(--card-border)",
            }}
          >
            <span
              className="font-body"
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
              }}
            >
              {label}
            </span>
            <span
              className="font-body font-medium"
              style={{
                fontSize: 13,
                color: "var(--text-primary)",
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      <motion.button
        type="button"
        data-ocid="legacy.checkin.submit_button"
        onClick={handleCheckIn}
        whileTap={{ scale: 0.97 }}
        disabled={didCheckIn || state.vaultCheckIn.isActive}
        className="font-body font-medium"
        style={{
          width: "100%",
          height: 48,
          borderRadius: 12,
          border: "none",
          background:
            didCheckIn || state.vaultCheckIn.isActive
              ? "var(--accent-tint)"
              : "var(--accent)",
          color:
            didCheckIn || state.vaultCheckIn.isActive
              ? "var(--accent)"
              : "#FFFFFF",
          fontSize: 15,
          cursor:
            didCheckIn || state.vaultCheckIn.isActive ? "default" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "all 0.2s ease",
        }}
      >
        {didCheckIn || state.vaultCheckIn.isActive ? (
          <>
            <Check style={{ width: 16, height: 16 }} strokeWidth={2.5} />
            Vault Confirmed
          </>
        ) : (
          "Check In Now"
        )}
      </motion.button>
    </SubPageWrapper>
  );
}

// ─── Legacy: Release Logic Sub-page ──────────────────────────────────────────

function ReleaseLogicSubPage({
  state,
  onChange,
  onBack,
}: {
  state: LegacyState;
  onChange: (partial: Partial<LegacyState["releaseLogic"]>) => void;
  onBack: () => void;
}) {
  const [nodesVisible, setNodesVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setNodesVisible(true), 150);
    return () => clearTimeout(t);
  }, []);

  const days = [30, 60, 90, 180];

  const nodes = [
    {
      label: "Inactivity",
      desc: "No vault activity detected",
      icon: <Lock style={{ width: 14, height: 14 }} strokeWidth={2} />,
    },
    {
      label: "Verification",
      desc: "Multi-layer identity check",
      icon: <Shield style={{ width: 14, height: 14 }} strokeWidth={2} />,
    },
    {
      label: "Release",
      desc: "Assets become accessible",
      icon: <LockOpen style={{ width: 14, height: 14 }} strokeWidth={2} />,
    },
  ];

  return (
    <SubPageWrapper
      title="Release Logic"
      onBack={onBack}
      ocid="legacy.release.panel"
    >
      <p
        className="font-body"
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          marginBottom: 20,
        }}
      >
        Your vault activates only after multi-layer verification.
      </p>

      {/* Flow diagram */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
          padding: "16px 12px",
          background: "var(--app-bg-2)",
          borderRadius: 12,
          border: "1px solid var(--card-border)",
        }}
      >
        {nodes.map((node, i) => (
          <React.Fragment key={node.label}>
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={nodesVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.15, duration: 0.35, ease: "easeOut" }}
              style={{ textAlign: "center", flex: 1 }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "var(--accent-tint)",
                  border: "1.5px solid var(--card-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 6px",
                  color: "var(--accent)",
                }}
              >
                {node.icon}
              </div>
              <p
                className="font-body font-semibold"
                style={{
                  fontSize: 11,
                  color: "var(--text-primary)",
                }}
              >
                {node.label}
              </p>
              <p
                className="font-body"
                style={{
                  fontSize: 10,
                  color: "var(--text-muted)",
                  marginTop: 2,
                  lineHeight: 1.3,
                }}
              >
                {node.desc}
              </p>
            </motion.div>

            {i < nodes.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={nodesVisible ? { opacity: 1, scaleX: 1 } : {}}
                transition={{
                  delay: i * 0.15 + 0.2,
                  duration: 0.3,
                  ease: "easeOut",
                }}
                style={{
                  height: 1,
                  background: "var(--accent)",
                  opacity: 0.3,
                  width: 20,
                  flexShrink: 0,
                  transformOrigin: "left",
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Inactivity period selector */}
      <div style={{ marginBottom: 20 }}>
        <p
          className="font-body font-medium"
          style={{
            fontSize: 13,
            color: "var(--text-primary)",
            marginBottom: 10,
          }}
        >
          Inactivity period
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          {days.map((d) => (
            <button
              key={d}
              type="button"
              data-ocid={`legacy.release.days_${d}_button`}
              onClick={() => onChange({ inactivityDays: d })}
              className="font-body font-medium"
              style={{
                flex: 1,
                height: 38,
                borderRadius: 10,
                border:
                  state.releaseLogic.inactivityDays === d
                    ? "1.5px solid var(--accent)"
                    : "1.5px solid var(--card-border)",
                background:
                  state.releaseLogic.inactivityDays === d
                    ? "var(--accent-tint)"
                    : "var(--app-bg-2)",
                color:
                  state.releaseLogic.inactivityDays === d
                    ? "var(--accent)"
                    : "var(--text-secondary)",
                fontSize: 12,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Verification toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          background: "var(--app-bg-2)",
          borderRadius: 12,
          border: "1px solid var(--card-border)",
        }}
      >
        <div>
          <p
            className="font-body font-medium"
            style={{
              fontSize: 14,
              color: "var(--text-primary)",
            }}
          >
            Verification step
          </p>
          <p
            className="font-body"
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              marginTop: 2,
            }}
          >
            Require nominee identity check
          </p>
        </div>
        <button
          type="button"
          data-ocid="legacy.release.verification_toggle"
          role="switch"
          aria-checked={state.releaseLogic.verificationSet}
          onClick={() =>
            onChange({ verificationSet: !state.releaseLogic.verificationSet })
          }
          style={{
            width: 44,
            height: 26,
            borderRadius: 13,
            border: "none",
            background: state.releaseLogic.verificationSet
              ? "var(--accent)"
              : "var(--card-border)",
            cursor: "pointer",
            padding: 0,
            position: "relative",
            transition: "background 0.25s ease",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 3,
              left: state.releaseLogic.verificationSet ? 21 : 3,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
              transition: "left 0.25s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          />
        </button>
      </div>
    </SubPageWrapper>
  );
}

// ─── Legacy: Messages Sub-page ────────────────────────────────────────────────

type LegacyMessage = {
  id: string;
  recipient: string;
  text: string;
  condition: string;
};

function MessagesSubPage({
  state,
  onAddMessage,
  onBack,
}: {
  state: LegacyState;
  onAddMessage: (msg: LegacyMessage) => void;
  onBack: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [text, setText] = useState("");
  const [condition, setCondition] = useState("On vault release");

  const handleSave = () => {
    if (!recipient.trim() || !text.trim()) return;
    onAddMessage({
      id: Math.random().toString(36).slice(2, 10),
      recipient: recipient.trim(),
      text: text.trim(),
      condition,
    });
    setRecipient("");
    setText("");
    setShowForm(false);
  };

  return (
    <SubPageWrapper
      title="Messages"
      onBack={onBack}
      ocid="legacy.messages.panel"
    >
      <p
        className="font-body"
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          marginBottom: 20,
        }}
      >
        Leave personal guidance for your family.
      </p>

      {state.messages.list.length === 0 && !showForm ? (
        <div
          data-ocid="legacy.messages.empty_state"
          style={{
            padding: "32px 20px",
            textAlign: "center",
            background: "var(--app-bg-2)",
            borderRadius: 12,
            marginBottom: 16,
            border: "1px solid var(--card-border)",
          }}
        >
          <MessageSquare
            className="mx-auto mb-3"
            style={{ width: 32, height: 32, color: "var(--text-muted)" }}
            strokeWidth={1.4}
          />
          <p
            className="font-body"
            style={{
              fontSize: 14,
              color: "var(--text-secondary)",
            }}
          >
            No guidance prepared for your family
          </p>
        </div>
      ) : (
        <div style={{ marginBottom: 16 }}>
          {state.messages.list.map((msg, i) => (
            <motion.div
              key={msg.id}
              data-ocid={`legacy.messages.item.${i + 1}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.3, ease: "easeOut" }}
              style={{
                padding: "14px 16px",
                background: "var(--card-bg)",
                borderRadius: 12,
                marginBottom: 8,
                border: "1px solid var(--card-border)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span
                  className="font-body font-medium"
                  style={{
                    fontSize: 13,
                    color: "var(--text-primary)",
                  }}
                >
                  To: {msg.recipient}
                </span>
                <span
                  className="font-body"
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                  }}
                >
                  {msg.condition}
                </span>
              </div>
              <p
                className="font-body"
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.4,
                }}
              >
                {msg.text}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {showForm ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: "16px",
            background: "var(--app-bg-2)",
            borderRadius: 12,
            border: "1px solid var(--card-border)",
            marginBottom: 12,
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <label
              htmlFor="legacy-msg-recipient"
              className="font-body font-medium"
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                display: "block",
                marginBottom: 6,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              RECIPIENT
            </label>
            <input
              id="legacy-msg-recipient"
              data-ocid="legacy.messages.recipient_input"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. My daughter"
              className="font-body"
              style={{
                width: "100%",
                height: 40,
                borderRadius: 8,
                border: "1px solid var(--input-border)",
                padding: "0 12px",
                fontSize: 14,
                color: "var(--text-primary)",
                background: "var(--card-bg)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label
              htmlFor="legacy-msg-text"
              className="font-body font-medium"
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                display: "block",
                marginBottom: 6,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              MESSAGE
            </label>
            <textarea
              id="legacy-msg-text"
              data-ocid="legacy.messages.textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What do you want them to know?"
              rows={3}
              className="font-body"
              style={{
                width: "100%",
                borderRadius: 8,
                border: "1px solid var(--input-border)",
                padding: "10px 12px",
                fontSize: 14,
                color: "var(--text-primary)",
                background: "var(--card-bg)",
                outline: "none",
                resize: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="legacy-msg-condition"
              className="font-body font-medium"
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                display: "block",
                marginBottom: 6,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              DELIVERY
            </label>
            <select
              id="legacy-msg-condition"
              data-ocid="legacy.messages.condition_select"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="font-body"
              style={{
                width: "100%",
                height: 40,
                borderRadius: 8,
                border: "1px solid var(--input-border)",
                padding: "0 12px",
                fontSize: 14,
                color: "var(--text-primary)",
                background: "var(--card-bg)",
                outline: "none",
                boxSizing: "border-box",
              }}
            >
              <option>On vault release</option>
              <option>On emergency access</option>
              <option>Immediately upon request</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              data-ocid="legacy.messages.cancel_button"
              onClick={() => setShowForm(false)}
              className="font-body font-medium"
              style={{
                flex: 1,
                height: 40,
                borderRadius: 10,
                border: "1px solid var(--card-border)",
                background: "transparent",
                color: "var(--text-secondary)",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              data-ocid="legacy.messages.save_button"
              onClick={handleSave}
              disabled={!recipient.trim() || !text.trim()}
              className="font-body font-medium"
              style={{
                flex: 2,
                height: 40,
                borderRadius: 10,
                border: "none",
                background:
                  recipient.trim() && text.trim()
                    ? "var(--accent)"
                    : "var(--app-bg-2)",
                color:
                  recipient.trim() && text.trim()
                    ? "#FFFFFF"
                    : "var(--text-muted)",
                fontSize: 14,
                cursor: recipient.trim() && text.trim() ? "pointer" : "default",
                transition: "all 0.2s ease",
              }}
            >
              Save Message
            </button>
          </div>
        </motion.div>
      ) : (
        <button
          type="button"
          data-ocid="legacy.messages.add_button"
          onClick={() => setShowForm(true)}
          className="font-body font-medium"
          style={{
            width: "100%",
            height: 48,
            borderRadius: 12,
            border: "1.5px dashed var(--card-border)",
            background: "var(--accent-tint)",
            color: "var(--accent)",
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <Plus style={{ width: 16, height: 16 }} strokeWidth={2} />
          Add a Message
        </button>
      )}
    </SubPageWrapper>
  );
}

// ─── Legacy: Emergency Access Sub-page ───────────────────────────────────────

function EmergencyAccessSubPage({ onBack }: { onBack: () => void }) {
  const [triggered, setTriggered] = useState(false);

  return (
    <SubPageWrapper
      title="Emergency Access"
      onBack={onBack}
      ocid="legacy.emergency.panel"
    >
      <p
        className="font-body"
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          marginBottom: 24,
        }}
      >
        Use this only in a genuine emergency. This will notify your nominees and
        begin the verification process.
      </p>

      <div
        style={{
          padding: "20px 16px",
          borderRadius: 12,
          border: "1.5px solid rgba(245,158,11,0.25)",
          background: "rgba(245,158,11,0.04)",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <AlertTriangle
            style={{
              width: 18,
              height: 18,
              color: "#F59E0B",
              flexShrink: 0,
              marginTop: 1,
            }}
            strokeWidth={2}
          />
          <p
            className="font-body"
            style={{
              fontSize: 13,
              color: "#92400E",
              lineHeight: 1.5,
            }}
          >
            This action cannot be undone. Your nominees will be notified
            immediately and the verification sequence will begin.
          </p>
        </div>
      </div>

      <motion.button
        type="button"
        data-ocid="legacy.emergency.trigger_button"
        onClick={() => setTriggered(true)}
        disabled={triggered}
        whileTap={!triggered ? { scale: 0.97 } : {}}
        className="font-body font-medium"
        style={{
          width: "100%",
          height: 50,
          borderRadius: 12,
          border: triggered ? "none" : "1.5px solid rgba(239,68,68,0.4)",
          background: triggered ? "var(--accent-tint)" : "rgba(239,68,68,0.04)",
          color: triggered ? "var(--accent)" : "#DC2626",
          fontSize: 15,
          cursor: triggered ? "default" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          marginBottom: 14,
          transition: "all 0.2s ease",
        }}
      >
        {triggered ? (
          <>
            <Check style={{ width: 16, height: 16 }} strokeWidth={2.5} />
            Nominees Notified
          </>
        ) : (
          "Trigger Emergency Access"
        )}
      </motion.button>

      {!triggered && (
        <button
          type="button"
          data-ocid="legacy.emergency.cancel_button"
          onClick={onBack}
          className="font-body"
          style={{
            display: "block",
            margin: "0 auto",
            background: "none",
            border: "none",
            color: "var(--text-secondary)",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      )}
    </SubPageWrapper>
  );
}

// ─── Legacy: Family Vault Sub-page ────────────────────────────────────────────

function FamilyVaultSubPage({ onBack }: { onBack: () => void }) {
  const [notified, setNotified] = useState(false);

  return (
    <SubPageWrapper
      title="Family Vault"
      onBack={onBack}
      ocid="legacy.family.panel"
    >
      <div
        style={{
          textAlign: "center",
          padding: "40px 20px",
          background: "var(--app-bg-2)",
          borderRadius: 16,
          border: "1px solid var(--card-border)",
        }}
      >
        <Heart
          className="mx-auto mb-4"
          style={{ width: 40, height: 40, color: "var(--text-muted)" }}
          strokeWidth={1.4}
        />
        <p
          className="font-display font-semibold"
          style={{
            fontSize: 16,
            color: "var(--text-primary)",
            marginBottom: 8,
          }}
        >
          Family Vault is on the way
        </p>
        <p
          className="font-body"
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            marginBottom: 28,
            lineHeight: 1.5,
          }}
        >
          Shared access for your family is coming soon. We'll let you know when
          it's ready.
        </p>

        <motion.button
          type="button"
          data-ocid="legacy.family.notify_button"
          onClick={() => setNotified(true)}
          disabled={notified}
          whileTap={!notified ? { scale: 0.97 } : {}}
          className="font-body font-medium"
          style={{
            height: 44,
            borderRadius: 12,
            border: "none",
            background: notified
              ? "var(--accent-tint)"
              : "var(--btn-primary-bg)",
            color: notified ? "var(--accent)" : "var(--btn-primary-text)",
            fontSize: 14,
            cursor: notified ? "default" : "pointer",
            padding: "0 28px",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            transition: "all 0.2s ease",
          }}
        >
          {notified ? (
            <>
              <Check style={{ width: 14, height: 14 }} strokeWidth={2.5} />
              You'll be notified
            </>
          ) : (
            "Notify Me"
          )}
        </motion.button>
      </div>
    </SubPageWrapper>
  );
}

// ─── Legacy: System Page (main orchestrator) ──────────────────────────────────

type LegacySection =
  | "nominees"
  | "checkin"
  | "release"
  | "messages"
  | "emergency"
  | "family"
  | null;

function LegacySystemPage({
  nominees,
  onAddNominee,
  assets,
  documents,
}: {
  nominees: Nominee[];
  onAddNominee: () => void;
  assets: Asset[];
  documents: Document[];
}) {
  const [activeSection, setActiveSection] = useState<LegacySection>(null);
  const { isDark } = useTheme();

  // Local state for sections not in global store
  const [vaultCheckIn, setVaultCheckIn] = useState({
    isActive: false,
    lastCheckedAt: null as Date | null,
  });
  const [releaseLogic, setReleaseLogic] = useState({
    inactivityDays: 0,
    verificationSet: false,
  });
  const [messages, setMessages] = useState<LegacyMessage[]>([]);
  const [will] = useState({ exists: false });

  const legacyState: LegacyState = {
    nominees: {
      count: nominees.length,
      hasBackup: nominees.length >= 2,
      list: nominees,
    },
    vaultCheckIn,
    releaseLogic,
    messages: { exists: messages.length > 0, list: messages },
    will,
  };

  // Completion score
  const calcScore = (s: LegacyState): number => {
    let score = 0;
    if (s.nominees.count >= 1) score += 20;
    if (s.nominees.hasBackup) score += 10;
    if (s.vaultCheckIn.isActive) score += 15;
    if (s.releaseLogic.inactivityDays) score += 15;
    if (s.releaseLogic.verificationSet) score += 10;
    if (s.messages.exists) score += 10;
    if (s.will.exists) score += 20;
    return Math.min(score, 100);
  };
  const score = calcScore(legacyState);

  const handleCheckIn = () => {
    setVaultCheckIn({ isActive: true, lastCheckedAt: new Date() });
  };

  const handleReleaseChange = (
    partial: Partial<LegacyState["releaseLogic"]>,
  ) => {
    setReleaseLogic((prev) => ({ ...prev, ...partial }));
  };

  const handleAddMessage = (msg: LegacyMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  // Nominee names helper for summary
  const nomineeNamesSummary = (() => {
    if (nominees.length === 0) return "Assign who inherits your assets";
    const firstNames = nominees.map((n) => n.name.split(" ")[0]);
    if (firstNames.length === 1) return `${firstNames[0]} assigned`;
    if (firstNames.length === 2)
      return `${firstNames[0]} & ${firstNames[1]} assigned`;
    return `${firstNames[0]} + ${firstNames.length - 1} more assigned`;
  })();

  // Section card definitions
  const sections: Array<{
    id: LegacySection;
    icon: React.ReactNode;
    title: string;
    summary: string;
    chip?: SectionCardProps["chip"];
    ocid: string;
  }> = [
    {
      id: "nominees",
      icon: <Users style={{ width: 18, height: 18 }} strokeWidth={1.8} />,
      title: "Nominees & Roles",
      summary: nomineeNamesSummary,
      chip:
        nominees.length > 0
          ? { label: "Active", type: "active" }
          : { label: "Pending", type: "pending" },
      ocid: "legacy.nominees_card.button",
    },
    {
      id: "checkin",
      icon: <Shield style={{ width: 18, height: 18 }} strokeWidth={1.8} />,
      title: "Vault Check-in",
      summary: "Confirm your vault is active",
      chip: vaultCheckIn.isActive
        ? { label: "Active", type: "active" }
        : { label: "Set up", type: "grey" },
      ocid: "legacy.checkin_card.button",
    },
    {
      id: "release",
      icon: <ArrowRight style={{ width: 18, height: 18 }} strokeWidth={1.8} />,
      title: "Release Logic",
      summary: "Define when your vault activates",
      chip: releaseLogic.inactivityDays
        ? { label: "Configured", type: "active" }
        : { label: "Not set", type: "grey" },
      ocid: "legacy.release_card.button",
    },
    {
      id: "messages",
      icon: (
        <MessageSquare style={{ width: 18, height: 18 }} strokeWidth={1.8} />
      ),
      title: "Messages",
      summary: "Leave guidance for your family",
      chip:
        messages.length > 0
          ? { label: "Ready", type: "active" }
          : { label: "None", type: "grey" },
      ocid: "legacy.messages_card.button",
    },
    {
      id: "emergency",
      icon: (
        <AlertTriangle style={{ width: 18, height: 18 }} strokeWidth={1.8} />
      ),
      title: "Emergency Access",
      summary: "Manual trigger for trusted contacts",
      ocid: "legacy.emergency_card.button",
    },
    {
      id: "family",
      icon: <Heart style={{ width: 18, height: 18 }} strokeWidth={1.8} />,
      title: "Family Vault",
      summary: "Shared access coming soon",
      chip: { label: "Coming Soon", type: "soon" },
      ocid: "legacy.family_card.button",
    },
  ];

  return (
    <motion.div
      className="flex flex-col h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={{
        background: NEURAL_CANVAS_BG,
        color: "#ffffff",
        position: "relative",
      }}
    >
      {/* Sub-page overlay — rendered over content */}
      <AnimatePresence>
        {activeSection === "nominees" && (
          <div
            className="absolute inset-0 z-20"
            style={{ background: "var(--app-bg)" }}
          >
            <NomineesSubPage
              state={legacyState}
              onAddNominee={() => {
                onAddNominee();
                setActiveSection(null);
              }}
              onBack={() => setActiveSection(null)}
            />
          </div>
        )}
        {activeSection === "checkin" && (
          <div
            className="absolute inset-0 z-20"
            style={{ background: "var(--app-bg)" }}
          >
            <VaultCheckInSubPage
              state={legacyState}
              onCheckIn={handleCheckIn}
              onBack={() => setActiveSection(null)}
            />
          </div>
        )}
        {activeSection === "release" && (
          <div
            className="absolute inset-0 z-20"
            style={{ background: "var(--app-bg)" }}
          >
            <ReleaseLogicSubPage
              state={legacyState}
              onChange={handleReleaseChange}
              onBack={() => setActiveSection(null)}
            />
          </div>
        )}
        {activeSection === "messages" && (
          <div
            className="absolute inset-0 z-20"
            style={{ background: "var(--app-bg)" }}
          >
            <MessagesSubPage
              state={legacyState}
              onAddMessage={handleAddMessage}
              onBack={() => setActiveSection(null)}
            />
          </div>
        )}
        {activeSection === "emergency" && (
          <div
            className="absolute inset-0 z-20"
            style={{ background: "var(--app-bg)" }}
          >
            <EmergencyAccessSubPage onBack={() => setActiveSection(null)} />
          </div>
        )}
        {activeSection === "family" && (
          <div
            className="absolute inset-0 z-20"
            style={{ background: "var(--app-bg)" }}
          >
            <FamilyVaultSubPage onBack={() => setActiveSection(null)} />
          </div>
        )}
      </AnimatePresence>

      {/* Main scrollable content */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "0 16px", position: "relative", zIndex: 10 }}
        data-ocid="legacy.main.panel"
      >
        {/* Score header — full opaque glass card with neural canvas ONLY behind this card */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 20,
            margin: "16px 0",
          }}
        >
          {/* Neural canvas clipped inside this card only */}
          <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
            <NeuralLegacyCanvas
              assets={assets.map((a) => ({
                id: a.id,
                name: a.name,
                type: a.category,
              }))}
              nominees={nominees.map((n) => ({
                id: n.id,
                name: n.name,
                role: n.relationship,
              }))}
              documents={documents.map((d) => ({
                id: d.id,
                name: d.filename,
                category: d.category,
              }))}
              completionScore={score}
              activeSection={activeSection}
            />
          </div>
          {/* Fully transparent glass card — canvas is visible through it */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              background: "transparent",
              border: "1px solid rgba(62,213,152,0.25)",
              borderRadius: 20,
              padding: "4px 16px 12px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
            }}
          >
            <LegacyProgressArc score={score} isDark={isDark} />
          </div>
        </div>

        {/* Inline Vault Check-in row */}
        <InlineVaultCheckIn
          vaultCheckIn={vaultCheckIn}
          onCheckIn={handleCheckIn}
        />

        {/* AI Insights — glass card */}
        <div
          style={{
            background: "rgba(13,31,26,0.9)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(62,213,152,0.12)",
            borderRadius: 20,
            padding: "16px 18px",
            marginBottom: 16,
          }}
        >
          <LegacyInsightsStrip state={legacyState} />
        </div>

        {/* Section header */}
        <div style={{ marginBottom: 12 }}>
          <p
            className="font-body font-semibold"
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.45)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            Your Legacy
          </p>
          <p
            className="font-display font-semibold"
            style={{
              fontSize: 18,
              color: "#ffffff",
              letterSpacing: "-0.01em",
            }}
          >
            Manage every layer
          </p>
        </div>

        {/* Section cards — glassmorphism over canvas */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            paddingBottom: 32,
          }}
          data-ocid="legacy.sections.list"
        >
          {sections.map((s, i) => (
            <LegacySectionCard
              key={s.id}
              icon={s.icon}
              title={s.title}
              summary={s.summary}
              chip={s.chip}
              onClick={() => setActiveSection(s.id)}
              ocid={s.ocid}
              delay={i * 0.08}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function VaultHome({ onExit: _onExit }: VaultHomeProps) {
  const { isDark } = useTheme();
  const { data } = useOnboardingStore();
  const firstName = data.fullName?.split(" ")[0] ?? "";

  const [assets, setAssets] = useState<Asset[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [legacyPlan, setLegacyPlan] = useState<LegacyPlan | null>(null);
  const [activeModal, setActiveModal] = useState<
    "asset" | "document" | "nominee" | null
  >(null);
  const [selectedAssetCategory, setSelectedAssetCategory] = useState<
    AssetCategory | undefined
  >(undefined);

  // Legacy permanently secured state — once true, never goes back to false
  const [legacyPermanentlySecured, setLegacyPermanentlySecured] =
    useState(false);
  const [assetCountAtLegacySecure, setAssetCountAtLegacySecure] = useState(0);
  // Soft visual reset of tracker when user adds a new asset after legacy secured
  const [trackerReset, setTrackerReset] = useState(false);
  // Legacy System full-page overlay
  const [showLegacyPage, setShowLegacyPage] = useState(false);
  // Shimmer: plays once on first appearance of the breathing card
  const [legacyShimmer, setLegacyShimmer] = useState(false);
  const hasShimmered = useRef(false);
  const reduced = useReducedMotion();

  // Watch for legacy unlock
  useEffect(() => {
    if (!legacyPermanentlySecured && assets.length >= LEGACY_ASSET_THRESHOLD) {
      setLegacyPermanentlySecured(true);
      setAssetCountAtLegacySecure(assets.length);
      // Trigger shimmer once on first unlock (if reduced motion not preferred)
      if (!hasShimmered.current && !reduced) {
        hasShimmered.current = true;
        setLegacyShimmer(true);
        setTimeout(() => setLegacyShimmer(false), 900);
      }
    }
  }, [assets.length, legacyPermanentlySecured, reduced]);

  // Watch for new asset added AFTER legacy was secured → soft reset tracker
  useEffect(() => {
    if (
      legacyPermanentlySecured &&
      assetCountAtLegacySecure > 0 &&
      assets.length > assetCountAtLegacySecure
    ) {
      setTrackerReset(true);
      setAssetCountAtLegacySecure(assets.length);
    }
  }, [assets.length, legacyPermanentlySecured, assetCountAtLegacySecure]);

  const handleOpenAsset = (cat?: AssetCategory) => {
    setSelectedAssetCategory(cat);
    setActiveModal("asset");
  };

  const handleSaveAsset = (assetData: Omit<Asset, "id" | "addedAt">) => {
    setAssets((prev) => [
      ...prev,
      { ...assetData, id: generateId(), addedAt: new Date() },
    ]);
    setActiveModal(null);
  };

  const handleSaveDocument = (docData: Omit<Document, "id" | "addedAt">) => {
    setDocuments((prev) => [
      ...prev,
      { ...docData, id: generateId(), addedAt: new Date() },
    ]);
    setActiveModal(null);
  };

  const handleCameraCapture = (file: File) => {
    // Determine category from selected or default to Identity
    const doc: Omit<Document, "id" | "addedAt"> = {
      category: "Identity",
      filename: file.name,
      note: "Captured via camera",
    };
    setDocuments((prev) => [
      ...prev,
      { ...doc, id: generateId(), addedAt: new Date() },
    ]);
  };

  const handleRemoveDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSaveNominee = (nData: Omit<Nominee, "id">) => {
    setNominees((prev) => [...prev, { ...nData, id: generateId() }]);
    setActiveModal(null);
  };

  // Open Legacy page overlay
  const openLegacyPage = () => setShowLegacyPage(true);

  const cardOrder = (() => {
    const order: string[] = [];
    order.push("networth-history");
    // Hide vault tracker once permanently secured
    if (!legacyPermanentlySecured) {
      order.push("vault-tracker");
    }
    order.push("ai");
    order.push("add-asset");
    order.push("vault-sections");
    order.push("documents");
    // These cards move into the Legacy System Hub when secured
    if (!legacyPermanentlySecured) {
      order.push("legacy");
      order.push("nominees");
      order.push("will-builder");
    } else {
      order.push("legacy-breathing");
    }
    return order;
  })();

  return (
    <div
      className="relative flex flex-col"
      style={{
        minHeight: "100dvh",
        background: "var(--app-bg)",
        maxWidth: 390,
        margin: "0 auto",
      }}
    >
      {/* Top bar */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4"
        style={{
          height: 56,
          borderBottom: "1px solid var(--card-border)",
          background: "var(--card-bg)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
        data-ocid="vault-home.header"
      >
        {/* Left: personalized vault name */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span
            className="font-display font-bold text-base tracking-tight truncate"
            style={{ color: "var(--text-primary)" }}
          >
            Your Vault
            {firstName ? (
              <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                , {firstName}
              </span>
            ) : null}
          </span>
        </div>

        {/* Right: weather widget + theme toggle */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Weather widget */}
          <WeatherWidget />
          {/* Compact Apple-style toggle */}
          <CompactThemeToggle />
        </div>
      </div>

      {/* Scrollable content */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "16px 16px 96px 16px" }}
      >
        {/* Cards */}
        <div className="flex flex-col gap-3">
          {cardOrder.map((cardId, i) => (
            <motion.div
              key={cardId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: i * 0.08,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              {cardId === "networth-history" && (
                <NetWorthHistoryCard assets={assets} />
              )}
              {cardId === "vault-tracker" && (
                <VaultCompletionTracker
                  assets={assets}
                  documents={documents}
                  nominees={nominees}
                  trackerReset={trackerReset}
                />
              )}
              {cardId === "ai" && (
                <AIInsightCard
                  assets={assets}
                  documents={documents}
                  nominees={nominees}
                  willPlan={legacyPlan}
                  legacyPermanentlySecured={legacyPermanentlySecured}
                />
              )}
              {cardId === "add-asset" && (
                <AddAssetCard assets={assets} onAddAsset={handleOpenAsset} />
              )}
              {cardId === "vault-sections" && <VaultSectionsCard />}
              {cardId === "documents" && (
                <DocumentsVaultCard
                  documents={documents}
                  onAddDocument={() => setActiveModal("document")}
                  onCameraCapture={handleCameraCapture}
                  onRemoveDocument={handleRemoveDocument}
                />
              )}
              {cardId === "legacy" && (
                <LegacyProgressCard
                  assets={assets}
                  legacyPermanentlySecured={legacyPermanentlySecured}
                />
              )}
              {cardId === "nominees" && (
                <NomineesCard
                  nominees={nominees}
                  onAddNominee={() => setActiveModal("nominee")}
                />
              )}
              {cardId === "will-builder" && (
                <WillBuilderCard
                  assets={assets}
                  plan={legacyPlan}
                  onSavePlan={setLegacyPlan}
                />
              )}
              {cardId === "legacy-breathing" && (
                <LegacyBreathingCard
                  onTap={openLegacyPage}
                  firstName={firstName}
                  shimmer={legacyShimmer}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Legacy System Hub moved to full-page overlay — see AnimatePresence below */}
      </div>

      {/* Floating FAB with radial menu */}
      <FloatingFAB
        onAddAsset={() => handleOpenAsset()}
        onAddDocument={() => setActiveModal("document")}
        isDark={isDark}
      />

      {/* Security bar */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full flex items-center justify-center gap-1.5"
        style={{
          maxWidth: 390,
          height: 48,
          background: "var(--card-bg)",
          borderTop: "1px solid var(--card-border)",
          zIndex: 10,
        }}
      >
        <Shield
          className="w-3 h-3"
          style={{ color: "var(--text-muted)" }}
          strokeWidth={2}
        />
        <p className="text-xs font-body" style={{ color: "var(--text-muted)" }}>
          Zero-Knowledge Security. Only you can access your data.
        </p>
      </div>

      {/* Legacy System — full-page overlay, slides in from right */}
      <AnimatePresence>
        {showLegacyPage && (
          <motion.div
            key="legacy-page"
            data-ocid="legacy.page"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 flex flex-col"
            style={{
              background: NEURAL_CANVAS_BG,
              zIndex: 50,
              maxWidth: 390,
              left: "50%",
              marginLeft: "-195px",
            }}
          >
            {/* Legacy page header — glassmorphism over neural canvas */}
            <div
              className="flex-shrink-0 flex items-center px-4 gap-3"
              style={{
                height: 56,
                borderBottom: "1px solid rgba(62,213,152,0.15)",
                background: "rgba(13,31,26,0.92)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                position: "relative",
                zIndex: 15,
              }}
            >
              <button
                type="button"
                data-ocid="legacy.page.close_button"
                aria-label="Back to Vault"
                onClick={() => setShowLegacyPage(false)}
                className="flex items-center gap-1.5 transition-smooth"
                style={{
                  color: "#3ed598",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                }}
              >
                <ChevronRight className="w-4 h-4 rotate-180" strokeWidth={2} />
                <span className="text-sm font-body font-medium">Back</span>
              </button>
              <p
                className="font-display font-semibold text-base"
                style={{
                  color: "#ffffff",
                  letterSpacing: "-0.01em",
                }}
              >
                Legacy System
              </p>
            </div>

            {/* Legacy System Page content */}
            <LegacySystemPage
              nominees={nominees}
              onAddNominee={() => setActiveModal("nominee")}
              assets={assets}
              documents={documents}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {activeModal === "asset" && (
          <AddAssetModal
            key="add-asset-modal"
            initialCategory={selectedAssetCategory}
            onClose={() => setActiveModal(null)}
            onSave={handleSaveAsset}
          />
        )}
        {activeModal === "document" && (
          <AddDocumentModal
            key="add-document-modal"
            onClose={() => setActiveModal(null)}
            onSave={handleSaveDocument}
          />
        )}
        {activeModal === "nominee" && (
          <AddNomineeModal
            key="add-nominee-modal"
            onClose={() => setActiveModal(null)}
            onSave={handleSaveNominee}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
