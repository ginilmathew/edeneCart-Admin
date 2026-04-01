import { memo, useState, useCallback } from "react";
import { NavLink } from "react-router";
import {
  HomeIcon,
  DocumentPlusIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  CubeIcon,
  Squares2X2Icon,
  TagIcon,
  ArrowDownTrayIcon,
  ArrowLeftOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  KeyIcon,
  UserCircleIcon,
  UserGroupIcon,
  HashtagIcon,
  BriefcaseIcon,
  TruckIcon,
  Cog6ToothIcon,
  CurrencyRupeeIcon,
  PaperAirplaneIcon,
  ArchiveBoxIcon,
  ClockIcon,
  PresentationChartLineIcon,
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
  { to: "/orders/create", label: "Create Order", roles: ["staff"], end: true, icon: DocumentPlusIcon },
  { to: "/orders", label: "My Orders", roles: ["staff"], end: true, icon: ClipboardDocumentListIcon },
  { to: "/stock", label: "Product stock", roles: ["staff"], end: true, icon: ArchiveBoxIcon },
  { to: "/recent-orders", label: "Recent orders", roles: ["staff"], end: true, icon: ClockIcon },
  { to: "/profile", label: "Profile", roles: ["staff"], end: true, icon: UserCircleIcon },
  { to: "/account/password", label: "Change password", roles: ["staff"], end: true, icon: KeyIcon },
];

const ADMIN_NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", roles: ["super_admin"], end: true, icon: HomeIcon },
  { to: "/admin/orders", label: "Orders", roles: ["super_admin"], end: true, icon: CubeIcon },
  { to: "/admin/salary", label: "Salary", roles: ["super_admin"], end: true, icon: CurrencyRupeeIcon },
  { to: "/admin/profit", label: "Profit", roles: ["super_admin"], end: true, icon: PresentationChartLineIcon },
  { to: "/admin/staff", label: "Staff", roles: ["super_admin"], end: true, icon: UsersIcon },
  { to: "/admin/products", label: "Products", roles: ["super_admin"], end: true, icon: Squares2X2Icon },
  { to: "/admin/customers", label: "Customers", roles: ["super_admin"], end: true, icon: UserGroupIcon },
  { to: "/admin/staff/assigned-numbers", label: "Assigned numbers", roles: ["super_admin"], end: true, icon: HashtagIcon },
  { to: "/admin/categories", label: "Categories", roles: ["super_admin"], end: true, icon: TagIcon },
  { to: "/admin/delivery", label: "Delivery", roles: ["super_admin"], end: true, icon: PaperAirplaneIcon },
  { to: "/admin/senders", label: "Senders", roles: ["super_admin"], end: true, icon: TruckIcon },
  { to: "/admin/staff/roles", label: "Staff roles", roles: ["super_admin"], end: true, icon: BriefcaseIcon },
  { to: "/account/password", label: "Change password", roles: ["super_admin"], end: true, icon: KeyIcon },
  { to: "/admin/export", label: "Export Data", roles: ["super_admin"], end: true, icon: ArrowDownTrayIcon },
  { to: "/admin/settings", label: "Settings", roles: ["super_admin"], end: true, icon: Cog6ToothIcon },

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
  } catch {
    /* storage unavailable */
  }
}

interface SidebarProps {
  role: UserRole;
  onLogout: () => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

function SidebarComponent({ role, onLogout, mobileOpen, setMobileOpen }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(getStoredCollapsed);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      setStoredCollapsed(next);
      return next;
    });
  }, []);

  const handleMobileNavClick = () => {
    if (setMobileOpen) setMobileOpen(false);
  };

  const items = role === "super_admin" ? ADMIN_NAV : STAFF_NAV;
  const filtered = items.filter((i) => i.roles.includes(role));

  const linkBase =
    "flex min-h-10 items-center gap-2 rounded-[var(--radius-md)] border-l-2 border-transparent py-1.5 pl-2 pr-2.5 text-xs font-medium transition-colors max-md:gap-2.5 md:min-h-0 md:gap-3 md:py-2 md:pl-2.5 md:pr-3 md:text-sm ";
  const linkActive =
    "border-l-sidebar-accent bg-white/[0.08] text-sidebar-text-active md:bg-white/[0.06]";
  const linkInactive =
    "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active";



  return (
    <aside
      className={
        "flex h-full flex-col bg-sidebar-bg text-sidebar-text transition-[transform,width] duration-300 ease-out z-50 " +
        "max-md:shadow-[4px_0_24px_rgba(15,23,42,0.12)] " +
        "fixed inset-y-0 left-0 transform md:relative md:translate-x-0 md:shadow-none " +
        (mobileOpen ? "translate-x-0 " : "-translate-x-full ") +
        (collapsed ? "w-[min(16rem,85vw)] md:w-[4.5rem] " : "w-[min(16rem,85vw)] md:w-56 lg:w-64 ")
      }
    >
      <div
        className={`flex h-14 shrink-0 items-center border-b border-sidebar-hover/80 px-2 pl-[max(0.5rem,env(safe-area-inset-left))] ${collapsed ? "md:justify-center justify-between" : "justify-between"}`}
      >
        <div className={`flex min-w-0 items-center gap-2 px-1 ${collapsed ? "md:hidden" : ""}`}>
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-sidebar-accent/20 text-xs font-bold text-sidebar-accent"
            aria-hidden
          >
            E
          </span>
          <span className="truncate text-sm font-semibold tracking-tight text-sidebar-text-active">
            Edenecart
          </span>
        </div>

        <Tooltip
          content={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          side="right"
          className="hidden md:flex"
        >
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
        </Tooltip>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {filtered.map((item) => {
          const link = (
            <NavLink
              to={item.to}
              end={item.end}
              onClick={handleMobileNavClick}
              className={({ isActive }: { isActive: boolean }) =>
                linkBase +
                " w-full " +
                (isActive ? linkActive : linkInactive) +
                (collapsed ? " md:justify-center md:px-2" : "")
              }
            >
              <item.icon className="h-4 w-4 shrink-0 md:h-5 md:w-5" aria-hidden />
              <span className={collapsed ? "block md:hidden" : "block"}>
                {item.label}
              </span>
            </NavLink>
          );
          return (
            <div key={item.to} className="w-full">
              {collapsed ? (
                <Tooltip content={item.label} side="right" className="flex w-full">
                  {link}
                </Tooltip>
              ) : (
                link
              )}
            </div>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-hover p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {collapsed ? (
          <Tooltip content="Logout" side="right" className="flex w-full">
            <button
              type="button"
              onClick={() => { handleMobileNavClick(); onLogout(); }}
              className="flex w-full items-center md:justify-center rounded-[var(--radius-md)] md:p-2 px-3 py-2 text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active"
              aria-label="Logout"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 shrink-0" />
              <span className="ml-2 block text-xs md:hidden md:ml-3 md:text-sm">
                Logout
              </span>
            </button>
          </Tooltip>
        ) : (
          <button
            type="button"
            onClick={() => { handleMobileNavClick(); onLogout(); }}
            className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-1.5 text-left text-xs text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active md:gap-3 md:px-3 md:py-2 md:text-sm"
          >
            <ArrowLeftOnRectangleIcon className="h-4 w-4 shrink-0 md:h-5 md:w-5" />
            Logout
          </button>
        )}
      </div>
    </aside>
  );
}

export const Sidebar = memo(SidebarComponent);

