import { memo, forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const TextareaComponent = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", id, ...rest }, ref) => {
    const textareaId = id ?? `textarea-${Math.random().toString(36).slice(2, 9)}`;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-0.5 block text-xs font-medium text-text-heading md:mb-1 md:text-sm"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "min-h-[88px] w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2.5 text-sm text-text shadow-[var(--shadow-card)] transition-all placeholder:text-text-muted focus:outline-none",
            error
              ? "border-error focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]"
              : "focus:border-primary focus:shadow-[var(--shadow-focus)]",
            className,
          )}
          aria-invalid={!!error}
          {...rest}
        />
        {error && (
          <p className="mt-1 text-xs text-error md:text-sm">{error}</p>
        )}
      </div>
    );
  }
);

TextareaComponent.displayName = "Textarea";
export const Textarea = memo(TextareaComponent);
