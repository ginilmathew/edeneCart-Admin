import { memo } from "react";
import { cn } from "../../lib/utils";

type Variant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "primary"
  | "packed"
  | "muted";

const variantClasses: Record<Variant, string> = {
  default: "border border-border bg-surface-elevated text-text",
  success: "border border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300",
  warning: "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
  error: "border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300",
  info: "border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300",
  primary: "border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300",
  packed: "border-0 bg-violet-100 text-violet-900 dark:bg-violet-950/55 dark:text-violet-200",
  muted: "border border-border bg-surface-soft text-text-muted",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

function BadgeComponent({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium leading-none tracking-normal",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export const Badge = memo(BadgeComponent);
