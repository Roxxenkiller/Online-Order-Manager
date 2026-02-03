import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function EmptyState(props: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  testId?: string;
}) {
  const { icon, title, description, action, testId } = props;

  return (
    <div
      className={cn(
        "reveal-in-up rounded-3xl border border-border/70 bg-card/55 p-8 text-center shadow-sm backdrop-blur",
        "mx-auto max-w-2xl"
      )}
      data-testid={testId}
    >
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-border bg-card shadow-sm">
        {icon}
      </div>
      <h3 className="mt-4 text-xl">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
