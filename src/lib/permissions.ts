import type { User } from "../types";

/** Super admin bypass matches API PermissionsGuard. */
export function hasPermission(user: User | null, slug: string): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  return (user.permissions ?? []).includes(slug);
}

export function hasEveryPermission(user: User | null, slugs: string[]): boolean {
  if (!user || slugs.length === 0) return true;
  if (user.role === "super_admin") return true;
  const p = user.permissions ?? [];
  return slugs.every((s) => p.includes(s));
}
