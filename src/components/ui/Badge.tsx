import { memo } from "react";

type Variant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "packed"
  | "muted";

const variantClasses: Record<Variant, string> = {
  default: "bg-surface border border-border text-text",
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  error: "bg-error-bg text-error",
  info: "bg-info-bg text-info",
  packed: "bg-violet-100 text-violet-900 border border-violet-200",
  muted: "bg-slate-200 text-slate-800 border border-slate-300",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

function BadgeComponent({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[10px] font-medium md:px-2 md:text-xs",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export const Badge = memo(BadgeComponent);
