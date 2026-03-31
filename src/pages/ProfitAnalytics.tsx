import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import type { TooltipItem } from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { api } from "../api/client";
import { endpoints } from "../api/endpoints";
import { Card, CardHeader, Button, Select } from "../components/ui";
import type { SelectOption } from "../components/ui/Select";
import { getWeekRange, formatCurrency } from "../lib/orderUtils";
import { toast } from "../lib/toast";
import type { ProfitAnalyticsResponse, ProfitGranularity } from "../types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
);

type DatePreset = "today" | "week" | "month" | "year" | "custom";

function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function rangeForPreset(preset: Exclude<DatePreset, "custom">): {
  from: string;
  to: string;
} {
  const now = new Date();
  if (preset === "today") {
    const t = new Date(now);
    t.setHours(0, 0, 0, 0);
    const s = formatYMD(t);
    return { from: s, to: s };
  }
  if (preset === "week") {
    const { start, end } = getWeekRange(now);
    return { from: formatYMD(start), to: formatYMD(end) };
  }
  if (preset === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: formatYMD(start), to: formatYMD(end) };
  }
  const y = now.getFullYear();
  return { from: `${y}-01-01`, to: `${y}-12-31` };
}

function defaultGranularity(preset: DatePreset): ProfitGranularity {
  if (preset === "year") return "month";
  if (preset === "month") return "week";
  return "day";
}

const GRANULARITY_OPTIONS: SelectOption[] = [
  { value: "day", label: "Bucket: Day" },
  { value: "week", label: "Bucket: Week" },
  { value: "month", label: "Bucket: Month" },
  { value: "year", label: "Bucket: Year" },
];

