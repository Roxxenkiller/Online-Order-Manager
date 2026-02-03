import { useMemo } from "react";
import Seo from "@/components/Seo";
import PortalShell from "@/components/PortalShell";
import SectionHeading from "@/components/SectionHeading";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/hooks/use-auth";
import { useAdminOverview } from "@/hooks/use-admin";
import { useMyBillPayments } from "@/hooks/use-bills";
import { useMyRecharges } from "@/hooks/use-recharges";
import { formatDateTime, formatINRFromPaise } from "@/components/Money";
import { Loader2, Receipt, Smartphone, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function HistoryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const adminProbe = useAdminOverview(todayISO(), isAuthenticated);
  const adminVisible = !adminProbe.isError && !!adminProbe.data;

  const recharges = useMyRecharges(isAuthenticated);
  const bills = useMyBillPayments(isAuthenticated);

  const rechargeRows = useMemo(() => (recharges.data ?? []).slice().sort((a, b) => {
    const ad = new Date(a.createdAt as any).getTime();
    const bd = new Date(b.createdAt as any).getTime();
    return bd - ad;
  }), [recharges.data]);

  const billRows = useMemo(() => (bills.data ?? []).slice().sort((a, b) => {
    const ad = new Date(a.createdAt as any).getTime();
    const bd = new Date(b.createdAt as any).getTime();
    return bd - ad;
  }), [bills.data]);

  if (authLoading) {
    return (
      <PortalShell adminVisible={false}>
        <Seo title="History — Online Mobile Recharge System" description="View recharge and bill payment history." />
        <div className="rounded-3xl border border-border bg-card/60 p-8 text-sm text-muted-foreground flex items-center gap-2" data-testid="history-auth-loading">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      </PortalShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <PortalShell adminVisible={false}>
        <Seo title="History — Online Mobile Recharge System" description="Login required to view history." />
        <SectionHeading
          eyebrow="History"
          title="Login required"
          description="Sign in to view your recharge and bill payment receipts."
          testId="history-guest-heading"
          actions={
            <Button
              type="button"
              onClick={() => (window.location.href = "/api/login")}
              className="rounded-xl bg-gradient-to-r from-primary to-primary/85 shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
              data-testid="history-login"
            >
              Login
            </Button>
          }
        />
        <div className="mt-6">
          <EmptyState
            icon={<Receipt className="h-6 w-6 text-primary" />}
            title="No history in guest mode"
            description="Login to store and view your transaction history."
            testId="history-guest-empty"
          />
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell adminVisible={adminVisible}>
      <Seo title="History — Online Mobile Recharge System" description="View your recent recharges and bill payments." />

      <SectionHeading
        eyebrow="My Account"
        title="History"
        description="All your recent transactions, with amounts and timestamps."
        testId="history-heading"
      />

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="reveal-in-up rounded-3xl border border-border/70 bg-card/55 p-6 shadow-sm backdrop-blur" data-testid="history-recharges-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  Recharges
                </div>
                <h2 className="mt-2 text-2xl">Mobile recharge receipts</h2>
              </div>
              <div className="hidden sm:grid h-12 w-12 place-items-center rounded-2xl border border-border bg-card shadow-sm">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
            </div>

            <div className="mt-5">
              {recharges.isLoading ? (
                <div className="rounded-2xl border border-border bg-card/60 p-6 text-sm text-muted-foreground flex items-center gap-2" data-testid="history-recharges-loading">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading recharges…
                </div>
              ) : recharges.isError ? (
                <div className="rounded-2xl border border-border bg-card/60 p-4 text-sm text-destructive" data-testid="history-recharges-error">
                  {(recharges.error as Error).message}
                </div>
              ) : rechargeRows.length === 0 ? (
                <EmptyState
                  icon={<Receipt className="h-6 w-6 text-primary" />}
                  title="No recharges yet"
                  description="Your successful recharges will appear here."
                  testId="history-recharges-empty"
                />
              ) : (
                <div className="overflow-hidden rounded-2xl border border-border bg-card/60" data-testid="history-recharges-table">
                  <div className="grid grid-cols-12 gap-2 border-b border-border bg-card/70 px-4 py-3 text-xs font-semibold text-muted-foreground">
                    <div className="col-span-4">Transaction</div>
                    <div className="col-span-3">Mobile</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-3 text-right">Amount / Time</div>
                  </div>
                  <div className="divide-y divide-border">
                    {rechargeRows.map((r) => (
                      <div key={r.id} className="grid grid-cols-12 gap-2 px-4 py-3 text-sm">
                        <div className="col-span-4 font-mono text-xs sm:text-sm truncate" data-testid={`history-recharge-tx-${r.id}`}>
                          {r.transactionId}
                        </div>
                        <div className="col-span-3 font-mono text-xs sm:text-sm" data-testid={`history-recharge-mobile-${r.id}`}>
                          {r.mobileNumber}
                        </div>
                        <div className="col-span-2 text-xs sm:text-sm font-semibold" data-testid={`history-recharge-type-${r.id}`}>
                          {String(r.rechargeType).toUpperCase()}
                        </div>
                        <div className="col-span-3 text-right">
                          <div className="font-semibold text-primary" data-testid={`history-recharge-amount-${r.id}`}>
                            {formatINRFromPaise(r.amountPaise)}
                          </div>
                          <div className="text-xs text-muted-foreground" data-testid={`history-recharge-time-${r.id}`}>
                            {formatDateTime(r.createdAt as any)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="reveal-in-up rounded-3xl border border-border/70 bg-card/55 p-6 shadow-sm backdrop-blur" style={{ animationDelay: "90ms" }} data-testid="history-bills-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  Bills
                </div>
                <h2 className="mt-2 text-2xl">Bill payment receipts</h2>
              </div>
              <div className="hidden sm:grid h-12 w-12 place-items-center rounded-2xl border border-border bg-card shadow-sm">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
            </div>

            <div className="mt-5">
              {bills.isLoading ? (
                <div className="rounded-2xl border border-border bg-card/60 p-6 text-sm text-muted-foreground flex items-center gap-2" data-testid="history-bills-loading">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading payments…
                </div>
              ) : bills.isError ? (
                <div className="rounded-2xl border border-border bg-card/60 p-4 text-sm text-destructive" data-testid="history-bills-error">
                  {(bills.error as Error).message}
                </div>
              ) : billRows.length === 0 ? (
                <EmptyState
                  icon={<Wallet className="h-6 w-6 text-primary" />}
                  title="No bill payments yet"
                  description="Your successful bill payments will appear here."
                  testId="history-bills-empty"
                />
              ) : (
                <div className="space-y-3" data-testid="history-bills-list">
                  {billRows.map((b) => (
                    <div
                      key={b.id}
                      className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                      data-testid={`history-bill-item-${b.id}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs text-muted-foreground">Transaction</div>
                          <div className="mt-1 font-mono text-xs sm:text-sm truncate" data-testid={`history-bill-tx-${b.id}`}>
                            {b.transactionId}
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">Mobile</div>
                          <div className="mt-1 font-mono text-xs sm:text-sm" data-testid={`history-bill-mobile-${b.id}`}>
                            {b.mobileNumber}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Amount</div>
                          <div className="mt-1 text-lg font-bold text-primary" data-testid={`history-bill-amount-${b.id}`}>
                            {formatINRFromPaise(b.billAmountPaise)}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground" data-testid={`history-bill-time-${b.id}`}>
                            {formatDateTime(b.createdAt as any)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
