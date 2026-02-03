import Seo from "@/components/Seo";
import PortalShell from "@/components/PortalShell";
import SectionHeading from "@/components/SectionHeading";
import { useAuth } from "@/hooks/use-auth";
import { useAdminOverview } from "@/hooks/use-admin";
import { Link } from "wouter";
import { ArrowRight, FileText, LayoutDashboard, MessageSquareText, Receipt, Settings2, Shield, Smartphone, User2, Wallet } from "lucide-react";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function SiteMapPage() {
  const { isAuthenticated } = useAuth();
  const adminProbe = useAdminOverview(todayISO(), isAuthenticated);
  const adminVisible = !adminProbe.isError && !!adminProbe.data;

  const sections = [
    {
      title: "Quick Actions",
      links: [
        { href: "/recharge", label: "Online Recharge", icon: Smartphone },
        { href: "/bill-payment", label: "Post Bill Payment", icon: Wallet },
        { href: "/feedback", label: "Feedback", icon: MessageSquareText },
      ],
    },
    {
      title: "Account",
      links: [
        { href: "/account", label: "My Account", icon: User2 },
        { href: "/services", label: "Services", icon: Settings2 },
        { href: "/history", label: "History", icon: Receipt },
      ],
    },
    {
      title: "Information",
      links: [
        { href: "/about", label: "About Us", icon: FileText },
        { href: "/contact", label: "Contact Us", icon: FileText },
        { href: "/customer-care", label: "Customer Care", icon: FileText },
      ],
    },
  ];

  if (adminVisible) {
    sections.push({
      title: "Admin",
      links: [
        { href: "/admin", label: "Admin Overview", icon: Shield },
        { href: "/admin/transactions", label: "Transactions", icon: Receipt },
        { href: "/admin/users", label: "Users", icon: User2 },
        { href: "/admin/feedback", label: "Feedback", icon: MessageSquareText },
      ],
    });
  }

  return (
    <PortalShell adminVisible={adminVisible}>
      <Seo title="Site Map — Online Mobile Recharge System" description="Navigate all pages on the portal." />

      <SectionHeading
        eyebrow="Site Map"
        title="All Pages"
        description="A complete overview of every page and feature available in the portal."
        testId="sitemap-heading"
      />

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((sec, secIdx) => (
          <div
            key={sec.title}
            className="reveal-in-up rounded-3xl border border-border/70 bg-card/55 p-6 shadow-sm backdrop-blur"
            style={{ animationDelay: `${secIdx * 80}ms` }}
            data-testid={`sitemap-section-${secIdx}`}
          >
            <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              {sec.title}
            </div>

            <div className="mt-4 space-y-2">
              {sec.links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/70 p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                    data-testid={`sitemap-link-${link.href}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="grid h-8 w-8 place-items-center rounded-xl border border-border bg-card shadow-sm">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-semibold">{link.label}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        <div className="reveal-in-up rounded-3xl border border-border/70 bg-gradient-to-br from-primary/10 via-card/50 to-accent/10 p-6 shadow-sm backdrop-blur" style={{ animationDelay: `${sections.length * 80}ms` }}>
          <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Tip
          </div>
          <h3 className="mt-2 text-xl">Navigate Quickly</h3>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Use the sidebar navigation to jump to any section. Guest users can browse and make transactions without signing in.
          </p>

          <div className="mt-5">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full rounded-xl border border-border bg-card/70 px-4 py-2 text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              data-testid="sitemap-home"
            >
              <LayoutDashboard className="mr-2 h-4 w-4 text-primary" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
