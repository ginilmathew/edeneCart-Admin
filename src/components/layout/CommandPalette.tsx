import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import type { UserRole } from "../../types";

export interface CommandItem {
  to: string;
  label: string;
  roles: UserRole[];
  /** Extra strings to match (lowercased) */
  keywords?: string[];
}

const ITEMS: CommandItem[] = [
  { to: "/", label: "Dashboard", roles: ["staff"], keywords: ["home"] },
  { to: "/orders/create", label: "Create Order", roles: ["staff"], keywords: ["new order"] },
  { to: "/orders", label: "My Orders", roles: ["staff"] },
  { to: "/stock", label: "Product stock", roles: ["staff"], keywords: ["inventory"] },
  { to: "/recent-orders", label: "Recent orders", roles: ["staff"] },
  { to: "/profile", label: "Profile", roles: ["staff"] },
  { to: "/account/password", label: "Change password", roles: ["staff", "super_admin"], keywords: ["password", "account"] },
  { to: "/admin", label: "Dashboard", roles: ["super_admin"], keywords: ["admin home"] },
  { to: "/admin/orders", label: "Orders", roles: ["super_admin"], keywords: ["order management"] },
  { to: "/admin/salary", label: "Salary", roles: ["super_admin"], keywords: ["pay", "staff pay"] },
  { to: "/admin/profit", label: "Profit analytics", roles: ["super_admin"], keywords: ["profit", "analytics"] },
  { to: "/admin/staff", label: "Staff", roles: ["super_admin"], keywords: ["staff management"] },
  { to: "/admin/products", label: "Products", roles: ["super_admin"] },
  { to: "/admin/customers", label: "Customers", roles: ["super_admin"] },
  { to: "/admin/staff/assigned-numbers", label: "Assigned numbers", roles: ["super_admin"], keywords: ["numbers"] },
  { to: "/admin/categories", label: "Categories", roles: ["super_admin"] },
  { to: "/admin/delivery", label: "Delivery", roles: ["super_admin"] },
  { to: "/admin/senders", label: "Senders", roles: ["super_admin"] },
  { to: "/admin/staff/roles", label: "Staff roles", roles: ["super_admin"], keywords: ["roles"] },
  { to: "/admin/export", label: "Export Data", roles: ["super_admin"], keywords: ["export", "download"] },
  { to: "/admin/settings", label: "Settings", roles: ["super_admin"] },
];

function matches(item: CommandItem, role: UserRole, q: string): boolean {
  if (!item.roles.includes(role)) return false;
  if (!q.trim()) return true;
  const n = q.trim().toLowerCase();
  const hay = [item.label, item.to, ...(item.keywords ?? [])]
    .join(" ")
    .toLowerCase();
  return hay.includes(n);
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  role: UserRole;
}

function CommandPaletteComponent({ open, onClose, role }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    return ITEMS.filter((item) => matches(item, role, query));
  }, [role, query]);

  useEffect(() => {
    setActive(0);
  }, [query, open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      const t = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(t);
    }
  }, [open]);

  const go = useCallback(
    (to: string) => {
      navigate(to);
      onClose();
      setQuery("");
    },
    [navigate, onClose]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(i + 1, Math.max(0, filtered.length - 1)));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter" && filtered[active]) {
        e.preventDefault();
        go(filtered[active].to);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, filtered, active, go, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[min(20vh,8rem)] sm:pt-[min(15vh,10rem)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="command-palette-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm"
        aria-label="Close search"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-surface shadow-[var(--shadow-dropdown)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="command-palette-title" className="sr-only">
          Command palette
        </h2>
        <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
          <MagnifyingGlassIcon className="h-5 w-5 shrink-0 text-text-muted" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Search pages…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-w-0 flex-1 border-0 bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
          />
          <kbd className="hidden shrink-0 rounded-md border border-border bg-surface-alt px-1.5 py-0.5 font-mono text-[10px] text-text-muted sm:inline-block">
            esc
          </kbd>
        </div>
        <ul
          className="max-h-[min(50vh,20rem)] overflow-y-auto overscroll-contain py-1"
          role="listbox"
        >
          {filtered.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-text-muted">No matches</li>
          ) : (
            filtered.map((item, i) => (
              <li key={`${item.to}-${item.label}`} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  className={
                    "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors " +
                    (i === active
                      ? "bg-primary-muted text-primary"
                      : "text-text hover:bg-surface-alt")
                  }
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(item.to)}
                >
                  <span className="min-w-0 flex-1 font-medium">{item.label}</span>
                  <span className="shrink-0 font-mono text-[11px] text-text-muted">{item.to}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export const CommandPalette = memo(CommandPaletteComponent);
