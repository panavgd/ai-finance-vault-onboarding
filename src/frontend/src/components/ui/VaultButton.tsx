import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  fullWidth,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-display font-semibold tracking-wide rounded-xl transition-smooth focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants: Record<string, string> = {
    primary:
      "bg-primary text-primary-foreground hover:opacity-90 shadow-elevated",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-muted border border-border",
    ghost: "bg-transparent text-foreground hover:bg-muted",
    outline:
      "bg-transparent border border-border text-foreground hover:bg-muted",
  };

  const sizes: Record<string, string> = {
    sm: "h-9 px-4 text-xs",
    md: "h-11 px-6 text-sm",
    lg: "h-14 px-8 text-base",
  };

  return (
    <button
      type="button"
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