function ProfitAnalyticsPage() {
  const [preset, setPreset] = useState<DatePreset>("month");
  const [dateFrom, setDateFrom] = useState(() => rangeForPreset("month").from);
  const [dateTo, setDateTo] = useState(() => rangeForPreset("month").to);
  const [granularity, setGranularity] = useState<ProfitGranularity>(() =>
    defaultGranularity("month"),
  );
  const [data, setData] = useState<ProfitAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const applyPreset = useCallback((p: Exclude<DatePreset, "custom">) => {
    const r = rangeForPreset(p);
    setDateFrom(r.from);
    setDateTo(r.to);
    setGranularity(defaultGranularity(p));
    setPreset(p);
  }, []);

  const load = useCallback(async () => {
    if (!dateFrom || !dateTo) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        dateFrom,
        dateTo,
        granularity,
      });
      const res = await api.get<ProfitAnalyticsResponse>(
        `${endpoints.ordersProfitAnalytics}?${params.toString()}`,
      );
      setData(res);
    } catch (e) {
      toast.fromError(e, "Failed to load profit analytics");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, granularity]);

  useEffect(() => {
    void load();
  }, [load]);

  const barData = useMemo(() => {
    if (!data?.series.length) return null;
    return {
      labels: data.series.map((s) => s.label),
      datasets: [
        {
          label: "Net (per bucket, excl. milestone bonuses)",
          data: data.series.map((s) => s.netBeforeBonus),
          backgroundColor: "rgba(13, 148, 136, 0.75)",
          borderColor: "rgb(13, 148, 136)",
          borderWidth: 1,
        },
        {
          label: "Revenue",
          data: data.series.map((s) => s.revenue),
          backgroundColor: "rgba(148, 163, 184, 0.5)",
          borderColor: "rgb(148, 163, 184)",
          borderWidth: 1,
        },
      ],
    };
  }, [data]);

  const doughnutData = useMemo(() => {
    if (!data) return null;
    const d = data.delivered;
    const parts = [
      { label: "Cost of goods", value: d.costOfGoods, color: "#64748b" },
      { label: "Staff (per qty × payout)", value: d.staffVariable, color: "#6366f1" },
      { label: "Courier / delivery", value: d.deliveryFees, color: "#d97706" },
      {
        label: "Staff milestone bonuses",
        value: d.staffMilestoneBonuses,
        color: "#db2777",
      },
      { label: "Net profit", value: Math.max(0, d.netProfit), color: "#059669" },
    ].filter((x) => x.value > 0);
    if (parts.length === 0) return null;
    return {
      labels: parts.map((p) => p.label),
      datasets: [
        {
          data: parts.map((p) => p.value),
          backgroundColor: parts.map((p) => p.color),
          borderWidth: 0,
        },
      ],
    };
  }, [data]);

  const barOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" as const },
        tooltip: {
          callbacks: {
            label(context: TooltipItem<"bar">) {
              const y = context.parsed.y;
              const v = y == null ? 0 : y;
              return `${context.dataset.label ?? ""}: ${formatCurrency(v)}`;
            },
          },
        },
      },
      scales: {
        x: { stacked: false, grid: { display: false } },
        y: {
          stacked: false,
          ticks: {
            callback: (v: string | number) =>
              `₹${Number(v).toLocaleString("en-IN")}`,
          },
        },
      },
    }),
    [],
  );

  const doughnutOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "right" as const },
        tooltip: {
          callbacks: {
            label(context: TooltipItem<"doughnut">) {
              const v =
                typeof context.parsed === "number"
                  ? context.parsed
                  : Number(context.parsed) || 0;
              const ds = context.dataset.data as number[];
              const total = ds.reduce((a, b) => a + b, 0);
              const pct = total > 0 ? ((v / total) * 100).toFixed(1) : "0";
              return `${context.label}: ${formatCurrency(v)} (${pct}%)`;
            },
          },
        },
      },
    }),
    [],
  );

  const d = data?.delivered;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Profit analytics"
          subtitle="Delivered orders only. Revenue is the line total after discounts. Net profit = revenue − buying cost − staff (qty × commission per order) − delivery − milestone bonuses."
        />
        <div className="flex flex-wrap items-end gap-3 border-b border-border-subtle pb-4">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["today", "Today"],
                ["week", "This week"],
                ["month", "This month"],
                ["year", "This year"],
              ] as const
            ).map(([key, label]) => (
              <Button
                key={key}
                type="button"
                variant={preset === key ? "primary" : "secondary"}
                size="sm"
                onClick={() => applyPreset(key)}
              >
                {label}
              </Button>
            ))}
            <Button
              type="button"
              variant={preset === "custom" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setPreset("custom")}
            >
              Custom range
            </Button>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">
                From
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setPreset("custom");
                  setDateFrom(e.target.value);
                }}
                className="rounded-[var(--radius-md)] border border-border-default bg-surface px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">
                To
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setPreset("custom");
                  setDateTo(e.target.value);
                }}
                className="rounded-[var(--radius-md)] border border-border-default bg-surface px-2 py-1.5 text-sm"
              />
            </div>
            <div className="min-w-[10rem]">
              <Select
                label="Chart buckets"
                options={GRANULARITY_OPTIONS}
                value={granularity}
                onChange={(e) =>
                  setGranularity(e.target.value as ProfitGranularity)
                }
              />
            </div>
            <Button type="button" onClick={() => void load()} loading={loading}>
              Refresh
            </Button>
          </div>
        </div>

        {loading && !data ? (
          <p className="py-8 text-center text-text-muted">Loading…</p>
        ) : d ? (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Kpi
                label="Net profit"
                value={d.netProfit}
                emphasize={d.netProfit >= 0 ? "positive" : "negative"}
              />
              <Kpi
                label="Gross profit"
                hint="Revenue − buying cost (before staff & courier)"
                value={d.grossProfit}
              />
              <Kpi
                label="Revenue (after discounts)"
                hint="What the customer pays on the line, incl. add-ons"
                value={d.revenue}
              />
              <Kpi
                label="Line discounts"
                hint="Already subtracted inside revenue"
                value={d.discountTotal}
              />
              <Kpi
                label="Sell total before discount"
                hint="Revenue + discounts on the line"
                value={d.preDiscountSellingTotal}
              />
              <Kpi label="Buying cost (COGS)" value={d.costOfGoods} />
              <Kpi label="Staff (qty × payout)" value={d.staffVariable} />
              <Kpi label="Delivery fees" value={d.deliveryFees} />
              <Kpi label="Milestone bonuses" value={d.staffMilestoneBonuses} />
            </div>
            <p className="mt-2 text-xs text-text-muted">
              Order of operations: line discount is applied when the order is saved, so
              revenue is already after discount. Gross profit = revenue − buying cost.
              Net profit = gross − staff (qty × payout per order) − delivery − milestone
              bonuses. Example (qty 1): ₹200 list, ₹10 discount → revenue ₹190; buying
              ₹100 → gross ₹90; staff ₹30 → ₹60 net before delivery/bonuses.
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Lines: {d.lineCount} · Units: {d.quantity} · Range: {data.dateFrom}{" "}
              → {data.dateTo}
            </p>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-text-heading">
                  Net vs revenue by period
                </h3>
                <div className="h-72 rounded-[var(--radius-md)] border border-border-subtle bg-surface-muted/30 p-2">
                  {barData ? (
                    <Bar data={barData} options={barOptions} />
                  ) : (
                    <p className="flex h-full items-center justify-center text-sm text-text-muted">
                      No delivered orders in this range.
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-text-heading">
                  Where revenue went (delivered)
                </h3>
                <div className="h-72 rounded-[var(--radius-md)] border border-border-subtle bg-surface-muted/30 p-2">
                  {doughnutData ? (
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                  ) : (
                    <p className="flex h-full items-center justify-center text-sm text-text-muted">
                      Nothing to chart yet.
                    </p>
                  )}
                </div>
                {d.netProfit < 0 ? (
                  <p className="mt-1 text-xs text-error">
                    Net loss {formatCurrency(d.netProfit)} — chart slices show
                    costs only; profit wedge is omitted when negative.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <SliceCard
                title="Cancelled"
                s={data.cancelled}
                variant="warning"
              />
              <SliceCard title="Returned" s={data.returned} variant="error" />
              <SliceCard
                title="In pipeline"
                subtitle="Pending / packed / dispatch"
                s={data.inPipeline}
                variant="muted"
              />
            </div>
          </>
        ) : (
          <p className="py-8 text-center text-text-muted">No data.</p>
        )}
      </Card>
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  emphasize,
}: {
  label: string;
  value: number;
  hint?: string;
  emphasize?: "positive" | "negative";
}) {
  const cls =
    emphasize === "positive"
      ? "text-success"
      : emphasize === "negative"
        ? "text-error"
        : "text-text-heading";
  return (
    <div className="rounded-[var(--radius-md)] border border-border-subtle bg-surface px-2 py-1.5 md:px-3 md:py-2">
      <div className="text-[10px] font-medium text-text-muted md:text-xs">{label}</div>
      {hint ? (
        <div className="mt-0.5 text-[9px] leading-tight text-text-muted/90 md:text-[10px]">
          {hint}
        </div>
      ) : null}
      <div
        className={`mt-0.5 font-mono text-base font-semibold tabular-nums md:text-lg ${cls}`}
      >
        {formatCurrency(value)}
      </div>
    </div>
  );
}

function SliceCard({
  title,
  subtitle,
  s,
  variant,
}: {
  title: string;
  subtitle?: string;
  s: { lineCount: number; quantity: number; sellingTotal: number };
  variant: "warning" | "error" | "muted";
}) {
  const border =
    variant === "error"
      ? "border-error/40"
      : variant === "warning"
        ? "border-amber-500/40"
        : "border-border-subtle";
  return (
    <div
      className={`rounded-[var(--radius-md)] border bg-surface px-2 py-1.5 md:px-3 md:py-2 ${border}`}
    >
      <div className="text-xs font-semibold text-text-heading md:text-sm">{title}</div>
      {subtitle ? (
        <div className="text-[10px] text-text-muted md:text-xs">{subtitle}</div>
      ) : null}
      <dl className="mt-1.5 space-y-0.5 text-xs md:mt-2 md:space-y-1 md:text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-text-muted">Lines</dt>
          <dd className="font-mono">{s.lineCount}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-text-muted">Quantity</dt>
          <dd className="font-mono">{s.quantity}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-text-muted">Selling total</dt>
          <dd className="font-mono">{formatCurrency(s.sellingTotal)}</dd>
        </div>
      </dl>
    </div>
  );
}

export default memo(ProfitAnalyticsPage);
