import { memo } from "react";

type PageLoaderProps = {
  /** Minimum height of the fallback region (e.g. main content area). */
  minHeight?: string;
  className?: string;
  /** Screen reader label */
  label?: string;
};

/**
 * Full-width centered loader for route transitions and lazy chunks.
 * Styling uses theme tokens via `.loader` in `index.css`.
 */
function PageLoaderComponent({
  minHeight = "min-h-[40vh]",
  className = "",
  label = "Loading page",
}: PageLoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${minHeight} ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="loader shrink-0" aria-hidden />
      <span className="text-sm text-text-muted">{label}</span>
    </div>
  );
}

export const PageLoader = memo(PageLoaderComponent);
