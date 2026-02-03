import { useState } from "react";
import Seo from "@/components/Seo";
import PortalShell from "@/components/PortalShell";
import SectionHeading from "@/components/SectionHeading";
import EmptyState from "@/components/EmptyState";
import { formatDateTime, formatINRFromPaise } from "@/components/Money";
import { useAdminTransactions } from "@/hooks/use-bills";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, Loader2, Receipt, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function AdminTransactionsPage() {
  const { toast } = useToast();
  const [date, setDate] = useState(todayISO());

  const q = useAdminTransactions(date, true);

  const adminVisible = !q.isError && !!q.data;

  return (
    <PortalShell adminVisible={adminVisible}>
      <Seo title="Admin Transactions — Online Mobile Recharge System" description="View daily transactions." />

      <SectionHeading
        eyebrow="Admin"
        title="Transactions"
        description="All recharges and bill payments for the selected date."
        testId="admin-transactions-heading"
        actions={
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 w-[160px] rounded-xl bg-card/70 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              data-testid="admin-transactions-date"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => q.refetch()}
              className="rounded-xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              data-testid="admin-transactions-refresh"
            >
              Refresh
            </Button>
          </div>
        }
      />

      <div className="mt-6">
        {q.isLoading ? (
          <div className="rounded-3xl border border-border bg-card/60 p-8 text-sm text-muted-foreground flex items-center gap-2" data-testid="admin-transactions-loading">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading transactions…
          </div>
        ) : q.isError ? (
          <EmptyState
            icon={<Shield className="h-6 w-6 text-primary" />}
            title="Admin access required"
            description={(q.error as Error).message}
            testId="admin-transactions-error"
          />
        ) : q.data ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12" data-testid="admin-transactions-panel">
            <div className="lg:col-span-7">
              <div className="reveal-in-up rounded-3xl border border-border/70 bg-card/55 p-6 shadow-sm backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                      Recharges
                    </div>
                    <h2 className="mt-2 text-2xl">{q.data.recharges.length} transactions</h2>
                  </div>
                  <div className="grid h-12 w-12 place-items-center rounded-2xl border border-border bg-card shadow-sm">
                    <CalendarDays className="h-5 w-5 text-primary" />
                  </div>
                </div>

                <div className="mt-5">
                  {q.data.recharges.length === 0 ? (
                    <EmptyState
                      icon={<Receipt className="h-6 w-6 text-primary" />}
                      title="No recharges"
                      description="No recharges recorded for this date."
                      testId="admin-recharges-empty"
                    />
                  ) : (
                    <div className="overflow-hidden rounded-2xl border border-border bg-card/60">
                      <div className="divide-y divide-border">
                        {q.data.recharges.map((r) => (
                          <div key={r.id} className="px-4 py-3 text-sm">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="font-mono text-xs">{r.transactionId}</div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                  Mobile: {r.mobileNumber}
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                  Type: {String(r.rechargeType).toUpperCase()}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-primary">
                                  {formatINRFromPaise(r.amountPaise)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatDateTime(r.createdAt as any)}
                                </div>
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
              <div className="reveal-in-up rounded-3xl border border-border/70 bg-card/55 p-6 shadow-sm backdrop-blur" style={{ animationDelay: "90ms" }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                      Bill Payments
                    </div>
                    <h2 className="mt-2 text-2xl">{q.data.billPayments.length} transactions</h2>
                  </div>
                  <div className="grid h-12 w-12 place-items-center rounded-2xl border border-border bg-card shadow-sm">
                    <Receipt className="h-5 w-5 text-primary" />
                  </div>
                </div>

                <div className="mt-5">
                  {q.data.billPayments.length === 0 ? (
                    <EmptyState
                      icon={<Receipt className="h-6 w-6 text-primary" />}
                      title="No bill payments"
                      description="No bill payments recorded for this date."
                      testId="admin-bills-empty"
                    />
                  ) : (
                    <div className="space-y-3">
                      {q.data.billPayments.map((b) => (
                        <div
                          key={b.id}
                          className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-mono text-xs">{b.transactionId}</div>
                              <div className="mt-1 text-xs text-muted-foreground">
                                Mobile: {b.mobileNumber}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-primary">
                                {formatINRFromPaise(b.billAmountPaise)}
                              </div>
                              <div className="text-xs text-muted-foreground">
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
        ) : null}
      </div>
    </PortalShell>
  );
}
