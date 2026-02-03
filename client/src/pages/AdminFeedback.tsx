import Seo from "@/components/Seo";
import PortalShell from "@/components/PortalShell";
import SectionHeading from "@/components/SectionHeading";
import EmptyState from "@/components/EmptyState";
import { formatDateTime } from "@/components/Money";
import { useAdminFeedback } from "@/hooks/use-feedback";
import { Loader2, MessageSquareText, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminFeedbackPage() {
  const q = useAdminFeedback(true);

  const adminVisible = !q.isError && !!q.data;

  return (
    <PortalShell adminVisible={adminVisible}>
      <Seo title="Admin Feedback — Online Mobile Recharge System" description="View user feedback." />

      <SectionHeading
        eyebrow="Admin"
        title="Feedback"
        description="All feedback submissions from users and guests."
        testId="admin-feedback-heading"
        actions={
          <Button
            type="button"
            variant="secondary"
            onClick={() => q.refetch()}
            className="rounded-xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            data-testid="admin-feedback-refresh"
          >
            Refresh
          </Button>
        }
      />

      <div className="mt-6">
        {q.isLoading ? (
          <div className="rounded-3xl border border-border bg-card/60 p-8 text-sm text-muted-foreground flex items-center gap-2" data-testid="admin-feedback-loading">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading feedback…
          </div>
        ) : q.isError ? (
          <EmptyState
            icon={<Shield className="h-6 w-6 text-primary" />}
            title="Admin access required"
            description={(q.error as Error).message}
            testId="admin-feedback-error"
          />
        ) : q.data && q.data.length === 0 ? (
          <EmptyState
            icon={<MessageSquareText className="h-6 w-6 text-primary" />}
            title="No feedback yet"
            description="No feedback submissions in the system."
            testId="admin-feedback-empty"
          />
        ) : q.data ? (
          <div className="grid grid-cols-1 gap-4" data-testid="admin-feedback-panel">
            {q.data.map((f) => (
              <div
                key={f.id}
                className="reveal-in-up rounded-3xl border border-border/70 bg-card/55 p-6 shadow-sm backdrop-blur"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground">
                      {formatDateTime(f.createdAt as any)}
                    </div>
                    <div className="mt-2">
                      <span className="text-sm font-semibold">
                        {f.name || "Anonymous"}
                      </span>
                      {f.email ? (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {f.email}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-card shadow-sm">
                    <MessageSquareText className="h-4 w-4 text-primary" />
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-border bg-card/60 p-4">
                  <div className="text-sm leading-relaxed">{f.message}</div>
                </div>

                {f.userId ? (
                  <div className="mt-3 text-xs text-muted-foreground">
                    User ID: <span className="font-mono">{f.userId}</span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </PortalShell>
  );
}
