import { useMemo, useState } from "react";
import Seo from "@/components/Seo";
import PortalShell from "@/components/PortalShell";
import SectionHeading from "@/components/SectionHeading";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import { useAdminOverview } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";
import { formatINRFromPaise } from "@/components/Money";
import { CalendarDays, Loader2, Shield, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function AdminOverviewPage() {
  const { toast } = useToast();
  const [date, setDate] = useState(todayISO());

  const q = useAdminOverview(date, true);

  const adminVisible = !q.isError && !!q.data;

  const totals = useMemo(() => q.data, [q.data]);

  return (
    <PortalShell adminVisible={adminVisible}>
      <Seo title="Admin Overview — Online Mobile Recharge System" description="Admin daily totals and transaction count." />

      <SectionHeading
        eyebrow="Admin"
        title="Overview"
        description="Daily totals for recharges and bill payments. Date filter is supported."
        testId="admin-overview-heading"
        actions={
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 w-[160px] rounded-xl bg-card/70 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              data-testid="admin-overview-date"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                q.refetch();
                toast({ title: "Refreshing", description: "Fetching latest totals…", variant: "default" });
              }}
              className="rounded-xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              data-testid="admin-overview-refresh"
            >
              Refresh
            </Button>
          </div>
        }
      />

      <div className="mt-6">
        {q.isLoading ? (
          <div className="rounded-3xl border border-border bg-card/60 p-8 text-sm text-muted-foreground flex items-center gap-2" data-testid="admin-overview-loading">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading admin overview…
          </div>
        ) : q.isError ? (
          <EmptyState
            icon={<Shield className="h-6 w-6 text-primary" />}
            title="Admin access required"
            description={(q.error as Error).message}
            testId="admin-overview-error"
          />
        ) : totals ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12" data-testid="admin-overview-panel">
            <div className="lg:col-span-4">
              <StatCard
                label="Date"
                value={<span className="font-mono text-base">{totals.date}</span>}
                hint="Daily snapshot"
                icon={<CalendarDays className="h-5 w-5 text-primary" />}
                tone="muted"
                testId="admin-stat-date"
              />
            </div>
            <div className="lg:col-span-4">
              <StatCard
                label="Recharge total"
                value={formatINRFromPaise(totals.totalRechargeAmountPaise)}
                hint="Sum of recharge transactions"
                icon={<TrendingUp className="h-5 w-5 text-primary" />}
                tone="primary"
                testId="admin-stat-recharge"
              />
            </div>
            <div className="lg:col-span-4">
              <StatCard
                label="Bill total"
                value={formatINRFromPaise(totals.totalBillAmountPaise)}
                hint="Sum of bill payments"
                icon={<Wallet className="h-5 w-5 text-primary" />}
                tone="accent"
                testId="admin-stat-bill"
              />
            </div>

            <div className="lg:col-span-12">
              <div className="reveal-in-up rounded-3xl border border-border/70 bg-card/55 p-6 shadow-sm backdrop-blur">
                <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  Transactions
                </div>
                <h2 className="mt-2 text-2xl">Count</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Total transactions recorded for the day.
                </p>

                <div className="mt-4 rounded-2xl border border-border bg-gradient-to-r from-primary/10 via-card/55 to-accent/10 p-5">
                  <div className="text-4xl font-bold text-primary" data-testid="admin-total-transactions">
                    {totals.totalTransactions}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </PortalShell>
  );
}
