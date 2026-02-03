import Seo from "@/components/Seo";
import PortalShell from "@/components/PortalShell";
import SectionHeading from "@/components/SectionHeading";
import { useAuth } from "@/hooks/use-auth";
import { useAdminOverview } from "@/hooks/use-admin";
import { Clock, Headphones, Mail, Phone } from "lucide-react";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function CustomerCarePage() {
  const { isAuthenticated } = useAuth();
  const adminProbe = useAdminOverview(todayISO(), isAuthenticated);
  const adminVisible = !adminProbe.isError && !!adminProbe.data;

  return (
    <PortalShell adminVisible={adminVisible}>
      <Seo title="Customer Care — Online Mobile Recharge System" description="24/7 helpline and support." />

      <SectionHeading
        eyebrow="Customer Care"
        title="We're Here to Help"
        description="Reach our support team anytime for assistance with recharges, bills, or account issues."
        testId="care-heading"
      />

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="reveal-in-up rounded-3xl border border-border/70 bg-gradient-to-br from-primary/10 via-card/50 to-accent/10 p-8 shadow-sm backdrop-blur">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-3xl border border-border bg-card shadow-sm">
                <Headphones className="h-8 w-8 text-primary" />
              </div>
              <div>
                <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  24/7 Support
                </div>
                <h2 className="mt-1 text-3xl">Customer Helpline</h2>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm">
                <div className="flex items-center gap-2 font-semibold">
                  <Phone className="h-5 w-5 text-primary" />
                  Call Us
                </div>
                <div className="mt-3 text-2xl font-mono font-bold text-primary">
                  1800-123-4567
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Toll-free number available 24/7
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm">
                <div className="flex items-center gap-2 font-semibold">
                  <Mail className="h-5 w-5 text-primary" />
                  Email Us
                </div>
                <div className="mt-3 text-lg font-mono font-semibold text-primary">
                  support@mobilerecharge.com
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  We respond within 24 hours
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm">
              <div className="flex items-center gap-2 font-semibold">
                <Clock className="h-5 w-5 text-primary" />
                Operating Hours
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Phone Support</span>
                  <span className="font-semibold">24/7</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email Support</span>
                  <span className="font-semibold">24/7</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Live Chat</span>
                  <span className="font-semibold">9 AM - 9 PM IST</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="reveal-in-up rounded-3xl border border-border/70 bg-card/55 p-6 shadow-sm backdrop-blur" style={{ animationDelay: "90ms" }}>
            <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Quick Help
            </div>
            <h3 className="mt-2 text-xl">Common Questions</h3>

            <div className="mt-4 space-y-3 text-sm">
              {[
                { q: "How do I track my recharge?", a: "Login and visit History to view all transactions." },
                { q: "Can I cancel a recharge?", a: "Contact support immediately after payment for assistance." },
                { q: "Is my payment secure?", a: "Yes, we use session-based auth and encrypted connections." },
              ].map((faq, idx) => (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm"
                  data-testid={`care-faq-${idx}`}
                >
                  <div className="font-semibold">{faq.q}</div>
                  <div className="mt-2 text-xs text-muted-foreground">{faq.a}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
