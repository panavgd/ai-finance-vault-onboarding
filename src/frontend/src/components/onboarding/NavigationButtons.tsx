import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

interface NavigationButtonsProps {
  onNext: () => void;
  onPrev?: () => void;
  nextLabel?: string;
  canNext?: boolean;
  showPrev?: boolean;
  isLast?: boolean;
}

export function NavigationButtons({
  onNext,
  onPrev,
  nextLabel = "Next step",
  canNext = true,
  showPrev = true,
  isLast = false,
}: NavigationButtonsProps) {
  const { isDark } = useTheme();

  return (
    <div
      className="flex items-center gap-3 px-6 pb-6 pt-2"
      data-ocid="nav-buttons"
    >
      {showPrev && onPrev && (
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center justify-center w-11 h-11 rounded-2xl"
          style={{
            border: "1px solid var(--card-border)",
            background: "var(--card-bg)",
            color: "var(--text-secondary)",
            transition: "all 0.15s ease",
          }}
          data-ocid="nav-prev"
          aria-label="Go back"
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.color = "var(--text-primary)";
            el.style.background = isDark
              ? "rgba(255,255,255,0.07)"
              : "rgba(0,0,0,0.04)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.color = "var(--text-secondary)";
            el.style.background = "var(--card-bg)";
          }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        data-ocid="nav-next"
        className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-full font-display font-medium text-sm ${
          canNext ? "cursor-pointer" : "cursor-not-allowed"
        }`}
        style={
          canNext
            ? {
                background: "var(--btn-primary-bg)",
                color: "var(--btn-primary-text)",
                boxShadow: "var(--shadow-cta)",
                transition:
                  "transform 0.15s ease, box-shadow 0.15s ease, background 0.3s ease",
              }
            : {
                background: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.06)",
                color: "var(--text-muted)",
                border: "1px solid var(--card-border)",
                transition: "none",
                opacity: 0.5,
              }
        }
        onMouseEnter={(e) => {
          if (!canNext) return;
          const el = e.currentTarget;
          el.style.transform = "translateY(-1px)";
          el.style.boxShadow = isDark
            ? "0 4px 16px rgba(29,186,122,0.35)"
            : "0 4px 12px rgba(0,0,0,0.2)";
        }}
        onMouseLeave={(e) => {
          if (!canNext) return;
          const el = e.currentTarget;
          el.style.transform = "translateY(0px)";
          el.style.boxShadow = "var(--shadow-cta)";
        }}
        onMouseDown={(e) => {
          if (!canNext) return;
          const el = e.currentTarget;
          el.style.transform = "translateY(0px)";
        }}
        onMouseUp={(e) => {
          if (!canNext) return;
          const el = e.currentTarget;
          el.style.transform = "translateY(-1px)";
        }}
      >
        {nextLabel}
        {!isLast && <ChevronRight className="w-4 h-4" />}
      </button>
    </div>
  );
}
