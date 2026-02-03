import { useMemo, useState } from "react";
import Seo from "@/components/Seo";
import PortalShell from "@/components/PortalShell";
import SectionHeading from "@/components/SectionHeading";
import ReceiptCard from "@/components/ReceiptCard";
import EmptyState from "@/components/EmptyState";
import { formatINRFromPaise } from "@/components/Money";
import { useAuth } from "@/hooks/use-auth";
import { useAdminOverview } from "@/hooks/use-admin";
import { useMockBill, usePayBill } from "@/hooks/use-bills";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError, redirectToLogin } from "@/lib/auth-utils";
import { CreditCard, Loader2, Receipt, Search, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function mobileValid(v: string) {
  return /^\d{10}$/.test(v);
}

export default function BillPaymentPage() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const adminProbe = useAdminOverview(todayISO(), isAuthenticated);
  const adminVisible = !adminProbe.isError && !!adminProbe.data;

  const [mobileNumber, setMobileNumber] = useState("");
  const [lookedUp, setLookedUp] = useState(false);

  const bill = useMockBill(mobileValid(mobileNumber) ? mobileNumber : undefined, lookedUp);
  const pay = usePayBill();

  const [receipt, setReceipt] = useState<{
    transactionId: string;
    mobileNumber: string;
    amountPaise: number;
    createdAt: string;
  } | null>(null);

  const payable = useMemo(() => bill.data?.billAmountPaise ?? 0, [bill.data?.billAmountPaise]);

  const lookup = () => {
    if (!mobileValid(mobileNumber)) {
      toast({ title: "Invalid mobile number", description: "Enter a valid 10-digit mobile number.", variant: "destructive" });
      return;
    }
    setLookedUp(true);
    bill.refetch();
  };

  const submitPayment = async () => {
    if (!mobileValid(mobileNumber)) return;
    try {
      const res = await pay.mutateAsync({ mobileNumber });
      setReceipt({
        transactionId: res.transactionId,
        mobileNumber: res.mobileNumber,
        amountPaise: res.billAmountPaise,
        createdAt: (res.createdAt as unknown as string) ?? new Date().toISOString(),
      });
      toast({ title: "Payment successful", description: "Receipt generated.", variant: "default" });
    } catch (e) {
      const err = e as Error;
      if (isUnauthorizedError(err)) return redirectToLogin((o) => toast(o));
      toast({ title: "Payment failed", description: err.message, variant: "destructive" });
    }
  };

  const reset = () => {
    setMobileNumber("");
    setLookedUp(false);
    setReceipt(null);
  };

  return (
    <PortalShell adminVisible={adminVisible}>
      <Seo
        title="Postpaid Bill Payment — Online Mobile Recharge System"
        description="Fetch a mock postpaid bill using a 10-digit mobile number and pay instantly with a receipt."
      />

      <SectionHeading
        eyebrow="Postpaid"
        title="Post Bill Payment"
        description="Enter a postpaid mobile number to fetch the bill amount, then proceed to pay."
        testId="bill-heading"
      />

      {receipt ? (
        <ReceiptCard
          title="Bill Payment Receipt"
          transactionId={receipt.transactionId}
          mobileNumber={receipt.mobileNumber}
          amountPaise={receipt.amountPaise}
          createdAt={receipt.createdAt}
          lines={[{ label: "Payment Type", value: "Postpaid bill payment" }]}
          onCancel={reset}
          testId="bill-receipt"
        />
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="reveal-in-up rounded-3xl border border-border/70 bg-card/55 p-6 shadow-sm backdrop-blur" data-testid="bill-card">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
                  <div className="sm:col-span-3">
                    <label className="text-xs font-semibold text-muted-foreground">Mobile number</label>
                    <Input
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                      placeholder="10-digit number"
                      inputMode="numeric"
                      className="mt-2 h-12 rounded-2xl bg-card/70 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                      data-testid="bill-mobile-input"
                    />
                    <div className="mt-2 text-xs text-muted-foreground">
                      Enter a valid 10-digit postpaid number to view the bill.
                    </div>
                  </div>
                  <div className="sm:col-span-2 flex items-end">
                    <Button
                      type="button"
                      onClick={lookup}
                      className="h-12 w-full rounded-2xl bg-gradient-to-r from-primary to-primary/85 shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
                      data-testid="bill-lookup"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Fetch Bill
                    </Button>
                  </div>
                </div>

                {lookedUp ? (
                  bill.isLoading ? (
                    <div className="rounded-2xl border border-border bg-card/60 p-6 text-sm text-muted-foreground flex items-center gap-2" data-testid="bill-loading">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Fetching bill…
                    </div>
                  ) : bill.isError ? (
                    <div className="rounded-2xl border border-border bg-card/60 p-4 text-sm text-destructive" data-testid="bill-error">
                      {(bill.error as Error).message}
                    </div>
                  ) : bill.data ? (
                    <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-primary/10 via-card/55 to-accent/10 p-5 shadow-sm" data-testid="bill-amount-panel">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="text-xs font-semibold text-muted-foreground">Bill amount</div>
                          <div className="mt-1 text-3xl font-bold text-primary" data-testid="bill-amount">
                            {formatINRFromPaise(payable)}
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            Mock bill fetch result for <span className="font-mono">{bill.data.mobileNumber}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 sm:items-end">
                          <Button
                            type="button"
                            onClick={submitPayment}
                            disabled={pay.isPending}
                            className="rounded-2xl bg-gradient-to-r from-accent to-accent/85 text-accent-foreground shadow-md shadow-accent/15 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                            data-testid="bill-pay"
                          >
                            {pay.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Paying…
                              </>
                            ) : (
                              <>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Pay Now
                              </>
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={reset}
                            className="rounded-xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                            data-testid="bill-reset"
                          >
                            Reset
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <EmptyState
                        icon={<Receipt className="h-6 w-6 text-primary" />}
                        title="No bill found"
                        description="Try again with a valid number."
                        testId="bill-empty"
                      />
                    </div>
                  )
                ) : (
                  <div className="rounded-2xl border border-border bg-card/60 p-5 text-sm text-muted-foreground" data-testid="bill-hint">
                    Fetch bill to unlock payment action.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="reveal-in-up rounded-3xl border border-border/70 bg-card/55 p-6 shadow-sm backdrop-blur" style={{ animationDelay: "90ms" }}>
              <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Notes
              </div>
              <h3 className="mt-2 text-xl">What happens next</h3>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <div className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm" data-testid="bill-note-1">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <Wallet className="h-4 w-4 text-primary" />
                    Bill fetch
                  </div>
                  <div className="mt-2 text-sm">
                    The system retrieves a mock bill amount for demonstration.
                  </div>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm" data-testid="bill-note-2">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <Receipt className="h-4 w-4 text-primary" />
                    Receipt
                  </div>
                  <div className="mt-2 text-sm">
                    Successful payment generates a print-ready receipt instantly.
                  </div>
                </div>
              </div>

              <div className="mt-5 text-xs text-muted-foreground">
                You can access payment history after signing in.
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
