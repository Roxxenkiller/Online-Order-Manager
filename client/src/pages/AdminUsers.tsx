import Seo from "@/components/Seo";
import PortalShell from "@/components/PortalShell";
import SectionHeading from "@/components/SectionHeading";
import EmptyState from "@/components/EmptyState";
import { useAdminUsers } from "@/hooks/use-admin";
import { Loader2, Shield, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminUsersPage() {
  const q = useAdminUsers(true);

  const adminVisible = !q.isError && !!q.data;

  return (
    <PortalShell adminVisible={adminVisible}>
      <Seo title="Admin Users — Online Mobile Recharge System" description="View registered users." />

      <SectionHeading
        eyebrow="Admin"
        title="Registered Users"
        description="All users who have signed in and may have profiles."
        testId="admin-users-heading"
        actions={
          <Button
            type="button"
            variant="secondary"
            onClick={() => q.refetch()}
            className="rounded-xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            data-testid="admin-users-refresh"
          >
            Refresh
          </Button>
        }
      />

      <div className="mt-6">
        {q.isLoading ? (
          <div className="rounded-3xl border border-border bg-card/60 p-8 text-sm text-muted-foreground flex items-center gap-2" data-testid="admin-users-loading">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading users…
          </div>
        ) : q.isError ? (
          <EmptyState
            icon={<Shield className="h-6 w-6 text-primary" />}
            title="Admin access required"
            description={(q.error as Error).message}
            testId="admin-users-error"
          />
        ) : q.data && q.data.length === 0 ? (
          <EmptyState
            icon={<User2 className="h-6 w-6 text-primary" />}
            title="No users yet"
            description="No registered users in the system."
            testId="admin-users-empty"
          />
        ) : q.data ? (
          <div className="reveal-in-up rounded-3xl border border-border/70 bg-card/55 p-6 shadow-sm backdrop-blur" data-testid="admin-users-panel">
            <div className="overflow-hidden rounded-2xl border border-border bg-card/60">
              <div className="grid grid-cols-12 gap-2 border-b border-border bg-card/70 px-4 py-3 text-xs font-semibold text-muted-foreground">
                <div className="col-span-3">Email</div>
                <div className="col-span-2">Name</div>
                <div className="col-span-2">Mobile</div>
                <div className="col-span-3">Full Name</div>
                <div className="col-span-2">User ID</div>
              </div>
              <div className="divide-y divide-border">
                {q.data.map((u) => (
                  <div key={u.id} className="grid grid-cols-12 gap-2 px-4 py-3 text-sm">
                    <div className="col-span-3 truncate" title={u.email ?? undefined}>
                      {u.email ?? "—"}
                    </div>
                    <div className="col-span-2 truncate">
                      {[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}
                    </div>
                    <div className="col-span-2 font-mono text-xs">
                      {u.mobileNumber ?? "—"}
                    </div>
                    <div className="col-span-3 truncate">
                      {u.fullName ?? "—"}
                    </div>
                    <div className="col-span-2 font-mono text-xs truncate" title={u.id}>
                      {u.id.slice(0, 12)}…
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </PortalShell>
  );
}
