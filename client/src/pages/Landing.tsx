import { Link } from "wouter";
import { ArrowRight, BadgeCheck, Bolt, Headphones, ShieldCheck, Smartphone, Sparkles, Wallet } from "lucide-react";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

function NavLink(props: { href: string; children: React.ReactNode; testId: string }) {
  return (
    <Link
      href={props.href}
      data-testid={props.testId}
      className={cn(
        "rounded-xl px-3 py-2 text-sm font-semibold text-foreground/80 transition-all duration-200",
        "hover:bg-card/70 hover:text-foreground hover:shadow-sm hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10"
      )}
    >
      {props.children}
    </Link>
  );
}

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-dvh bg-mesh">
      <Seo
        title="Online Mobile Recharge System — Fast Recharge & Bill Payment"
        description="Recharge prepaid numbers, pay postpaid bills, manage services, and track receipts — a calm, secure utility portal."
      />

      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/55 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              className="group flex items-center gap-3 rounded-2xl px-2 py-1 transition-all hover:bg-card/60"
              data-testid="brand-home"
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary/18 to-accent/14 ring-1 ring-border shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-wide text-muted-foreground">
                  Online Mobile Recharge System
                </div>
                <div className="text-lg font-bold">Recharge Portal</div>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              <NavLink href="/recharge" testId="nav-landing-recharge">Online Recharge</NavLink>
              <NavLink href="/account" testId="nav-landing-account">My Account</NavLink>
              <NavLink href="/bill-payment" testId="nav-landing-bill">Post Bill Payment</NavLink>
              <NavLink href="/feedback" testId="nav-landing-feedback">Feedback</NavLink>
              <NavLink href="/site-map" testId="nav-landing-sitemap">Site Map</NavLink>
              <NavLink href="/about" testId="nav-landing-about">About Us</NavLink>
              <NavLink href="/contact" testId="nav-landing-contact">Contact Us</NavLink>
              <NavLink href="/customer-care" testId="nav-landing-care">Customer Care</NavLink>
            </nav>

            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <Link
                  href="/"
                  className="hidden sm:inline-flex rounded-xl border border-border bg-card/70 px-4 py-2 text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  data-testid="landing-go-dashboard"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    className="hidden sm:inline-flex rounded-xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                    onClick={() => (window.location.href = "/api/login")}
                    data-testid="landing-login"
                  >
                    Login
                  </Button>
                  <Link
                    href="/recharge"
                    className="inline-flex rounded-xl bg-gradient-to-r from-primary to-primary/85 px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
                    data-testid="landing-guest"
                  >
                    Continue as guest
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7 reveal-in-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                Calm, secure, and fast payments
              </div>
              <h1 className="mt-5 text-4xl leading-[1.04] sm:text-5xl lg:text-6xl">
                Recharge in seconds.
                <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Receipts that feel official.
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
                A clean utility portal for prepaid recharge, postpaid bill payment, and account
                services — with crisp receipts, history tracking, and admin visibility when enabled.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/recharge"
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-primary/85 px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25"
                  data-testid="landing-cta-recharge"
                >
                  Start Online Recharge
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/bill-payment"
                  className="inline-flex items-center justify-center rounded-2xl border border-border bg-card/70 px-6 py-3 text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  data-testid="landing-cta-bill"
                >
                  Pay Postpaid Bill
                  <Wallet className="ml-2 h-4 w-4 text-primary" />
                </Link>
                {!isAuthenticated ? (
                  <Button
                    type="button"
                    onClick={() => (window.location.href = "/api/login")}
                    className="rounded-2xl bg-gradient-to-r from-accent to-accent/85 text-accent-foreground shadow-lg shadow-accent/15 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/20"
                    data-testid="landing-cta-login"
                  >
                    Login to track history
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : null}
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card/60 px-3 py-1.5 shadow-sm">
                  <BadgeCheck className="h-4 w-4 text-primary" />
                  No hidden charges
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card/60 px-3 py-1.5 shadow-sm">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Session-secure auth
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card/60 px-3 py-1.5 shadow-sm">
                  <Headphones className="h-4 w-4 text-primary" />
                  Customer care support
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 reveal-in-up" style={{ animationDelay: "90ms" }}>
              <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/55 p-6 shadow-[0_30px_120px_-75px_rgba(2,6,23,0.55)] backdrop-blur">
                <div className="absolute inset-0 grain" />
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/18 blur-3xl" />
                <div className="absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-accent/14 blur-3xl" />

                <div className="relative">
                  <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    What you can do
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3">
                    {[
                      { icon: Bolt, title: "Quick recharge flow", desc: "Mobile → plan → payment → receipt." },
                      { icon: Wallet, title: "Postpaid bill payment", desc: "Fetch a mock bill and pay securely." },
                      { icon: ShieldCheck, title: "Account + services", desc: "Update profile, toggle DND & caller tunes." },
                    ].map((f, idx) => {
                      const Icon = f.icon;
                      return (
                        <div
                          key={f.title}
                          className="group rounded-2xl border border-border/70 bg-card/65 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                          data-testid={`landing-feature-${idx}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-gradient-to-br from-primary/12 to-accent/10 shadow-sm transition-all duration-300 group-hover:shadow-md">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold">{f.title}</div>
                              <div className="mt-1 text-xs text-muted-foreground leading-relaxed">{f.desc}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 rounded-2xl border border-border/70 bg-gradient-to-r from-primary/10 via-card/50 to-accent/10 p-4">
                    <div className="text-xs font-semibold text-muted-foreground">Tip</div>
                    <div className="mt-1 text-sm">
                      Use <span className="font-semibold">My Account</span> to store your mobile number and speed up checkout.
                    </div>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <Link
                        href="/account"
                        className="inline-flex items-center justify-center rounded-xl border border-border bg-card/70 px-4 py-2 text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                        data-testid="landing-tip-account"
                      >
                        Open My Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                      <Link
                        href="/site-map"
                        className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary/10"
                        data-testid="landing-tip-sitemap"
                      >
                        View Site Map
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-muted-foreground">
                By continuing, you agree to standard service terms and data handling practices.
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-14">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { k: "Secure sessions", v: "Replit Auth (OIDC)", icon: ShieldCheck },
              { k: "Clean receipts", v: "Print-ready format", icon: BadgeCheck },
              { k: "Support", v: "Customer care ready", icon: Headphones },
            ].map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.k}
                  className="reveal-in-up rounded-2xl border border-border/70 bg-card/55 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                  style={{ animationDelay: `${idx * 80}ms` }}
                  data-testid={`landing-trust-${idx}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-card shadow-sm">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{s.k}</div>
                      <div className="text-xs text-muted-foreground">{s.v}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <footer className="border-t border-border/60 bg-background/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Online Mobile Recharge System. All rights reserved.
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/about"
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-foreground/80 transition-all hover:bg-card/60 hover:text-foreground"
                  data-testid="footer-about"
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-foreground/80 transition-all hover:bg-card/60 hover:text-foreground"
                  data-testid="footer-contact"
                >
                  Contact
                </Link>
                <Link
                  href="/customer-care"
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-foreground/80 transition-all hover:bg-card/60 hover:text-foreground"
                  data-testid="footer-care"
                >
                  Customer Care
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
