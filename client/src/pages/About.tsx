import Seo from "@/components/Seo";
import PortalShell from "@/components/PortalShell";
import SectionHeading from "@/components/SectionHeading";
import { useAuth } from "@/hooks/use-auth";
import { useAdminOverview } from "@/hooks/use-admin";
import { Award, Shield, Smartphone, Target } from "lucide-react";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function AboutPage() {
  const { isAuthenticated } = useAuth();
  const adminProbe = useAdminOverview(todayISO(), isAuthenticated);
  const adminVisible = !adminProbe.isError && !!adminProbe.data;

  return (
    <PortalShell adminVisible={adminVisible}>
      <Seo title="About Us — Online Mobile Recharge System" description="Learn about our mission and service." />

      <SectionHeading
        eyebrow="About Us"
        title="Our Mission"
        description="Providing fast, secure, and reliable mobile recharge and bill payment services."
        testId="about-heading"
      />

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="reveal-in-up rounded-3xl border border-border/70 bg-card/55 p-6 shadow-sm backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-border bg-gradient-to-br from-primary/12 to-accent/10 shadow-sm">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  Online Mobile Recharge System
                </div>
                <h2 className="mt-1 text-2xl">Who We Are</h2>
              </div>
            </div>

            <div className="mt-5 space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                We are a modern utility portal built to simplify mobile recharges and postpaid bill payments. Our platform is designed with clarity, speed, and security at its core.
              </p>
              <p>
                Every transaction generates a clear receipt that you can print or save for your records. We keep your data secure using session-based authentication through Replit OIDC.
              </p>
              <p>
                Whether you're a guest looking to recharge once or a registered user managing multiple accounts, our flows are designed to be intuitive and fast.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm">
                <div className="flex items-center gap-2 font-semibold">
                  <Target className="h-4 w-4 text-primary" />
                  Our Goal
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Make utility payments as simple as possible with clear workflows and instant receipts.
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm">
                <div className="flex items-center gap-2 font-semibold">
                  <Shield className="h-4 w-4 text-primary" />
                  Your Security
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Session-secure authentication and no hidden charges keep you in control.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="reveal-in-up rounded-3xl border border-border/70 bg-gradient-to-br from-primary/10 via-card/50 to-accent/10 p-6 shadow-sm backdrop-blur" style={{ animationDelay: "90ms" }}>
            <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Key Features
            </div>
            <h3 className="mt-2 text-xl">What We Offer</h3>

            <div className="mt-4 space-y-3">
              {[
                { icon: Smartphone, label: "Prepaid Recharge", desc: "Top-up and special plans" },
                { icon: Award, label: "Postpaid Bills", desc: "Mock bill fetch and payment" },
                { icon: Shield, label: "Account Services", desc: "Profile, DND, caller tunes" },
              ].map((f, idx) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.label}
                    className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm"
                    data-testid={`about-feature-${idx}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-card shadow-sm">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{f.label}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{f.desc}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
