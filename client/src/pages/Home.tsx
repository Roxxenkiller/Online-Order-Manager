import Seo from "@/components/Seo";
import PortalShell from "@/components/PortalShell";
import SectionHeading from "@/components/SectionHeading";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/hooks/use-auth";
import { useAdminOverview } from "@/hooks/use-admin";
import { useMyBillPayments } from "@/hooks/use-bills";
import { useMyRecharges } from "@/hooks/use-recharges";
import { formatINRFromPaise } from "@/components/Money";
import { Activity, ArrowRight, Receipt, Shield, Smartphone, Wallet } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function Home() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  // Probe admin; if 200 -> show admin section + nav item.
  const adminProbe = useAdminOverview(todayISO(), isAuthenticated);

  const myRecharges = useMyRecharges(isAuthenticated);
  const myBills = useMyBillPayments(isAuthenticated);

  const adminVisible = !adminProbe.isError && !!adminProbe.data;

  const firstName = user?.firstName ?? undefined;

  return (
    <PortalShell adminVisible={adminVisible}>
      <Seo
        title="Dashboard — Online Mobile Recharge System"
        description="Your portal dashboard: quick actions, latest activity, and daily totals when admin access is available."
      />

      <SectionHeading
        eyebrow="Dashboard"
        title={isAuthenticated ? `Welcome${firstName ? `, ${firstName}` : ""}` : "Welcome"}
        description={
          isAuthenticated
            ? "Use quick actions to recharge, pay bills, manage services, and review receipts."
            : "You’re browsing as a guest. You can recharge or pay a bill; sign in to manage account and history."
        }
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/recharge"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary/85 px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
              data-testid="home-cta-recharge"
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Recharge
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/bill-payment"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-card/70 px-4 py-2 text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              data-testid="home-cta-bill"
            >
              <Wallet className="mr-2 h-4 w-4 text-primary" />
              Pay Bill
            </Link>
          </div>
        }
        testId="home-heading"
      />

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard
              label="Recharge history"
              value={isAuthenticated ? (myRecharges.data?.length ?? 0) : "—"}
              hint={isAuthenticated ? "Transactions under this account" : "Sign in to track history"}
              icon={<Receipt className="h-5 w-5 text-primary" />}
              tone="primary"
              testId="home-stat-recharges"
            />
            <StatCard
              label="Bill payments"
              value={isAuthenticated ? (myBills.data?.length ?? 0) : "—"}
              hint={isAuthenticated ? "Payments under this account" : "Sign in to track history"}
              icon={<Wallet className="h-5 w-5 text-primary" />}
              tone="accent"
              testId="home-stat-bills"
            />
          </div>

          <div className="mt-4 rounded-3xl border border-border/70 bg-card/55 p-6 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  Quick Start
                </div>
                <h2 className="mt-2 text-2xl">Choose a flow</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Each flow is designed to be short, clear, and receipt-forward.
                </p>
              </div>
              <div className="hidden sm:grid h-12 w-12 place-items-center rounded-2xl border border-border bg-card shadow-sm">
                <Activity className="h-5 w-5 text-primary" />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
              <Link
                href="/recharge"
                className="group rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                data-testid="home-card-recharge"
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-gradient-to-br from-primary/12 to-accent/10 shadow-sm transition-all group-hover:shadow-md">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Online Recharge</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Select Top-up or Special plans and pay.
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-xs font-semibold text-primary">
                  Start <ArrowRight className="inline h-3.5 w-3.5" />
                </div>
              </Link>

              <Link
                href="/bill-payment"
                className="group rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                data-testid="home-card-bill"
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-gradient-to-br from-accent/12 to-primary/10 shadow-sm transition-all group-hover:shadow-md">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Postpaid Bill</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Fetch mock bill by mobile number and pay.
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-xs font-semibold text-primary">
                  Proceed <ArrowRight className="inline h-3.5 w-3.5" />
                </div>
              </Link>

              <Link
                href="/feedback"
                className="group rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                data-testid="home-card-feedback"
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-muted/40 shadow-sm transition-all group-hover:shadow-md">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Feedback</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Tell us what worked and what didn’t.
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-xs font-semibold text-primary">
                  Write <ArrowRight className="inline h-3.5 w-3.5" />
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="rounded-3xl border border-border/70 bg-card/55 p-6 shadow-sm backdrop-blur">
            <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Admin totals
            </div>
            <h2 className="mt-2 text-2xl">Daily overview</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Visible only if your account has admin access.
            </p>

            {!isAuthenticated ? (
              <div className="mt-6">
                <EmptyState
                  icon={<Shield className="h-6 w-6 text-primary" />}
                  title="Sign in to check access"
                  description="Admin totals appear here after authentication if permitted."
                  action={
                    <Button
                      type="button"
                      onClick={() => (window.location.href = "/api/login")}
                      className="rounded-xl bg-gradient-to-r from-primary to-primary/85 shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
                      data-testid="home-admin-login"
                    >
                      Login
                    </Button>
                  }
                  testId="home-admin-guest"
                />
              </div>
            ) : adminProbe.isLoading ? (
              <div className="mt-6 rounded-2xl border border-border bg-card/60 p-4 text-sm text-muted-foreground" data-testid="home-admin-loading">
                Checking admin access…
              </div>
            ) : adminProbe.isError ? (
              <div className="mt-6 rounded-2xl border border-border bg-card/60 p-4 text-sm text-muted-foreground" data-testid="home-admin-hidden">
                Admin access is not enabled for this account.
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-3" data-testid="home-admin-panel">
                <div className="rounded-2xl border border-border bg-card/60 p-4">
                  <div className="text-xs text-muted-foreground">Date</div>
                  <div className="mt-1 text-sm font-semibold" data-testid="home-admin-date">
                    {adminProbe.data?.date}
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-card/60 p-4">
                  <div className="text-xs text-muted-foreground">Total recharges</div>
                  <div className="mt-1 text-lg font-bold text-primary" data-testid="home-admin-recharge-total">
                    {formatINRFromPaise(adminProbe.data?.totalRechargeAmountPaise)}
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-card/60 p-4">
                  <div className="text-xs text-muted-foreground">Total bills</div>
                  <div className="mt-1 text-lg font-bold text-primary" data-testid="home-admin-bill-total">
                    {formatINRFromPaise(adminProbe.data?.totalBillAmountPaise)}
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-card/60 p-4">
                  <div className="text-xs text-muted-foreground">Transactions</div>
                  <div className="mt-1 text-lg font-bold" data-testid="home-admin-tx-count">
                    {adminProbe.data?.totalTransactions ?? 0}
                  </div>
                </div>

                <Link
                  href="/admin"
                  className="mt-1 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-accent to-accent/85 px-4 py-2 text-sm font-semibold text-accent-foreground shadow-md shadow-accent/15 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/20"
                  data-testid="home-admin-open"
                >
                  Open Admin Panel
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            )}
          </div>

          <div className="mt-4 rounded-3xl border border-border/70 bg-gradient-to-br from-primary/10 via-card/50 to-accent/10 p-6 shadow-sm backdrop-blur">
            <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Status
            </div>
            <h3 className="mt-2 text-xl">Your session</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {authLoading
                ? "Loading your authentication state…"
                : isAuthenticated
                  ? "Authenticated. Your transactions are tied to this session."
                  : "Guest mode. Sign in to save profile and view history."}
            </p>

            {!isAuthenticated ? (
              <div className="mt-4">
                <Button
                  type="button"
                  onClick={() => (window.location.href = "/api/login")}
                  className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/85 shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
                  data-testid="home-login"
                >
                  Login
                </Button>
              </div>
            ) : (
              <div className="mt-4">
                <Link
                  href="/account"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-card/70 px-4 py-2 text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  data-testid="home-open-account"
                >
                  Manage My Account
                  <ArrowRight className="ml-2 h-4 w-4 text-primary" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
