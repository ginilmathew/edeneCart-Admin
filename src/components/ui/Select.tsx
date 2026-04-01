import { memo, forwardRef, type SelectHTMLAttributes } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
  fullWidth?: boolean;
}

const SelectComponent = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, options, error, placeholder, fullWidth, className = "", id, ...rest },
    ref
  ) => {
    const selectId = id ?? `select-${Math.random().toString(36).slice(2, 9)}`;
    const shouldFullWidth = fullWidth ?? Boolean(label);
    return (
      <div className={shouldFullWidth ? "w-full" : "w-auto"}>
        {label && (
          <label
            htmlFor={selectId}
            className="mb-0.5 block text-xs font-medium text-text-heading md:mb-1 md:text-sm"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={[
            shouldFullWidth ? "h-9 w-full md:h-10" : "h-9 w-auto min-w-[8rem] md:h-10 md:min-w-[9rem]",
            "rounded-[var(--radius-md)] border border-border bg-surface px-2.5 text-xs text-text shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-0 md:px-3 md:text-sm",
            error ? "border-error" : "border-border",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={!!error}
          {...rest}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-xs text-error md:text-sm">{error}</p>
        )}
      </div>
    );
  }
);

SelectComponent.displayName = "Select";
export const Select = memo(SelectComponent);
