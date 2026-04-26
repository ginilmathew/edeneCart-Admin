import { memo, type ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "border border-primary bg-primary text-text-inverse shadow-[var(--shadow-card)] hover:border-primary-hover hover:bg-primary-hover focus:outline-none focus-visible:shadow-[var(--shadow-focus)] disabled:opacity-60",
  secondary:
    "border border-border bg-surface-elevated text-text shadow-[var(--shadow-card)] hover:bg-surface-soft focus:outline-none focus-visible:shadow-[var(--shadow-focus)] disabled:opacity-60",
  outline:
    "border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 focus:outline-none focus-visible:shadow-[var(--shadow-focus)] disabled:opacity-60",
  ghost:
    "border border-transparent text-text hover:bg-surface-soft focus:outline-none focus-visible:shadow-[var(--shadow-focus)] disabled:opacity-60",
  danger:
    "border border-error bg-error text-text-inverse shadow-[var(--shadow-card)] hover:brightness-110 focus:outline-none focus-visible:shadow-[var(--shadow-focus)] disabled:opacity-60",
};

const sizeClasses: Record<Size, string> = {
  sm: "min-h-9 px-3 py-1.5 text-xs rounded-[var(--radius-sm)] md:min-h-10 md:px-3.5 md:text-sm",
  md: "min-h-10 px-4 py-2 text-xs rounded-[var(--radius-md)] md:min-h-11 md:px-4.5 md:text-sm",
  lg: "min-h-11 px-5 py-2.5 text-sm rounded-[var(--radius-lg)] md:min-h-12 md:px-6 md:py-3 md:text-base",
};

function ButtonComponent({
  variant = "primary",
  size = "md",
  fullWidth,
  loading,
  icon,
  disabled,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(
        "inline-flex touch-manipulation items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-150 ease-out active:scale-[0.98] disabled:pointer-events-none focus-visible:outline-none",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? "w-full" : "",
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}

export const Button = memo(ButtonComponent);
