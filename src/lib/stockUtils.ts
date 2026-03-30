/** True when catalog quantity should be highlighted (dashboards, create order checks). */
export function isAtOrBelowStockThreshold(
  stockQuantity: number,
  threshold: number
): boolean {
  const q = Number(stockQuantity) || 0;
  const t = Math.max(0, Number(threshold) || 0);
  return q <= t;
}

export function stockStatusLabel(
  stockQuantity: number,
  threshold: number
): "out" | "low" | null {
  const q = Number(stockQuantity) || 0;
  const t = Math.max(0, Number(threshold) || 0);
  if (q > t) return null;
  if (q === 0) return "out";
  return t > 0 ? "low" : "out";
}
