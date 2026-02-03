export function formatINRFromPaise(paise: number | null | undefined) {
  const value = Number(paise ?? 0) / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDateTime(dt?: Date | string | null) {
  if (!dt) return "—";
  const d = typeof dt === "string" ? new Date(dt) : dt;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}
