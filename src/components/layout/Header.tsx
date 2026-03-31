import { memo } from "react";
import { Bars3Icon, MoonIcon, SunIcon } from "@heroicons/react/24/outline";

interface HeaderProps {
  title: string;
  userDisplayName: string;
  userRole: string;
  onMenuClick?: () => void;
  themeMode: "light" | "dark";
  onToggleTheme: () => void;
}

function HeaderComponent({
  title,
  userDisplayName,
  userRole,
  onMenuClick,
  themeMode,
  onToggleTheme,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center justify-between border-b border-border bg-surface/95 px-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] shadow-[var(--shadow-header)] backdrop-blur-md supports-[backdrop-filter]:bg-surface/80 sm:h-14 sm:px-[max(1rem,env(safe-area-inset-left))] sm:pr-[max(1rem,env(safe-area-inset-right))] md:px-[max(1.5rem,env(safe-area-inset-left))] md:pr-[max(1.5rem,env(safe-area-inset-right))]">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="-ml-1 inline-flex min-h-9 min-w-9 items-center justify-center rounded-[var(--radius-md)] text-text-muted transition-colors hover:bg-surface-alt hover:text-text-heading focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:-ml-2 sm:min-h-10 sm:min-w-10 md:hidden"
            aria-label="Open menu"
          >
            <Bars3Icon className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" />
          </button>
        )}
        <h1 className="min-w-0 truncate text-sm font-semibold tracking-tight text-text-heading sm:text-base md:text-lg lg:text-xl">
          {title}
        </h1>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onToggleTheme}
          className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-border bg-surface-alt text-text-muted transition-colors hover:text-text-heading focus:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:h-9 sm:w-9"
          aria-label={themeMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={themeMode === "dark" ? "Light mode" : "Dark mode"}
        >
          {themeMode === "dark" ? (
            <SunIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          ) : (
            <MoonIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
        </button>
        <div className="hidden min-w-0 text-right sm:block">
          <p className="truncate text-sm font-medium text-text-heading">{userDisplayName}</p>
          <p className="text-xs text-text-muted">{userRole}</p>
        </div>
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-muted text-xs font-semibold text-primary ring-2 ring-surface sm:h-9 sm:w-9 sm:text-sm"
          aria-hidden
        >
          {userDisplayName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}

export const Header = memo(HeaderComponent);
