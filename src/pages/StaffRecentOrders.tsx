import { memo } from "react";
import { Link } from "react-router";
import { useAppSelector } from "../store/hooks";
import { selectOrders } from "../store/ordersSlice";
import { selectStaffMe, selectStaffMeLoading } from "../store/staffSlice";
import { selectProducts } from "../store/productsSlice";
import type { Order } from "../types";
import { Card, CardHeader, Button, Badge } from "../components/ui";
import { formatDate } from "../lib/orderUtils";

function StaffRecentOrdersPage() {
  const orders = useAppSelector(selectOrders);
  const staffProfile = useAppSelector(selectStaffMe);
  const meLoading = useAppSelector(selectStaffMeLoading);
  const products = useAppSelector(selectProducts);
  const staffId = staffProfile?.id ?? null;

  if (meLoading) {
    return <div className="text-text-muted">Loading…</div>;
  }

  if (!staffProfile || !staffId) {
    return (
      <div className="text-text-muted">
        Could not load your profile. Please contact admin.
      </div>
    );
  }

  const myOrders = orders.filter((o) => o.staffId === staffId);
  const groups = new Map<string, Order[]>();
  for (const o of myOrders) {
    if (!groups.has(o.orderId)) groups.set(o.orderId, []);
    groups.get(o.orderId)!.push(o);
  }
  const recentGroups = Array.from(groups.values())
    .slice(-5)
    .reverse();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Recent orders"
          subtitle="Your five most recent order groups (newest first)."
          action={
            <Link to="/orders">
              <Button variant="outline" size="sm">
                View all orders
              </Button>
            </Link>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted">
                <th className="pb-2 pr-4">Order ID</th>
                <th className="pb-2 pr-4">Date</th>
                <th className="pb-2 pr-4">Customer</th>
                <th className="pb-2 pr-4">Product</th>
                <th className="pb-2 pr-4">Type</th>
                <th className="pb-2">Tracking ID</th>
              </tr>
            </thead>
            <tbody>
              {recentGroups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted">
                    No orders yet.{" "}
                    <Link to="/orders/create" className="font-medium text-primary hover:underline">
                      Create one
                    </Link>
                  </td>
                </tr>
              ) : (
                recentGroups.map((items) => {
                  const o = items[0];
                  return (
                    <tr key={o.id} className="border-b border-border last:border-0">
                      <td className="py-2 pr-4">
                        <Link
                          to={`/orders/${o.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {o.orderId}
                        </Link>
                      </td>
                      <td className="py-2 pr-4">{formatDate(o.createdAt)}</td>
                      <td className="py-2 pr-4">{o.customerName}</td>
                      <td className="py-2 pr-4 italic">
                        {items.length > 1 ? (
                          <span className="font-bold text-primary">{items.length} items</span>
                        ) : (
                          products.find((p) => p.id === o.productId)?.name ?? o.productId
                        )}
                      </td>
                      <td className="py-2 pr-4">
                        <Badge variant="default">{o.orderType.toUpperCase()}</Badge>
                      </td>
                      <td className="py-2 font-mono text-xs">
                        {o.trackingId?.trim() ?? "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default memo(StaffRecentOrdersPage);
