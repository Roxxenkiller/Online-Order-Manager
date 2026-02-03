import { useMemo, useState } from "react";
import Seo from "@/components/Seo";
import PortalShell from "@/components/PortalShell";
import SectionHeading from "@/components/SectionHeading";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/hooks/use-auth";
import { useAdminOverview } from "@/hooks/use-admin";
import { useCreateFeedback } from "@/hooks/use-feedback";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Loader2, MessageSquareText, Send, Sparkles } from "lucide-react";
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

export default function FeedbackPage() {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  const adminProbe = useAdminOverview(todayISO(), isAuthenticated);
  const adminVisible = !adminProbe.isError && !!adminProbe.data;

  const create = useCreateFeedback();

  const [name, setName] = useState<string>([user?.firstName, user?.lastName].filter(Boolean).join(" ").trim());
  const [email, setEmail] = useState<string>(user?.email ?? "");
  const [message, setMessage] = useState<string>("");

  const canSubmit = useMemo(() => message.trim().length >= 5, [message]);

  const submit = async () => {
    if (!canSubmit) {
      toast({ title: "Message is too short", description: "Please provide at least 5 characters.", variant: "destructive" });
      return;
    }
    try {
      await create.mutateAsync({
        name: name.trim() || null,
        email: email.trim() || null,
        message: message.trim(),
      } as any);
      toast({ title: "Feedback sent", description: "Thank you for helping us improve.", variant: "default" });
      setMessage("");
    } catch (e) {
      toast({ title: "Failed to send", description: (e as Error).message, variant: "destructive" });
    }
  };

  return (
    <PortalShell adminVisible={adminVisible}>
      <Seo
        title="Feedback — Online Mobile Recharge System"
        description="Send feedback or suggestions. Works in guest mode and logged-in mode."
      />

      <SectionHeading
        eyebrow="Support"
        title="Feedback"
        description="Send suggestions, report issues, or share what you’d like improved. Messages are stored for review."
        testId="feedback-heading"
      />

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="reveal-in-up rounded-3xl border border-border/70 bg-card/55 p-6 shadow-sm backdrop-blur" data-testid="feedback-form-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  Form
                </div>
                <h2 className="mt-2 text-2xl">Tell us what you think</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  If you’re logged in, we’ll prefill details when available. Message is required.
                </p>
              </div>
              <div className="hidden sm:grid h-12 w-12 place-items-center rounded-2xl border border-border bg-card shadow-sm">
                <MessageSquareText className="h-5 w-5 text-primary" />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Name (optional)</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="mt-2 h-12 rounded-2xl bg-card/70 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  data-testid="feedback-name"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Email (optional)</label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  className="mt-2 h-12 rounded-2xl bg-card/70 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  data-testid="feedback-email"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">Message</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your feedback…"
                  className={cn(
                    "mt-2 min-h-[160px] rounded-2xl bg-card/70 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all",
                    "leading-relaxed"
                  )}
                  data-testid="feedback-message"
                />
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <div data-testid="feedback-charcount">{message.trim().length} characters</div>
                  <div>Minimum 5 characters</div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setMessage("")}
                className="rounded-xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                data-testid="feedback-clear"
              >
                Clear
              </Button>
              <Button
                type="button"
                onClick={submit}
                disabled={create.isPending}
                className="rounded-xl bg-gradient-to-r from-primary to-primary/85 shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                data-testid="feedback-submit"
              >
                {create.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Feedback
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="reveal-in-up rounded-3xl border border-border/70 bg-gradient-to-br from-primary/10 via-card/55 to-accent/10 p-6 shadow-sm backdrop-blur" style={{ animationDelay: "90ms" }}>
            <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Guidance
            </div>
            <h3 className="mt-2 text-xl">Make it actionable</h3>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              {[
                "If a transaction failed, include the mobile number and approximate time.",
                "For UI issues, mention the page and what you expected to happen.",
                "For feature requests, describe the workflow you want to speed up.",
              ].map((t, i) => (
                <div
                  key={t}
                  className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm"
                  data-testid={`feedback-tip-${i}`}
                >
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Tip {i + 1}
                  </div>
                  <div className="mt-2 text-sm">{t}</div>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <EmptyState
                icon={<MessageSquareText className="h-6 w-6 text-primary" />}
                title="We read every message"
                description="Feedback is reviewed and prioritized regularly."
                testId="feedback-empty-note"
              />
            </div>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
