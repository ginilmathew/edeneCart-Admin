import { memo } from "react";

interface HeaderProps {
  title: string;
  userDisplayName: string;
  userRole: string;
}

function HeaderComponent({ title, userDisplayName, userRole }: HeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4 md:px-6">
      <h1 className="text-lg font-semibold text-text-heading md:text-xl">
        {title}
      </h1>
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-text-heading">{userDisplayName}</p>
          <p className="text-xs text-text-muted">{userRole}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-muted text-sm font-medium text-primary">
          {userDisplayName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}

export const Header = memo(HeaderComponent);
