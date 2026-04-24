import { clsx, type ClassValue } from "clsx";

/**
 * Small local `cn` helper for shadcn-style component composition.
 * We intentionally keep it dependency-light to avoid changing runtime logic.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
