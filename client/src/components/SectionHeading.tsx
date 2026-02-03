import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function SectionHeading(props: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  testId?: string;
}) {
  const { eyebrow, title, description, actions, testId } = props;

  return (
    <div className="reveal-in-up" data-testid={testId}>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          {eyebrow ? (
            <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              {eyebrow}
            </div>
          ) : null}
          <h1 className={cn("mt-2 text-3xl sm:text-4xl")}>{title}</h1>
          {description ? (
            <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      <div className="mt-5 h-px w-full bg-gradient-to-r from-border/30 via-border to-border/30" />
    </div>
  );
}
