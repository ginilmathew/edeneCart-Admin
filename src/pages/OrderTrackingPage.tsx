import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getApiBaseUrl } from "../api/api-base-url";
import { formatDateLong } from "../lib/orderUtils";

type OrderStatus =
  | "scheduled"
  | "pending"
  | "packed"
  | "dispatch"
  | "delivered"
  | "cancelled"
  | "returned";

interface TrackingItem {
  productName: string;
  quantity: number;
  sellingAmount: number;
  deliveryFee: number;
}

interface TrackingData {
  orderId: string;
  customerName: string;
  phone: string;
  email: string;
  deliveryAddress: string;
  postOffice: string;
  district: string;
  state: string;
  pincode: string;
  orderType: string;
  status: OrderStatus;
  trackingId: string | null;
  items: TrackingItem[];
  grandTotal: number;
  createdAt: string;
  statusSteps: string[];
  currentStep: number;
  scheduledFor?: string | null;
}

const STATUS_META: Record<string, { label: string; icon: string; color: string }> = {
  scheduled: { label: "Scheduled",      icon: "📅", color: "#8b5cf6" },
  pending:   { label: "Order Placed",   icon: "📋", color: "#6366f1" },
  packed:    { label: "Packed",         icon: "📦", color: "#f59e0b" },
  dispatch:  { label: "Dispatched",     icon: "🚚", color: "#3b82f6" },
  delivered: { label: "Delivered",      icon: "✅", color: "#10b981" },
  cancelled: { label: "Cancelled",      icon: "✕",  color: "#ef4444" },
  returned:  { label: "Returned",       icon: "↩",  color: "#8b5cf6" },
};

