import { memo, useState, useCallback } from "react";
import { NavLink } from "react-router";
import {
  HomeIcon,
  DocumentPlusIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  CubeIcon,
  Squares2X2Icon,
  ArrowDownTrayIcon,
  ArrowLeftOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Tooltip } from "../ui";
import type { UserRole } from "../../types";

const SIDEBAR_COLLAPSED_KEY = "edenecart_sidebar_collapsed";

interface NavItem {
  to: string;
  label: string;
  roles: UserRole[];
  end?: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

const STAFF_NAV: NavItem[] = [
  { to: "/", label: "Dashboard", roles: ["staff"], end: true, icon: HomeIcon },
  { to: "/orders/create", label: "Create Order", roles: ["staff"], icon: DocumentPlusIcon },
  { to: "/orders", label: "My Orders", roles: ["staff"], icon: ClipboardDocumentListIcon },
];

const ADMIN_NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", roles: ["super_admin"], end: true, icon: HomeIcon },
  { to: "/admin/staff", label: "Staff", roles: ["super_admin"], icon: UsersIcon },
  { to: "/admin/orders", label: "Orders", roles: ["super_admin"], icon: CubeIcon },
  { to: "/admin/products", label: "Products", roles: ["super_admin"], icon: Squares2X2Icon },
  { to: "/admin/export", label: "Export Data", roles: ["super_admin"], icon: ArrowDownTrayIcon },
];

function getStoredCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
  } catch {
    return false;
  }
}

function setStoredCollapsed(value: boolean) {
  try {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, value ? "true" : "false");
  } catch {}
}

interface SidebarProps {
  role: UserRole;
  onLogout: () => void;
}

function SidebarComponent({ role, onLogout }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(getStoredCollapsed);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      setStoredCollapsed(next);
      return next;
    });
  }, []);

  const items = role === "super_admin" ? ADMIN_NAV : STAFF_NAV;
  const filtered = items.filter((i) => i.roles.includes(role));

  const linkBase =
    "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors ";
  const linkActive = "bg-sidebar-hover text-sidebar-text-active";
  const linkInactive = "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active";

  const renderNavLink = (item: NavItem) => {
    const content = (
      <NavLink
        to={item.to}
        end={item.end}
        className={({ isActive }: { isActive: boolean }) =>
          linkBase + (isActive ? linkActive : linkInactive) + (collapsed ? " w-full justify-center px-2" : "")
        }
      >
        <item.icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip key={item.to} content={item.label} side="right" className="w-full">
          {content}
        </Tooltip>
      );
    }
    return <div key={item.to}>{content}</div>;
  };

  return (
    <aside
      className={
        "flex h-full flex-col bg-sidebar-bg text-sidebar-text transition-[width] duration-200 " +
        (collapsed ? "w-[4.5rem]" : "w-64 md:w-56 lg:w-64")
      }
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-sidebar-hover px-2">
        {collapsed ? (
          <div className="flex w-10 items-center justify-center">
            <span className="text-lg font-bold text-sidebar-text-active">E</span>
          </div>
        ) : (
          <span className="truncate px-2 font-semibold text-sidebar-text-active">
            Edenecart Admin
          </span>
        )}
        <button
          type="button"
          onClick={toggleCollapsed}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active focus:outline-none focus:ring-2 focus:ring-sidebar-text-active/50"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRightIcon className="h-5 w-5" />
          ) : (
            <ChevronLeftIcon className="h-5 w-5" />
          )}
        </button>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {filtered.map(renderNavLink)}
      </nav>
      <div className="border-t border-sidebar-hover p-2">
        {collapsed ? (
          <Tooltip content="Logout" side="right">
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center justify-center rounded-[var(--radius-md)] p-2 text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active"
              aria-label="Logout"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            </button>
          </Tooltip>
        ) : (
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-left text-sm text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5 shrink-0" />
            Logout
          </button>
        )}
      </div>
    </aside>
  );
}

export const Sidebar = memo(SidebarComponent);
