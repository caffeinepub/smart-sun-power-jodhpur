/**
 * Format a number as Indian currency (₹ with lakhs/thousands separators)
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a date string (YYYY-MM-DD) for display
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}