export default function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    const base = getApiBaseUrl();
    fetch(`${base}/v1/api/orders/track/${encodeURIComponent(orderId)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Order not found");
        return r.json() as Promise<TrackingData>;
      })
      .then(setData)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Failed to load order"),
      )
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div style={styles.centeredPage}>
        <div style={styles.spinner} />
        <p style={{ color: "#a1a1aa", marginTop: 16 }}>Loading order details…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={styles.centeredPage}>
        <div style={styles.errorBox}>
          <span style={{ fontSize: 40 }}>😕</span>
          <h2 style={{ margin: "12px 0 8px", color: "#ef4444" }}>Order Not Found</h2>
          <p style={{ color: "#71717a" }}>{error ?? "This order could not be found."}</p>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_META[data.status] ?? STATUS_META.pending;
  const isCancelledOrReturned = data.status === "cancelled" || data.status === "returned";
  const timelineSteps = data.statusSteps;

  return (
    <div style={styles.page}>
      {/* ── Header ── */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.brand}>
            Edene<span style={{ color: "#60a5fa" }}>Cart</span>
          </div>
          <div style={styles.orderBadge}>Order Tracking</div>
        </div>
      </header>

      <main style={styles.main}>

        {/* ── Order ID + Status hero ── */}
        <div style={styles.heroCard}>
          <div style={styles.heroLeft}>
            <p style={styles.labelSm}>ORDER ID</p>
            <h1 style={styles.orderId}>{data.orderId}</h1>
            <p style={{ color: "#a1a1aa", fontSize: 13, marginTop: 4 }}>
              Placed on {formatDateLong(data.createdAt)}
            </p>
            {data.scheduledFor ? (
              <p style={{ color: "#a78bfa", fontSize: 13, marginTop: 8, fontWeight: 600 }}>
                Scheduled for: {data.scheduledFor}
              </p>
            ) : null}
          </div>
          <div style={{ ...styles.statusPill, background: statusInfo.color + "22", border: `1px solid ${statusInfo.color}55` }}>
            <span style={{ fontSize: 20 }}>{statusInfo.icon}</span>
            <span style={{ color: statusInfo.color, fontWeight: 700, fontSize: 15 }}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* ── Status timeline ── */}
        {!isCancelledOrReturned && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Shipment Progress</h2>
            <div style={styles.timeline}>
              {timelineSteps.map((step, idx) => {
                const meta = STATUS_META[step] ?? STATUS_META.pending;
                const done = idx <= data.currentStep;
                const active = idx === data.currentStep;
                return (
                  <div key={step} style={styles.timelineStep}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{
                        ...styles.timelineDot,
                        background: done ? (active ? meta.color : "#10b981") : "#27272a",
                        boxShadow: active ? `0 0 0 4px ${meta.color}33` : "none",
                        transform: active ? "scale(1.2)" : "scale(1)",
                      }}>
                        {done ? <span style={{ fontSize: 14 }}>{meta.icon}</span> : <span style={{ color: "#52525b", fontSize: 12 }}>○</span>}
                      </div>
                      {idx < timelineSteps.length - 1 && (
                        <div style={{ ...styles.timelineLine, background: idx < data.currentStep ? "#10b981" : "#27272a" }} />
                      )}
                    </div>
                    <div style={styles.timelineLabel}>
                      <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: done ? "#f4f4f5" : "#71717a" }}>
                        {meta.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {data.trackingId && (
              <div style={styles.trackingBadge}>
                <span style={{ color: "#a1a1aa", fontSize: 12 }}>Tracking ID</span>
                <span style={{ color: "#60a5fa", fontWeight: 600, fontSize: 14 }}>{data.trackingId}</span>
              </div>
            )}
          </div>
        )}

        {isCancelledOrReturned && (
          <div style={{ ...styles.card, borderColor: statusInfo.color + "44", background: statusInfo.color + "11" }}>
            <p style={{ color: statusInfo.color, fontWeight: 600, fontSize: 15 }}>
              {statusInfo.icon} This order has been {data.status}.
            </p>
          </div>
        )}

        <div style={styles.twoCol}>
          {/* ── Items ── */}
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Items Ordered</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, textAlign: "left" }}>Product</th>
                  <th style={styles.th}>Qty</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, i) => (
                  <tr key={i} style={i % 2 === 0 ? {} : { background: "#18181b" }}>
                    <td style={styles.td}>{item.productName}</td>
                    <td style={{ ...styles.td, textAlign: "center", color: "#a1a1aa" }}>{item.quantity}</td>
                    <td style={{ ...styles.td, textAlign: "right", fontWeight: 500 }}>
                      ₹{(item.sellingAmount + item.deliveryFee).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={styles.totalRow}>
              <span style={{ color: "#a1a1aa" }}>Grand Total</span>
              <span style={styles.totalAmount}>₹{data.grandTotal.toFixed(2)}</span>
            </div>
            <div style={styles.paymentBadge}>
              <span>Payment: </span>
              <span style={{
                color: data.orderType === "cod" ? "#f59e0b" : "#10b981",
                fontWeight: 600,
                textTransform: "uppercase",
              }}>
                {data.orderType}
              </span>
            </div>
          </div>

          {/* ── Delivery Info ── */}
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Delivery Details</h2>
            <div style={styles.infoGrid}>
              <InfoRow label="Customer" value={data.customerName} />
              <InfoRow label="Phone" value={data.phone} />
              <InfoRow label="Email" value={data.email} />
              <InfoRow label="Address" value={data.deliveryAddress} />
              <InfoRow label="Post Office" value={data.postOffice} />
              <InfoRow label="District" value={data.district} />
              <InfoRow label="State" value={data.state} />
              <InfoRow label="Pincode" value={data.pincode} />
            </div>
          </div>
        </div>

      </main>

      <footer style={styles.footer}>
        <p>© {new Date().getFullYear()} Edene Cart · All rights reserved</p>
      </footer>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <span style={styles.infoValue}>{value}</span>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #09090b 0%, #0f0f14 100%)",
    color: "#f4f4f5",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  header: {
    background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    padding: "0 24px",
  },
  headerInner: {
    maxWidth: 900,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 64,
  },
  brand: {
    fontSize: 22,
    fontWeight: 800,
    color: "#fff",
    letterSpacing: "-0.5px",
  },
  orderBadge: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: "4px 14px",
    fontSize: 12,
    color: "#a5f3fc",
    letterSpacing: "1px",
    textTransform: "uppercase",
  },
  main: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "32px 16px 48px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  heroCard: {
    background: "linear-gradient(135deg, #1e1e2e 0%, #1a1a2e 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: "28px 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
  },
  heroLeft: {},
  labelSm: {
    fontSize: 11,
    color: "#71717a",
    letterSpacing: "1px",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  orderId: {
    fontSize: 28,
    fontWeight: 800,
    color: "#f4f4f5",
    letterSpacing: "-1px",
    margin: 0,
  },
  statusPill: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 20px",
    borderRadius: 12,
    flexShrink: 0,
  },
  card: {
    background: "#111113",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: "24px",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#71717a",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    marginBottom: 20,
    margin: "0 0 20px",
  },
  timeline: {
    display: "flex",
    gap: 0,
    alignItems: "flex-start",
  },
  timelineStep: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  timelineDot: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    height: 24,
    marginTop: 0,
  },
  timelineLabel: {
    textAlign: "center",
    padding: "0 4px",
  },
  trackingBadge: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    marginTop: 20,
    padding: "12px 16px",
    background: "#0f172a",
    border: "1px solid #1e3a5f",
    borderRadius: 8,
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14,
  },
  th: {
    padding: "8px 0",
    borderBottom: "2px solid #27272a",
    fontSize: 11,
    color: "#71717a",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    fontWeight: 600,
    textAlign: "center",
  },
  td: {
    padding: "12px 0",
    borderBottom: "1px solid #1f1f22",
    fontSize: 14,
    verticalAlign: "middle",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTop: "1px solid #27272a",
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: 800,
    color: "#10b981",
  },
  paymentBadge: {
    marginTop: 12,
    fontSize: 13,
    color: "#a1a1aa",
  },
  infoGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  infoRow: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    paddingBottom: 12,
    borderBottom: "1px solid #1f1f22",
  },
  infoLabel: {
    fontSize: 11,
    color: "#71717a",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },
  infoValue: {
    fontSize: 14,
    color: "#f4f4f5",
    whiteSpace: "pre-wrap",
  },
  footer: {
    textAlign: "center",
    padding: "24px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    color: "#52525b",
    fontSize: 13,
  },
  centeredPage: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#09090b",
    color: "#f4f4f5",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid #27272a",
    borderTop: "3px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  errorBox: {
    textAlign: "center",
    padding: 32,
    background: "#111113",
    borderRadius: 16,
    border: "1px solid #27272a",
  },
};
