import { useEffect, useMemo, useState } from "react";
import Seo from "@/components/Seo";
import PortalShell from "@/components/PortalShell";
import SectionHeading from "@/components/SectionHeading";
import EmptyState from "@/components/EmptyState";
import ReceiptCard from "@/components/ReceiptCard";
import { formatINRFromPaise } from "@/components/Money";
import { useAuth } from "@/hooks/use-auth";
import { usePlans } from "@/hooks/use-plans";
import { useCreateRecharge } from "@/hooks/use-recharges";
import { useAdminOverview } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError, redirectToLogin } from "@/lib/auth-utils";
import { cn } from "@/lib/utils";
import { BadgeCheck, CreditCard, Loader2, PhoneCall, Radio, Sparkles, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Step = 1 | 2 | 3 | 4;

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

export default function RechargePage() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const adminProbe = useAdminOverview(todayISO(), isAuthenticated);
  const adminVisible = !adminProbe.isError && !!adminProbe.data;

  const [mobileNumber, setMobileNumber] = useState("");
  const [step, setStep] = useState<Step>(1);
  const [tab, setTab] = useState<"topup" | "special">("topup");
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  const plans = usePlans({ type: tab, activeOnly: "true" });
  const createRecharge = useCreateRecharge();

  const selectedPlan = useMemo(() => {
    return plans.data?.find((p) => p.id === selectedPlanId) ?? null;
  }, [plans.data, selectedPlanId]);

  const [receipt, setReceipt] = useState<{
    transactionId: string;
    rechargeType: "topup" | "special";
    mobileNumber: string;
    amountPaise: number;
    createdAt: string;
    planName?: string;
  } | null>(null);

  useEffect(() => {
    // Reset downstream state when switching tab
    setSelectedPlanId(null);
  }, [tab]);

  const proceedStep1 = () => {
    if (!mobileValid(mobileNumber)) {
      toast({ title: "Invalid mobile number", description: "Enter a valid 10-digit mobile number.", variant: "destructive" });
      return;
    }
    setStep(2);
  };

  const proceedStep2 = () => {
    if (!selectedPlanId) {
      toast({ title: "Select a plan", description: "Choose a plan to proceed.", variant: "destructive" });
      return;
    }
    setStep(3);
  };

  const submitPayment = async () => {
    if (!selectedPlanId) return;
    try {
      const res = await createRecharge.mutateAsync({
        mobileNumber,
        rechargeType: tab,
        planId: selectedPlanId,
      });

      setReceipt({
        transactionId: res.transactionId,
        rechargeType: (res.rechargeType as "topup" | "special") ?? tab,
        mobileNumber: res.mobileNumber,
        amountPaise: res.amountPaise,
        createdAt: (res.createdAt as unknown as string) ?? new Date().toISOString(),
        planName: selectedPlan?.name ?? undefined,
      });
      setStep(4);
      toast({ title: "Recharge successful", description: "Receipt generated.", variant: "default" });
    } catch (e) {
      const err = e as Error;
      if (isUnauthorizedError(err)) return redirectToLogin((o) => toast(o));
      toast({ title: "Recharge failed", description: err.message, variant: "destructive" });
    }
  };

  const resetAll = () => {
    setMobileNumber("");
    setSelectedPlanId(null);
    setReceipt(null);
    setStep(1);
  };

  return (
    <PortalShell adminVisible={adminVisible}>
      <Seo
        title="Online Recharge — Online Mobile Recharge System"
        description="Recharge a 10-digit mobile number using Top-up or Special plans. Get a print-ready receipt instantly."
      />

      <SectionHeading
        eyebrow="Online Recharge"
        title="Recharge a mobile number"
        description="Enter the mobile number, choose a plan, and proceed to payment. A receipt is generated immediately after success."
        testId="recharge-heading"
      />

      {step === 4 && receipt ? (
        <ReceiptCard
          title="Mobile Recharge Receipt"
          transactionId={receipt.transactionId}
          mobileNumber={receipt.mobileNumber}
          amountPaise={receipt.amountPaise}
          createdAt={receipt.createdAt}
          lines={[
            { label: "Recharge Type", value: receipt.rechargeType === "topup" ? "Top-up" : "Special" },
            { label: "Plan", value: receipt.planName ?? "—" },
          ]}
          onCancel={resetAll}
          testId="recharge-receipt"
        />
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="reveal-in-up rounded-3xl border border-border/70 bg-card/55 p-6 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                      Step {step} of 3
                    </div>
                    <h2 className="mt-2 text-2xl">
                      {step === 1 ? "Mobile number" : step === 2 ? "Choose a plan" : "Payment"}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {step === 1
                        ? "Enter a 10-digit mobile number to continue."
                        : step === 2
                          ? "Select a plan based on the recharge type."
                          : "Confirm details and submit payment."}
                    </p>
                  </div>
                  <div className="hidden sm:grid h-12 w-12 place-items-center rounded-2xl border border-border bg-card shadow-sm">
                    {step === 1 ? <PhoneCall className="h-5 w-5 text-primary" /> : step === 2 ? <Radio className="h-5 w-5 text-primary" /> : <CreditCard className="h-5 w-5 text-primary" />}
                  </div>
                </div>

                {step === 1 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
                    <div className="sm:col-span-3">
                      <label className="text-xs font-semibold text-muted-foreground">Mobile number</label>
                      <Input
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                        placeholder="10-digit number"
                        inputMode="numeric"
                        className="mt-2 h-12 rounded-2xl bg-card/70 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                        data-testid="recharge-mobile-input"
                      />
                      <div className="mt-2 text-xs text-muted-foreground">
                        Example: 9876543210
                      </div>
                    </div>
                    <div className="sm:col-span-2 flex items-end">
                      <Button
                        type="button"
                        onClick={proceedStep1}
                        className="h-12 w-full rounded-2xl bg-gradient-to-r from-primary to-primary/85 shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
                        data-testid="recharge-step1-continue"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                ) : null}

                {step === 2 ? (
                  <div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} data-testid="recharge-tabs">
                        <TabsList className="rounded-2xl bg-card/70 border border-border p-1 shadow-sm">
                          <TabsTrigger
                            value="topup"
                            className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            data-testid="recharge-tab-topup"
                          >
                            Top-up
                          </TabsTrigger>
                          <TabsTrigger
                            value="special"
                            className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            data-testid="recharge-tab-special"
                          >
                            Special
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="topup" />
                        <TabsContent value="special" />
                      </Tabs>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setStep(1)}
                          className="rounded-xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                          data-testid="recharge-back-step1"
                        >
                          Back
                        </Button>
                        <Button
                          type="button"
                          onClick={proceedStep2}
                          className="rounded-xl bg-gradient-to-r from-primary to-primary/85 shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
                          data-testid="recharge-step2-continue"
                        >
                          Continue
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-border bg-card/60 p-4">
                      <div className="text-xs font-semibold text-muted-foreground">Mobile</div>
                      <div className="mt-1 font-mono text-sm" data-testid="recharge-mobile-display">
                        {mobileNumber}
                      </div>
                    </div>

                    {plans.isLoading ? (
                      <div className="mt-4 rounded-2xl border border-border bg-card/60 p-8 text-sm text-muted-foreground flex items-center gap-2" data-testid="recharge-plans-loading">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading plans…
                      </div>
                    ) : plans.isError ? (
                      <div className="mt-4 rounded-2xl border border-border bg-card/60 p-4 text-sm text-destructive" data-testid="recharge-plans-error">
                        {(plans.error as Error).message}
                      </div>
                    ) : !plans.data?.length ? (
                      <div className="mt-4">
                        <EmptyState
                          icon={<Smartphone className="h-6 w-6 text-primary" />}
                          title="No plans available"
                          description="Try switching between Top-up and Special or check again later."
                          testId="recharge-plans-empty"
                          action={
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => plans.refetch()}
                              className="rounded-xl"
                              data-testid="recharge-plans-refetch"
                            >
                              Refresh
                            </Button>
                          }
                        />
                      </div>
                    ) : (
                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2" data-testid="recharge-plans-grid">
                        {plans.data.map((p) => {
                          const selected = p.id === selectedPlanId;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setSelectedPlanId(p.id)}
                              className={cn(
                                "text-left group rounded-2xl border bg-card/70 p-4 shadow-sm transition-all duration-300",
                                "hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10",
                                selected ? "border-primary/40 ring-2 ring-primary/10" : "border-border/70"
                              )}
                              data-testid={`recharge-plan-${p.id}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold truncate">{p.name}</div>
                                  <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                    {p.description || "Plan details available at checkout."}
                                  </div>
                                </div>
                                <div className={cn(
                                  "grid h-9 w-9 place-items-center rounded-xl border border-border bg-card shadow-sm transition-all",
                                  selected ? "border-primary/30 bg-primary/10" : ""
                                )}>
                                  <BadgeCheck className={cn("h-4 w-4", selected ? "text-primary" : "text-muted-foreground")} />
                                </div>
                              </div>
                              <div className="mt-4 flex items-end justify-between gap-3">
                                <div>
                                  <div className="text-xs text-muted-foreground">Amount</div>
                                  <div className="mt-1 text-lg font-bold text-primary">
                                    {formatINRFromPaise(p.amountPaise)}
                                  </div>
                                </div>
                                <div className="text-xs text-muted-foreground text-right">
                                  {p.validityDays ? (
                                    <div>
                                      <span className="font-semibold text-foreground">{p.validityDays}</span> days validity
                                    </div>
                                  ) : (
                                    <div>Validity not specified</div>
                                  )}
                                  {p.talktimePaise ? (
                                    <div>
                                      Talktime: <span className="font-semibold text-foreground">{formatINRFromPaise(p.talktimePaise)}</span>
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : null}

                {step === 3 ? (
                  <div className="space-y-4" data-testid="recharge-step3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border bg-card/60 p-4">
                        <div className="text-xs text-muted-foreground">Mobile</div>
                        <div className="mt-1 font-mono text-sm" data-testid="recharge-confirm-mobile">
                          {mobileNumber}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-border bg-card/60 p-4">
                        <div className="text-xs text-muted-foreground">Recharge Type</div>
                        <div className="mt-1 text-sm font-semibold" data-testid="recharge-confirm-type">
                          {tab === "topup" ? "Top-up" : "Special"}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-border bg-card/60 p-4 sm:col-span-2">
                        <div className="text-xs text-muted-foreground">Plan</div>
                        <div className="mt-1 text-sm font-semibold" data-testid="recharge-confirm-plan">
                          {selectedPlan?.name ?? "—"}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {selectedPlan?.description ?? "—"}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-gradient-to-r from-primary/10 via-card/50 to-accent/10 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-semibold text-muted-foreground">Payable amount</div>
                          <div className="mt-1 text-2xl font-bold text-primary" data-testid="recharge-confirm-amount">
                            {formatINRFromPaise(selectedPlan?.amountPaise ?? 0)}
                          </div>
                        </div>
                        <div className="grid h-12 w-12 place-items-center rounded-2xl border border-border bg-card shadow-sm">
                          <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-muted-foreground">
                        This is a mock payment flow. Submitting generates a transaction and receipt.
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setStep(2)}
                        className="rounded-xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                        data-testid="recharge-back-step2"
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        onClick={submitPayment}
                        disabled={createRecharge.isPending}
                        className="rounded-xl bg-gradient-to-r from-primary to-primary/85 shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                        data-testid="recharge-pay"
                      >
                        {createRecharge.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing…
                          </>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Pay & Generate Receipt
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="reveal-in-up rounded-3xl border border-border/70 bg-card/55 p-6 shadow-sm backdrop-blur" style={{ animationDelay: "90ms" }}>
              <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Checklist
              </div>
              <h3 className="mt-2 text-xl">Before you pay</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {[
                  "Confirm the 10-digit mobile number.",
                  "Select the correct plan type and amount.",
                  "Save or print your receipt after success.",
                ].map((t, i) => (
                  <li
                    key={t}
                    className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card/70 p-3 shadow-sm"
                    data-testid={`recharge-check-${i}`}
                  >
                    <span className="mt-0.5 grid h-7 w-7 place-items-center rounded-xl border border-border bg-card shadow-sm">
                      <Smartphone className="h-4 w-4 text-primary" />
                    </span>
                    <span className="text-muted-foreground">{t}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-card/50 p-4">
                <div className="text-xs font-semibold text-muted-foreground">Mobile validation</div>
                <div className="mt-2 text-sm">
                  {mobileNumber
                    ? mobileValid(mobileNumber)
                      ? <span className="font-semibold text-primary" data-testid="recharge-mobile-valid">Valid</span>
                      : <span className="font-semibold text-destructive" data-testid="recharge-mobile-invalid">Invalid</span>
                    : <span className="text-muted-foreground" data-testid="recharge-mobile-empty">Enter a number to validate</span>}
                </div>
              </div>

              <div className="mt-5">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={resetAll}
                  className="w-full rounded-xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  data-testid="recharge-reset"
                >
                  Reset flow
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
