import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  Button,
  Table,
  ManagementFilterPanel,
  ManagementFilterField,
  MANAGEMENT_NATIVE_CONTROL_CLASS,
  ResponsiveManagementFilters,
} from "../components/ui";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectStaff, updateStaff, fetchStaff } from "../store/staffSlice";
import { api } from "../api/client";
import { endpoints } from "../api/endpoints";
import type { StaffEarnings } from "../types";
import { toast } from "../lib/toast";
import { formatCurrency } from "../lib/orderUtils";

function parseMilestones(text: string): { orders: number; bonus: number }[] {
  const out: { orders: number; bonus: number }[] = [];
  for (const raw of text.split(",")) {
    const part = raw.trim();
    if (!part) continue;
    const [o, b] = part.split(":").map((x) => Number(x.trim()));
    if (!Number.isFinite(o) || !Number.isFinite(b) || o < 0 || b < 0) {
      throw new Error("Use milestone format like 5:50, 10:100, 15:150");
    }
    out.push({ orders: o, bonus: b });
  }
  return out.sort((a, b) => a.orders - b.orders);
}

function milestoneText(list: { orders: number; bonus: number }[]): string {
  return list
    .slice()
    .sort((a, b) => a.orders - b.orders)
    .map((x) => `${x.orders}:${x.bonus}`)
    .join(", ");
}

