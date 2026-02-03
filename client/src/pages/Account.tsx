import { useEffect, useMemo, useState } from "react";
import Seo from "@/components/Seo";
import PortalShell from "@/components/PortalShell";
import SectionHeading from "@/components/SectionHeading";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/hooks/use-auth";
import { useAdminOverview } from "@/hooks/use-admin";
import { useMyProfile, useUpsertMyProfile } from "@/hooks/use-profile";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError, redirectToLogin } from "@/lib/auth-utils";
import { Loader2, Save, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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

export default function AccountPage() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const adminProbe = useAdminOverview(todayISO(), isAuthenticated);
  const adminVisible = !adminProbe.isError && !!adminProbe.data;

  const profile = useMyProfile(isAuthenticated);
  const upsert = useUpsertMyProfile();

  const [mobileNumber, setMobileNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (profile.data) {
      setMobileNumber(profile.data.mobileNumber ?? "");
      setFullName(profile.data.fullName ?? "");
      setAddress(profile.data.address ?? "");
    }
  }, [profile.data]);

  const canSave = useMemo(() => {
    if (!mobileNumber) return false;
    return mobileValid(mobileNumber);
  }, [mobileNumber]);

  const save = async () => {
    if (!canSave) {
      toast({ title: "Invalid mobile number", description: "Mobile number must be 10 digits.", variant: "destructive" });
      return;
    }
    try {
      await upsert.mutateAsync({
        mobileNumber,
        fullName: fullName.trim() || null,
        address: address.trim() || null,
      } as any);
      toast({ title: "Profile saved", description: "Your account details are updated.", variant: "default" });
    } catch (e) {
      const err = e as Error;
      if (isUnauthorizedError(err)) return redirectToLogin((o) => toast(o));
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
  };

  if (authLoading) {
    return (
      <PortalShell adminVisible={false}>
        <Seo title="My Account — Online Mobile Recharge System" description="Manage your profile details." />
        <div className="rounded-3xl border border-border bg-card/60 p-8 text-sm text-muted-foreground flex items-center gap-2" data-testid="account-auth-loading">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      </PortalShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <PortalShell adminVisible={false}>
        <Seo title="My Account — Online Mobile Recharge System" description="Login required to view account details." />
        <SectionHeading
          eyebrow="My Account"
          title="Login required"
          description="Sign in to manage profile details, services, and transaction history."
          testId="account-guest-heading"
          actions={
            <Button
              type="button"
              onClick={() => (window.location.href = "/api/login")}
              className="rounded-xl bg-gradient-to-r from-primary to-primary/85 shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
              data-testid="account-login"
            >
              Login
            </Button>
          }
        />
        <div className="mt-6">
          <EmptyState
            icon={<User2 className="h-6 w-6 text-primary" />}
            title="Account features are locked"
            description="Login to save your mobile number and speed up future payments."
            testId="account-guest-empty"
          />
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell adminVisible={adminVisible}>
      <Seo title="My Account — Online Mobile Recharge System" description="Update your profile: mobile number, full name, and address." />

      <SectionHeading
        eyebrow="My Account"
        title="Profile details"
        description="Store your mobile number to speed up transactions, and keep your account details current."
        testId="account-heading"
        actions={
          <Button
            type="button"
            onClick={save}
            disabled={upsert.isPending}
            className="rounded-xl bg-gradient-to-r from-primary to-primary/85 shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            data-testid="account-save"
          >
            {upsert.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="reveal-in-up rounded-3xl border border-border/70 bg-card/55 p-6 shadow-sm backdrop-blur" data-testid="account-form-card">
            {profile.isLoading ? (
              <div className="rounded-2xl border border-border bg-card/60 p-6 text-sm text-muted-foreground flex items-center gap-2" data-testid="account-profile-loading">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading profile…
              </div>
            ) : profile.isError ? (
              <div className="rounded-2xl border border-border bg-card/60 p-4 text-sm text-destructive" data-testid="account-profile-error">
                {(profile.error as Error).message}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <label className="text-xs font-semibold text-muted-foreground">Mobile number</label>
                  <Input
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                    placeholder="10-digit number"
                    inputMode="numeric"
                    className="mt-2 h-12 rounded-2xl bg-card/70 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    data-testid="account-mobile"
                  />
                  <div className="mt-2 text-xs text-muted-foreground" data-testid="account-mobile-hint">
                    Required. Must be 10 digits.
                  </div>
                </div>

                <div className="sm:col-span-1">
                  <label className="text-xs font-semibold text-muted-foreground">Full name (optional)</label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full name"
                    className="mt-2 h-12 rounded-2xl bg-card/70 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    data-testid="account-fullName"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground">Address (optional)</label>
                  <Textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House / street / city"
                    className="mt-2 min-h-[120px] rounded-2xl bg-card/70 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    data-testid="account-address"
                  />
                </div>

                <div className="sm:col-span-2 rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card/60 to-accent/10 p-4">
                  <div className="text-xs font-semibold text-muted-foreground">Validation</div>
                  <div className="mt-2 text-sm" data-testid="account-validation">
                    {mobileNumber
                      ? mobileValid(mobileNumber)
                        ? <span className="font-semibold text-primary">Mobile number is valid.</span>
                        : <span className="font-semibold text-destructive">Mobile number must be 10 digits.</span>
                      : <span className="text-muted-foreground">Enter a mobile number to validate.</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="reveal-in-up rounded-3xl border border-border/70 bg-card/55 p-6 shadow-sm backdrop-blur" style={{ animationDelay: "90ms" }}>
            <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Why store this?
            </div>
            <h3 className="mt-2 text-xl">Faster checkout</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Keeping a verified mobile number helps prefill flows and provides a consistent reference for receipts.
            </p>

            <div className="mt-5">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setMobileNumber(profile.data?.mobileNumber ?? "");
                  setFullName(profile.data?.fullName ?? "");
                  setAddress(profile.data?.address ?? "");
                  toast({ title: "Reverted", description: "Form restored from saved profile.", variant: "default" });
                }}
                className="w-full rounded-xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                data-testid="account-revert"
              >
                Revert changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
