import { memo, useState, useCallback } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: "right" | "left" | "top" | "bottom";
  className?: string;
}

const sideClasses = {
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
};

function TooltipComponent({
  content,
  children,
  side = "right",
  className = "",
}: TooltipProps) {
  const [visible, setVisible] = useState(false);

  const show = useCallback(() => setVisible(true), []);
  const hide = useCallback(() => setVisible(false), []);

  return (
    <div
      className={"relative inline-flex " + className}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={
            "pointer-events-none absolute z-50 whitespace-nowrap rounded-[var(--radius-sm)] bg-sidebar-hover px-2 py-1.5 text-xs font-medium text-sidebar-text-active shadow-[var(--shadow-dropdown)] " +
            sideClasses[side]
          }
        >
          {content}
        </span>
      )}
    </div>
  );
}

export const Tooltip = memo(TooltipComponent);