function SalaryManagementPage() {
  const dispatch = useAppDispatch();
  const staff = useAppSelector(selectStaff);
  const [rows, setRows] = useState<StaffEarnings[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [draftPayout, setDraftPayout] = useState<Record<string, string>>({});
  const [draftMilestones, setDraftMilestones] = useState<Record<string, string>>(
    {}
  );
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      const qs = params.toString();
      const path = qs ? `${endpoints.staffEarnings}?${qs}` : endpoints.staffEarnings;
      const data = await api.get<StaffEarnings[]>(path);
      setRows(data);
    } catch (err) {
      toast.fromError(err, "Failed to load salary data");
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    void dispatch(fetchStaff());
    void loadRows();
  }, [dispatch, loadRows]);

  useEffect(() => {
    const payout: Record<string, string> = {};
    const milestones: Record<string, string> = {};
    for (const s of staff) {
      payout[s.id] = String(s.payoutPerOrder ?? 30);
      milestones[s.id] = milestoneText(s.bonusMilestones ?? []);
    }
    setDraftPayout(payout);
    setDraftMilestones(milestones);
  }, [staff]);

  const staffById = useMemo(
    () => new Map(staff.map((s) => [s.id, s])),
    [staff]
  );

  const saveStaffRule = useCallback(
    async (staffId: string) => {
      const payout = Number(draftPayout[staffId] ?? "30");
      if (!Number.isFinite(payout) || payout < 0) {
        toast.error("Enter a valid payout amount");
        return;
      }
      let milestones: { orders: number; bonus: number }[] = [];
      try {
        milestones = parseMilestones(draftMilestones[staffId] ?? "");
      } catch (e) {
        toast.error((e as Error).message);
        return;
      }
      setSavingId(staffId);
      try {
        await dispatch(
          updateStaff({
            id: staffId,
            patch: {
              payoutPerOrder: payout,
              bonusMilestones: milestones,
            },
          })
        ).unwrap();
        await loadRows();
        toast.success("Salary rule updated");
      } catch (err) {
        toast.fromError(err, "Failed to update salary rule");
      } finally {
        setSavingId(null);
      }
    },
    [dispatch, draftMilestones, draftPayout, loadRows]
  );

  return (
    <div className="space-y-4">
      <style>{`
        @media (max-width: 767px) {
          dl > div:has(.rule-card-mobile-trigger) {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.5rem !important;
          }
          dl > div:has(.rule-card-mobile-trigger) > dt {
            width: 100% !important;
          }
          dl > div:has(.rule-card-mobile-trigger) > dd {
            width: 100% !important;
            text-align: left !important;
          }
        }
      `}</style>
      <Card>
        <CardHeader
          title="Salary Management"
        // subtitle="Base payout + cumulative milestone bonuses for each staff."
        />
        <div className="mb-4">
          <ResponsiveManagementFilters modalTitle="Salary period" triggerLabel="Filters">
            <ManagementFilterPanel>
              <ManagementFilterField label="From date">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className={MANAGEMENT_NATIVE_CONTROL_CLASS}
                  aria-label="From date"
                />
              </ManagementFilterField>
              <ManagementFilterField label="To date">
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className={MANAGEMENT_NATIVE_CONTROL_CLASS}
                  aria-label="To date"
                />
              </ManagementFilterField>
              <ManagementFilterField label="Period">
                <Button type="button" onClick={() => void loadRows()} loading={loading}>
                  Apply period
                </Button>
              </ManagementFilterField>
            </ManagementFilterPanel>
          </ResponsiveManagementFilters>
        </div>

        <Table
          columns={[
            {
              key: "staffName",
              header: "Staff",
              render: (r: StaffEarnings) => (
                <div className="font-medium">{r.staffName}</div>
              ),
            },
            { key: "orderCount", header: "Quantity" },
            {
              key: "orderEarnings",
              header: "Base amount",
              render: (r: StaffEarnings) => formatCurrency(r.orderEarnings),
            },
            {
              key: "bonus",
              header: "Bonus",
              render: (r: StaffEarnings) => formatCurrency(r.bonus),
            },
            {
              key: "total",
              header: "Total salary",
              render: (r: StaffEarnings) => (
                <span className="font-semibold text-earnings">
                  {formatCurrency(r.total)}
                </span>
              ),
            },
            {
              key: "rules",
              header: "Rules",
              className: "md:min-w-[15rem]",
              render: (r: StaffEarnings) => (
                <div className="rule-card-mobile-trigger w-full min-w-0 max-w-full text-left">
                  <div className="grid w-full min-w-0 gap-3 rounded-xl border border-primary-muted bg-surface p-4 shadow-sm ring-1 ring-primary/5 transition-all hover:shadow-md">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-tightest text-text-muted/80">
                        Payout per unit
                      </label>
                      <div className="relative group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-muted group-focus-within:text-primary transition-colors">
                          ₹
                        </span>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={draftPayout[r.staffId] ?? String(r.payoutPerOrder)}
                          onChange={(e) =>
                            setDraftPayout((prev) => ({
                              ...prev,
                              [r.staffId]: e.target.value,
                            }))
                          }
                          className="box-border w-full min-w-0 max-w-full rounded-lg border border-border bg-surface-alt pl-6 pr-3 py-2 text-sm text-text transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 outline-none"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-tightest text-text-muted/80">
                        Bonus Tiers
                      </label>
                      <input
                        type="text"
                        value={
                          draftMilestones[r.staffId] ??
                          milestoneText(staffById.get(r.staffId)?.bonusMilestones ?? [])
                        }
                        onChange={(e) =>
                          setDraftMilestones((prev) => ({
                            ...prev,
                            [r.staffId]: e.target.value,
                          }))
                        }
                        className="box-border w-full min-w-0 max-w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm text-text transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 outline-none"
                        placeholder="e.g. 5:50, 10:100"
                      />
                    </div>

                    <div className="flex min-w-0 flex-wrap gap-1.5">
                      {(() => {
                        try {
                          const tiers = parseMilestones(
                            draftMilestones[r.staffId] ??
                            milestoneText(staffById.get(r.staffId)?.bonusMilestones ?? [])
                          );
                          if (tiers.length === 0) {
                            return (
                              <span className="text-[11px] font-medium text-text-muted italic">
                                No active tiers
                              </span>
                            );
                          }
                          return tiers.map((m) => (
                            <span
                              key={`${r.staffId}-${m.orders}-${m.bonus}`}
                              className="rounded-md border border-primary-muted bg-primary-muted px-2 py-1 text-[10px] font-bold text-primary"
                            >
                              {m.orders} qty → ₹{m.bonus}
                            </span>
                          ));
                        } catch {
                          return (
                            <span className="text-[10px] font-bold text-error">
                              Invalid format (Qty:Bonus)
                            </span>
                          );
                        }
                      })()}
                    </div>

                    <p className="text-[10px] leading-tight text-text-muted/60">
                      Tier-based cumulative bonuses.
                    </p>
                    <Button
                      size="sm"
                      className="w-full shadow-sm shadow-primary/10"
                      onClick={() => void saveStaffRule(r.staffId)}
                      loading={savingId === r.staffId}
                    >
                      Update Rule
                    </Button>
                  </div>
                </div>
              ),
            },
          ]}
          data={rows}
          keyExtractor={(r) => r.staffId}
          emptyMessage="No salary rows for this period."
        />
      </Card>
    </div>
  );
}

export default memo(SalaryManagementPage);
