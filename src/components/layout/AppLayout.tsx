import { memo } from "react";
import { useLocation } from "react-router";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import type { User } from "../../types";

interface AppLayoutProps {
  user: User;
  onLogout: () => void;
  pageTitles?: Record<string, string>;
  children: React.ReactNode;
}

const DEFAULT_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/orders": "My Orders",
  "/orders/create": "Create Order",
  "/orders/:id": "Order Detail",
  "/admin": "Admin Dashboard",
  "/admin/staff": "Staff Management",
  "/admin/staff/:id": "Staff Profile",
  "/admin/orders": "Order Management",
  "/admin/products": "Product Management",
  "/admin/export": "Export Data",
};

function getTitle(pathname: string, pageTitles: Record<string, string>): string {
  const exact = pageTitles[pathname] ?? DEFAULT_TITLES[pathname];
  if (exact) return exact;
  if (pathname.startsWith("/admin/staff/")) return "Staff Profile";
  if (pathname.startsWith("/orders/") && pathname !== "/orders/create")
    return "Order Detail";
  return "Edenecart";
}

function AppLayoutComponent({
  user,
  onLogout,
  pageTitles = {},
  children,
}: AppLayoutProps) {
  const location = useLocation();
  const titles = { ...DEFAULT_TITLES, ...pageTitles };
  const title = getTitle(location.pathname, titles);
  const roleLabel = user.role === "super_admin" ? "Super Admin" : "Staff";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={user.role} onLogout={onLogout} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title={title}
          userDisplayName={user.name}
          userRole={roleLabel}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export const AppLayout = memo(AppLayoutComponent);
