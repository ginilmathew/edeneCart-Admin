import { memo, useMemo } from "react";
import { Link } from "react-router";
import {
  TrophyIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/solid";
import { useAppSelector } from "../store/hooks";
import { selectOrders } from "../store/ordersSlice";
import { selectStaffMe, selectStaffMeLoading } from "../store/staffSlice";
import { selectProducts } from "../store/productsSlice";
import { selectSettings } from "../store/settingsSlice";
import {
  Card,
  CardHeader,
  Button,
  ProgressBar,
  Badge,
} from "../components/ui";
import { isAtOrBelowStockThreshold } from "../lib/stockUtils";
import {
  computeEarningsForStaff,
  getNextMilestone,
  formatCurrency,
} from "../lib/orderUtils";

const todayStart = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

function StaffDashboardPage() {
  const orders = useAppSelector(selectOrders);
  const staffProfile = useAppSelector(selectStaffMe);
  const meLoading = useAppSelector(selectStaffMeLoading);
  const products = useAppSelector(selectProducts);
  const settings = useAppSelector(selectSettings);

  const lowStockThreshold = settings?.lowStockThreshold ?? 0;

  const lowOrOutCount = useMemo(
    () =>
      products.filter((p) =>
        isAtOrBelowStockThreshold(p.stockQuantity ?? 0, lowStockThreshold)
      ).length,
    [products, lowStockThreshold]
  );

  const staffId = staffProfile?.id ?? null;

  const stats = useMemo(() => {
    if (!staffProfile || !staffId) return null;
    const todayOrders = orders.filter(
      (o) => o.staffId === staffId && o.createdAt >= todayStart()
    ).length;
    const undelivered = orders.filter(
      (o) =>
        o.staffId === staffId &&
        (o.status === "pending" ||
          o.status === "packed" ||
          o.status === "dispatch")
    ).length;
    const { total, orderCount } = computeEarningsForStaff(orders, staffProfile);
    const weekly = computeEarningsForStaff(orders, staffProfile, {
      weekOnly: true,
    }).total;
    return {
      todayOrders,
      totalEarnings: total,
      undelivered,
      weeklyEarnings: weekly,
      orderCount,
    };
  }, [orders, staffProfile, staffId]);

  const nextMilestone = useMemo(() => {
    if (!staffProfile || !stats) return null;
    return getNextMilestone(staffProfile, stats.orderCount);
  }, [staffProfile, stats]);

  const milestonesSorted = useMemo(() => {
    if (!staffProfile?.bonusMilestones?.length) return [];
    return [...staffProfile.bonusMilestones].sort((a, b) => a.orders - b.orders);
  }, [staffProfile]);

  const ordersToNext = useMemo(() => {
    if (!nextMilestone || !stats) return 0;
    return Math.max(0, nextMilestone.orders - stats.orderCount);
  }, [nextMilestone, stats]);

  if (meLoading) {
    return <div className="text-text-muted">Loading…</div>;
  }

  if (!staffProfile || !stats) {
    return (
      <div className="text-text-muted">
        Could not load your profile. Please contact admin.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CardHeader
        title="Dashboard"
        subtitle={`Hello, ${staffProfile.name}`}
        action={
          <Link to="/orders/create">
            <Button>Create Order</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <p className="text-sm text-text-muted">Today&apos;s Orders</p>
          <p className="mt-1 text-2xl font-semibold text-text-heading">
            {stats.todayOrders}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-text-muted">This Week</p>
          <p className="mt-1 text-2xl font-semibold text-primary">
            {formatCurrency(stats.weeklyEarnings)}
          </p>
        </Card>
        <Card
          className={
            lowOrOutCount > 0
              ? "border-2 border-error/40 bg-error-bg/30"
              : undefined
          }
        >
          <p className="text-sm text-text-muted">Low / out of stock</p>
          <p className="mt-1 text-2xl font-semibold text-error">
            {lowOrOutCount}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Stock ≤ {lowStockThreshold} (admin Settings)
          </p>
          <Link
            to="/stock"
            className="mt-3 inline-block text-xs font-semibold text-primary hover:underline"
          >
            View product stock →
          </Link>
        </Card>
      </div>

      {milestonesSorted.length > 0 && (
        <section
          className="relative overflow-hidden rounded-2xl border-2 border-amber-500/90 bg-gradient-to-br from-amber-50 via-orange-50/90 to-amber-100/70 p-5 shadow-lg shadow-amber-900/10 sm:p-7"
          aria-labelledby="bonus-targets-heading"
        >
          <div
            className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 rounded-full bg-amber-300/25 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-8 left-1/4 h-28 w-28 rounded-full bg-orange-400/20 blur-2xl"
            aria-hidden
          />

          <div className="relative flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-600/30">
                <TrophyIcon className="h-7 w-7" aria-hidden />
              </div>
              <div>
                <h2
                  id="bonus-targets-heading"
                  className="text-xl font-black tracking-tight text-amber-950 sm:text-2xl"
                >
                  Your bonus targets
                </h2>
                <p className="mt-0.5 max-w-xl text-sm font-medium text-amber-900/80">
                  Each completed order (quantity) moves you toward the next payout. Cancelled and
                  returned orders don&apos;t count.
                </p>
              </div>
            </div>
            <Badge
              variant="default"
              className="mt-2 w-fit shrink-0 border-amber-600/40 bg-amber-500/15 text-amber-950 sm:mt-0"
            >
              Focus on your next tier
            </Badge>
          </div>

          <div className="relative mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-amber-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-800/70">
                Your progress
              </p>
              <p className="mt-1 text-3xl font-black tabular-nums text-amber-950 sm:text-4xl">
                {stats.orderCount}
              </p>
              <p className="mt-0.5 text-sm font-medium text-amber-900/70">total order qty</p>
            </div>
            {nextMilestone ? (
              <>
                <div className="rounded-xl border-2 border-amber-500 bg-white p-4 shadow-md ring-2 ring-amber-400/30">
                  <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-900">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-amber-600" aria-hidden />
                    Next target
                  </p>
                  <p className="mt-1 text-3xl font-black tabular-nums text-amber-950 sm:text-4xl">
                    {nextMilestone.orders}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-amber-900/80">orders to hit this tier</p>
                </div>
                <div className="rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-500 to-orange-600 p-4 text-white shadow-md">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-50/90">
                    Bonus when you hit it
                  </p>
                  <p className="mt-1 text-3xl font-black tabular-nums sm:text-4xl">
                    {formatCurrency(nextMilestone.bonus)}
                  </p>
                  <p className="mt-2 rounded-lg bg-black/10 px-2 py-1.5 text-center text-sm font-bold">
                    {ordersToNext === 0
                      ? "You’ve reached this tier — keep going!"
                      : `${ordersToNext} more order qty to unlock`}
                  </p>
                </div>
              </>
            ) : (
              <div className="sm:col-span-2 rounded-xl border border-green-200 bg-green-50/90 p-4 shadow-sm">
                <p className="text-sm font-bold text-green-900">All milestones achieved</p>
                <p className="mt-1 text-sm text-green-800/90">
                  You&apos;ve passed every tier. Keep creating orders — your totals still grow.
                </p>
              </div>
            )}
          </div>

          {nextMilestone ? (
            <div className="relative mt-6 rounded-xl border border-amber-200/60 bg-white/80 p-4 backdrop-blur-sm">
              <ProgressBar
                value={stats.orderCount}
                max={nextMilestone.orders}
                label="Progress to next bonus"
                className="[&>div:last-child]:h-3.5 [&>div:last-child>div]:rounded-full [&>div:last-child>div]:bg-gradient-to-r [&>div:last-child>div]:from-amber-500 [&>div:last-child>div]:to-orange-500"
              />
              <p className="mt-3 text-center text-sm font-semibold text-amber-950">
                Earnings so far (incl. bonuses earned):{" "}
                <span className="tabular-nums text-base font-black text-amber-900">
                  {formatCurrency(stats.totalEarnings)}
                </span>
              </p>
            </div>
          ) : (
            <p className="relative mt-4 text-center text-sm font-medium text-amber-900/80">
              Earnings so far:{" "}
              <span className="font-black tabular-nums text-amber-950">
                {formatCurrency(stats.totalEarnings)}
              </span>
            </p>
          )}

          <div className="relative mt-6 border-t border-amber-200/80 pt-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-amber-900/70">
              All tiers (admin set)
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {milestonesSorted.map((m) => {
                const reached = stats.orderCount >= m.orders;
                const isNext =
                  !reached &&
                  nextMilestone &&
                  m.orders === nextMilestone.orders;
                return (
                  <li
                    key={`${m.orders}-${m.bonus}`}
                    className={[
                      "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                      reached
                        ? "border-green-200 bg-green-50/80 text-green-900"
                        : isNext
                          ? "border-amber-400 bg-amber-100/80 font-semibold text-amber-950 shadow-sm"
                          : "border-amber-100/80 bg-white/60 text-amber-900/75",
                    ].join(" ")}
                  >
                    {reached ? (
                      <CheckCircleIcon
                        className="h-6 w-6 shrink-0 text-green-600"
                        aria-hidden
                      />
                    ) : (
                      <span
                        className={[
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black",
                          isNext
                            ? "bg-amber-500 text-white"
                            : "bg-amber-200/80 text-amber-800",
                        ].join(" ")}
                        aria-hidden
                      >
                        {isNext ? "!" : "○"}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <span className="font-bold tabular-nums">{m.orders}</span>
                      <span className="text-amber-900/70"> orders</span>
                      <span className="mx-1.5 text-amber-700/50">→</span>
                      <span className="font-black tabular-nums text-amber-950">
                        {formatCurrency(m.bonus)}
                      </span>
                      {reached && (
                        <span className="ml-2 text-xs font-bold uppercase text-green-700">
                          Done
                        </span>
                      )}
                      {isNext && (
                        <span className="ml-2 text-xs font-bold uppercase text-amber-800">
                          Current target
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}

export default memo(StaffDashboardPage);
