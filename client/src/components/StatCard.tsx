import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function StatCard(props: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "primary" | "accent" | "muted";
  testId?: string;
}) {
  const { label, value, hint, icon, tone = "muted", testId } = props;

  const toneClasses =
    tone === "primary"
      ? "from-primary/14 to-primary/5 ring-primary/15"
      : tone === "accent"
        ? "from-accent/14 to-accent/5 ring-accent/15"
        : "from-muted/70 to-card/40 ring-border/60";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br p-5 shadow-sm transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-md",
        toneClasses
      )}
      data-testid={testId}
    >
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-opacity duration-300 group-hover:opacity-90" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold tracking-wide text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 text-2xl font-bold leading-tight">{value}</div>
          {hint ? (
            <div className="mt-2 text-xs text-muted-foreground">{hint}</div>
          ) : null}
        </div>
        {icon ? (
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-border bg-card/65 shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
