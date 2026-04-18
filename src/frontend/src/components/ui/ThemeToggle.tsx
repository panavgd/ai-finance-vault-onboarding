import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";

export function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  const [nudge, setNudge] = useState(false);
  const hasInteractedRef = useRef(false);
  const nudgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-nudge after 3s if user hasn't interacted — fires once on mount
  useEffect(() => {
    nudgeTimerRef.current = setTimeout(() => {
      if (!hasInteractedRef.current) {
        setNudge(true);
        setTimeout(() => setNudge(false), 500);
      }
    }, 3000);
    return () => {
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    };
  }, []);

  const handleToggle = () => {
    hasInteractedRef.current = true;
    if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    toggle();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-3">
        {/* Light label */}
        <span
          style={{
            fontSize: "11px",
            fontFamily: "var(--font-body)",
            color: !isDark ? "var(--accent)" : "var(--text-muted)",
            fontWeight: !isDark ? 600 : 400,
            transition: "color 0.3s ease",
            letterSpacing: "0.02em",
            userSelect: "none",
          }}
        >
          Light
        </span>

        {/* Toggle track */}
        <button
          type="button"
          role="switch"
          aria-checked={isDark}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          data-ocid="theme-toggle"
          onClick={handleToggle}
          style={{
            position: "relative",
            width: "52px",
            height: "28px",
            borderRadius: "14px",
            border: "none",
            cursor: "pointer",
            padding: 0,
            outline: "none",
            background: isDark ? "#1DBA7A" : "rgba(0,0,0,0.12)",
            transition: "background 0.3s ease",
            flexShrink: 0,
            animation: nudge
              ? "toggleNudge 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
              : "none",
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = isDark
              ? "0 0 0 3px rgba(29,186,122,0.3)"
              : "0 0 0 3px rgba(0,0,0,0.15)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {/* Thumb */}
          <span
            style={{
              position: "absolute",
              top: "3px",
              left: isDark ? "27px" : "3px",
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: "#FFFFFF",
              boxShadow:
                "0 1px 4px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15)",
              transition: "left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        </button>

        {/* Dark label */}
        <span
          style={{
            fontSize: "11px",
            fontFamily: "var(--font-body)",
            color: isDark ? "#1DBA7A" : "var(--text-muted)",
            fontWeight: isDark ? 600 : 400,
            transition: "color 0.3s ease",
            letterSpacing: "0.02em",
            userSelect: "none",
          }}
        >
          Dark
        </span>
      </div>

      <style>{`
        @keyframes toggleNudge {
          0%   { transform: scale(1); }
          25%  { transform: scale(1.08) rotate(-2deg); }
          50%  { transform: scale(1.1) rotate(2deg); }
          75%  { transform: scale(1.05) rotate(-1deg); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
