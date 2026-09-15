export function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-PK", {
    timeZone: "Asia/Karachi",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "YYYY-MM-DD" in Pakistan time, for <input type="date">. */
export function dateInputValue(iso?: string) {
  if (!iso) return "";
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Karachi", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(
    new Date(iso),
  );
  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** 1,284 / 12,900 / 1.2M: full numbers until 100,000, then compact. */
export function formatNumber(value: number) {
  return value >= 100_000
    ? new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)
    : value.toLocaleString("en-PK");
}

/** "2026-09" -> "September 2026" */
export function formatMonth(month: string) {
  return new Date(`${month}-15T12:00:00+05:00`).toLocaleDateString("en-PK", { month: "long", year: "numeric", timeZone: "Asia/Karachi" });
}

export function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("en-PK", { timeZone: "Asia/Karachi", day: "numeric", month: "short", year: "numeric" });
}

/** wa.me link for a Pakistani or international number, e.g. 0300-1234567 -> 923001234567. */
export function whatsappLink(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("03")) digits = `92${digits.slice(1)}`;
  else if (digits.length === 10 && digits.startsWith("3")) digits = `92${digits}`;
  return `https://wa.me/${digits}`;
}
