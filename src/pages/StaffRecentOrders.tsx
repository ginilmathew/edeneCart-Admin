import { memo, useMemo } from "react";
import { Link } from "react-router";
import { useAppSelector } from "../store/hooks";
import { selectOrders } from "../store/ordersSlice";
import { selectStaffMe, selectStaffMeLoading } from "../store/staffSlice";
import { selectProducts } from "../store/productsSlice";
import type { Order } from "../types";
import { Card, CardHeader, Button, Badge, Table, type Column } from "../components/ui";
import { formatDate, orderLineProductLabel } from "../lib/orderUtils";

type RecentOrderGroupRow = { items: Order[] };

function StaffRecentOrdersPage() {
  const orders = useAppSelector(selectOrders);
  const staffProfile = useAppSelector(selectStaffMe);
  const meLoading = useAppSelector(selectStaffMeLoading);
  const products = useAppSelector(selectProducts);
  const staffId = staffProfile?.id ?? null;

  const rows: RecentOrderGroupRow[] = useMemo(() => {
    if (!staffId) return [];
    const myOrders = orders.filter((o) => o.staffId === staffId);
    const groups = new Map<string, Order[]>();
    for (const o of myOrders) {
      if (!groups.has(o.orderId)) groups.set(o.orderId, []);
      groups.get(o.orderId)!.push(o);
    }
    return Array.from(groups.values())
      .slice(-5)
      .reverse()
      .map((items) => ({ items }));
  }, [orders, staffId]);

  const columns: Column<RecentOrderGroupRow>[] = useMemo(
    () => [
      {
        key: "orderId",
        header: "Order ID",
        mobileCardTitle: true,
        render: (row) => {
          const o = row.items[0];
          return (
            <Link
              to={`/orders/${o.id}`}
              className="font-medium text-primary hover:underline"
            >
              {o.orderId}
            </Link>
          );
        },
      },
      {
        key: "createdAt",
        header: "Date",
        mobileLabel: "Date",
        render: (row) => formatDate(row.items[0].createdAt),
      },
      {
        key: "customerName",
        header: "Customer",
        mobileLabel: "Customer",
        render: (row) => row.items[0].customerName,
      },
      {
        key: "productId",
        header: "Product",
        mobileLabel: "Product",
        render: (row) => {
          const o = row.items[0];
          if (row.items.length > 1) {
            return (
              <span className="font-bold text-primary">{row.items.length} items</span>
            );
          }
          return (
            <span className="italic">{orderLineProductLabel(o, products)}</span>
          );
        },
      },
      {
        key: "orderType",
        header: "Type",
        mobileLabel: "Type",
        render: (row) => (
          <Badge variant="default">{row.items[0].orderType.toUpperCase()}</Badge>
        ),
      },
      {
        key: "trackingId",
        header: "Tracking ID",
        mobileLabel: "Tracking",
        className: "font-mono text-xs",
        render: (row) => row.items[0].trackingId?.trim() ?? "—",
      },
    ],
    [products],
  );

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Recent orders"
          subtitle="Your five most recent order groups (newest first)."
          action={
            <Link to="/orders" className="block w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                View all orders
              </Button>
            </Link>
          }
        />
        {rows.length === 0 ? (
          <div className="py-8 text-center text-sm text-text-muted">
            No orders yet.{" "}
            <Link
              to="/orders/create"
              className="font-medium text-primary hover:underline"
            >
              Create one
            </Link>
          </div>
        ) : (
          <Table
            columns={columns}
            data={rows}
            keyExtractor={(r) => r.items[0].id}
            emptyMessage="No orders yet."
          />
        )}
      </Card>
    </div>
  );
}

export default memo(StaffRecentOrdersPage);
