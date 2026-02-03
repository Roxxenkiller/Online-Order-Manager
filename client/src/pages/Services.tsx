import { useEffect, useMemo, useState } from "react";
import Seo from "@/components/Seo";
import PortalShell from "@/components/PortalShell";
import SectionHeading from "@/components/SectionHeading";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/hooks/use-auth";
import { useAdminOverview } from "@/hooks/use-admin";
import { useMyServices, useUpdateMyServices } from "@/hooks/use-services";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError, redirectToLogin } from "@/lib/auth-utils";
import { BellOff, Loader2, Music2, Save, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function ServicesPage() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const adminProbe = useAdminOverview(todayISO(), isAuthenticated);
  const adminVisible = !adminProbe.isError && !!adminProbe.data;

  const services = useMyServices(isAuthenticated);
  const update = useUpdateMyServices();

  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [callerTunes, setCallerTunes] = useState(false);

  useEffect(() => {
    if (services.data) {
      setDoNotDisturb(!!services.data.doNotDisturb);
      setCallerTunes(!!services.data.callerTunes);
    }
  }, [services.data]);

  const dirty = useMemo(() => {
    if (!services.data) return false;
    return doNotDisturb !== !!services.data.doNotDisturb || callerTunes !== !!services.data.callerTunes;
  }, [services.data, doNotDisturb, callerTunes]);

  const save = async () => {
    try {
      await update.mutateAsync({ doNotDisturb, callerTunes });
      toast({ title: "Services updated", description: "Your preferences have been saved.", variant: "default" });
    } catch (e) {
      const err = e as Error;
      if (isUnauthorizedError(err)) return redirectToLogin((o) => toast(o));
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    }
  };

  if (authLoading) {
    return (
      <PortalShell adminVisible={false}>
        <Seo title="Services — Online Mobile Recharge System" description="Manage DND and caller tunes." />
        <div className="rounded-3xl border border-border bg-card/60 p-8 text-sm text-muted-foreground flex items-center gap-2" data-testid="services-auth-loading">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      </PortalShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <PortalShell adminVisible={false}>
        <Seo title="Services — Online Mobile Recharge System" description="Login required to manage services." />
        <SectionHeading
          eyebrow="Services"
          title="Login required"
          description="Sign in to manage Do Not Disturb and Caller Tunes."
          testId="services-guest-heading"
          actions={
            <Button
              type="button"
              onClick={() => (window.location.href = "/api/login")}
              className="rounded-xl bg-gradient-to-r from-primary to-primary/85 shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
              data-testid="services-login"
            >
              Login
            </Button>
          }
        />
        <div className="mt-6">
          <EmptyState
            icon={<Settings2 className="h-6 w-6 text-primary" />}
            title="Services are unavailable in guest mode"
            description="Login to manage service toggles and save preferences."
            testId="services-guest-empty"
          />
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell adminVisible={adminVisible}>
      <Seo title="Services — Online Mobile Recharge System" description="Toggle Do Not Disturb and Caller Tunes." />

      <SectionHeading
        eyebrow="Services"
        title="Manage preferences"
        description="Toggle and save your service preferences. Changes apply immediately after saving."
        testId="services-heading"
        actions={
          <Button
            type="button"
            onClick={save}
            disabled={update.isPending || !dirty}
            className="rounded-xl bg-gradient-to-r from-primary to-primary/85 shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            data-testid="services-save"
          >
            {update.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save changes
              </>
            )}
          </Button>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="reveal-in-up rounded-3xl border border-border/70 bg-card/55 p-6 shadow-sm backdrop-blur" data-testid="services-card">
            {services.isLoading ? (
              <div className="rounded-2xl border border-border bg-card/60 p-6 text-sm text-muted-foreground flex items-center gap-2" data-testid="services-loading">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading services…
              </div>
            ) : services.isError ? (
              <div className="rounded-2xl border border-border bg-card/60 p-4 text-sm text-destructive" data-testid="services-error">
                {(services.error as Error).message}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <BellOff className="h-4 w-4 text-primary" />
                        Do Not Disturb
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        Block promotional calls and messages. Service-related notifications may still apply.
                      </div>
                    </div>
                    <Switch
                      checked={doNotDisturb}
                      onCheckedChange={(v) => setDoNotDisturb(!!v)}
                      data-testid="services-dnd"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Music2 className="h-4 w-4 text-primary" />
                        Caller Tunes
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        Enable or disable caller tune service for your number.
                      </div>
                    </div>
                    <Switch
                      checked={callerTunes}
                      onCheckedChange={(v) => setCallerTunes(!!v)}
                      data-testid="services-callerTunes"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-gradient-to-r from-primary/10 via-card/55 to-accent/10 p-4">
                  <div className="text-xs font-semibold text-muted-foreground">Status</div>
                  <div className="mt-2 text-sm" data-testid="services-dirty">
                    {dirty ? (
                      <span className="font-semibold text-primary">You have unsaved changes.</span>
                    ) : (
                      <span className="text-muted-foreground">All changes saved.</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="reveal-in-up rounded-3xl border border-border/70 bg-card/55 p-6 shadow-sm backdrop-blur" style={{ animationDelay: "90ms" }}>
            <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Info
            </div>
            <h3 className="mt-2 text-xl">Service notes</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Preferences are stored per account. If your number changes, update profile details in My Account.
            </p>

            <div className="mt-5">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setDoNotDisturb(!!services.data?.doNotDisturb);
                  setCallerTunes(!!services.data?.callerTunes);
                  toast({ title: "Reverted", description: "Changes reverted to saved values.", variant: "default" });
                }}
                className="w-full rounded-xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                data-testid="services-revert"
              >
                Revert
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
