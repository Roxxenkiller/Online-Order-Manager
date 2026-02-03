import Seo from "@/components/Seo";
import PortalShell from "@/components/PortalShell";
import SectionHeading from "@/components/SectionHeading";
import { useAuth } from "@/hooks/use-auth";
import { useAdminOverview } from "@/hooks/use-admin";
import { Mail, MapPin, Phone } from "lucide-react";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function ContactPage() {
  const { isAuthenticated } = useAuth();
  const adminProbe = useAdminOverview(todayISO(), isAuthenticated);
  const adminVisible = !adminProbe.isError && !!adminProbe.data;

  return (
    <PortalShell adminVisible={adminVisible}>
      <Seo title="Contact Us — Online Mobile Recharge System" description="Get in touch with our mobile centers." />

      <SectionHeading
        eyebrow="Contact Us"
        title="Our Centers"
        description="Reach out to any of our mobile centers for assistance."
        testId="contact-heading"
      />

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            name: "Mumbai Center",
            address: "123 MG Road, Andheri East, Mumbai, Maharashtra 400069",
            phone: "+91 22 1234 5678",
            email: "mumbai@mobilerecharge.com",
          },
          {
            name: "Delhi Center",
            address: "456 Connaught Place, New Delhi, Delhi 110001",
            phone: "+91 11 2345 6789",
            email: "delhi@mobilerecharge.com",
          },
          {
            name: "Bangalore Center",
            address: "789 MG Road, Koramangala, Bangalore, Karnataka 560034",
            phone: "+91 80 3456 7890",
            email: "bangalore@mobilerecharge.com",
          },
        ].map((center, idx) => (
          <div
            key={center.name}
            className="reveal-in-up rounded-3xl border border-border/70 bg-card/55 p-6 shadow-sm backdrop-blur"
            style={{ animationDelay: `${idx * 80}ms` }}
            data-testid={`contact-center-${idx}`}
          >
            <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Center
            </div>
            <h3 className="mt-2 text-xl">{center.name}</h3>

            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm">
                <MapPin className="h-5 w-5 text-primary" />
                <div className="text-sm text-muted-foreground leading-relaxed">
                  {center.address}
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm">
                <Phone className="h-5 w-5 text-primary" />
                <div className="text-sm font-mono">{center.phone}</div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm">
                <Mail className="h-5 w-5 text-primary" />
                <div className="text-sm font-mono">{center.email}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PortalShell>
  );
}
