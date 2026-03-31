import {
  memo,
  useState,
  useCallback,
  useRef,
  useLayoutEffect,
  useEffect,
} from "react";
import type { FocusEvent } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: "right" | "left" | "top" | "bottom";
  className?: string;
}

const TOOLTIP_Z = 9999;
const PAD = 8;

function tipPosition(
  side: NonNullable<TooltipProps["side"]>,
  r: DOMRect
): { top: number; left: number; transform: string } {
  switch (side) {
    case "right":
      return {
        top: r.top + r.height / 2,
        left: r.right + PAD,
        transform: "translateY(-50%)",
      };
    case "left":
      return {
        top: r.top + r.height / 2,
        left: r.left - PAD,
        transform: "translate(-100%, -50%)",
      };
    case "top":
      return {
        top: r.top - PAD,
        left: r.left + r.width / 2,
        transform: "translate(-50%, -100%)",
      };
    case "bottom":
      return {
        top: r.bottom + PAD,
        left: r.left + r.width / 2,
        transform: "translateX(-50%)",
      };
  }
}

function TooltipComponent({
  content,
  children,
  side = "right",
  className = "",
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, transform: "" });
  const triggerRef = useRef<HTMLDivElement>(null);

  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    setCoords(tipPosition(side, el.getBoundingClientRect()));
  }, [side]);

  const show = useCallback(() => {
    const el = triggerRef.current;
    if (el) {
      setCoords(tipPosition(side, el.getBoundingClientRect()));
    }
    setVisible(true);
  }, [side]);

  const hide = useCallback(() => setVisible(false), []);

  useLayoutEffect(() => {
    if (!visible) return;
    place();
    const onResize = () => place();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [visible, place]);

  /** Dismiss on any press, scroll, or Escape — avoids tips stuck after click/focus/navigation. */
  useEffect(() => {
    if (!visible) return;

    const onPointerDown = () => hide();

    const onScroll = () => hide();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") hide();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("scroll", onScroll, true);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [visible, hide]);

  const onFocusTrigger = useCallback(
    (e: FocusEvent<HTMLDivElement>) => {
      const t = e.target;
      if (t instanceof HTMLElement && t.matches(":focus-visible")) show();
    },
    [show],
  );

  const trimmed = className.trim();
  const tooltipNode =
    visible && typeof document !== "undefined" ? (
      createPortal(
        <span
          role="tooltip"
          style={{
            position: "fixed",
            top: coords.top,
            left: coords.left,
            transform: coords.transform,
            zIndex: TOOLTIP_Z,
          }}
          className="pointer-events-none whitespace-nowrap rounded-[var(--radius-sm)] bg-sidebar-hover px-2 py-1.5 text-xs font-medium text-sidebar-text-active shadow-[var(--shadow-dropdown)]"
        >
          {content}
        </span>,
        document.body
      )
    ) : null;

  return (
    <>
      <div
        ref={triggerRef}
        className={"relative " + (trimmed ? trimmed : "inline-flex")}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={onFocusTrigger}
        onBlur={hide}
      >
        {children}
      </div>
      {tooltipNode}
    </>
  );
}

export const Tooltip = memo(TooltipComponent);
