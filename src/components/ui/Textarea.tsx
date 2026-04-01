import { memo, forwardRef, type TextareaHTMLAttributes } from "react";

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
          className={[
            "min-h-[72px] w-full rounded-[var(--radius-md)] border border-border bg-surface px-2.5 py-2 text-xs text-text shadow-sm transition-colors placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-0 sm:min-h-[80px] md:px-3 md:py-2.5 md:text-sm",
            error ? "border-error" : "border-border",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
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
