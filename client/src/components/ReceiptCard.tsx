import { Printer, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatINRFromPaise } from "@/components/Money";

export default function ReceiptCard(props: {
  title: string;
  transactionId: string;
  mobileNumber: string;
  amountPaise: number;
  createdAt: string | Date;
  lines?: { label: string; value: string }[];
  onCancel: () => void;
  testId?: string;
}) {
  const { title, transactionId, mobileNumber, amountPaise, createdAt, lines, onCancel, testId } = props;

  const handlePrint = () => window.print();

  return (
    <div
      className="reveal-in-up relative overflow-hidden rounded-3xl border border-border/70 bg-card/60 shadow-[0_30px_120px_-80px_rgba(2,6,23,0.55)] backdrop-blur"
      data-testid={testId}
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
      <div className="p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Receipt
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Save or print this page for your records.
            </p>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <Button
              type="button"
              variant="secondary"
              onClick={handlePrint}
              className="rounded-xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              data-testid="receipt-print"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onCancel}
              className="rounded-xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              data-testid="receipt-cancel"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card/60 p-4">
            <div className="text-xs font-semibold text-muted-foreground">Transaction ID</div>
            <div className="mt-2 font-mono text-sm sm:text-base" data-testid="receipt-transactionId">
              {transactionId}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card/60 p-4">
            <div className="text-xs font-semibold text-muted-foreground">Date & Time</div>
            <div className="mt-2 text-sm sm:text-base" data-testid="receipt-createdAt">
              {formatDateTime(createdAt)}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card/60 p-4">
            <div className="text-xs font-semibold text-muted-foreground">Mobile Number</div>
            <div className="mt-2 text-sm sm:text-base" data-testid="receipt-mobileNumber">
              {mobileNumber}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card/60 p-4">
            <div className="text-xs font-semibold text-muted-foreground">Amount</div>
            <div className="mt-2 text-lg font-bold text-primary" data-testid="receipt-amount">
              {formatINRFromPaise(amountPaise)}
            </div>
          </div>
        </div>

        {lines?.length ? (
          <div className="mt-6 rounded-2xl border border-border bg-card/50 p-4">
            <div className="text-xs font-semibold tracking-wide text-muted-foreground">
              Details
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {lines.map((l) => (
                <div key={l.label} className="rounded-xl border border-border/60 bg-card/60 p-3">
                  <div className="text-xs text-muted-foreground">{l.label}</div>
                  <div className="mt-1 text-sm font-semibold">{l.value}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
