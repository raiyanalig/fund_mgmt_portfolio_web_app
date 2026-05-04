/**
 * Format a number as Indian Rupees.
 * e.g. 1500000 → ₹15,00,000
 */
export function formatINR(value) {
  if (value == null) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage with 2 decimal places.
 */
export function formatPct(value) {
  if (value == null) return "0.00%";
  const sign = value > 0 ? "+" : "";
  return `${sign}${Number(value).toFixed(2)}%`;
}

/**
 * Return Tailwind classes for action badge.
 */
export function actionStyle(action) {
  switch (action) {
    case "BUY":
      return {
        badge: "bg-emerald-100 text-emerald-800 border border-emerald-200",
        text: "text-emerald-700",
        row: "hover:bg-emerald-50/30",
      };
    case "SELL":
      return {
        badge: "bg-red-100 text-red-800 border border-red-200",
        text: "text-red-700",
        row: "hover:bg-red-50/30",
      };
    case "REVIEW":
      return {
        badge: "bg-amber-100 text-amber-800 border border-amber-200",
        text: "text-amber-700",
        row: "hover:bg-amber-50/30",
      };
    case "HOLD":
      return {
        badge: "bg-slate-100 text-slate-700 border border-slate-200",
        text: "text-slate-600",
        row: "hover:bg-slate-50/30",
      };
    default:
      return {
        badge: "bg-gray-100 text-gray-700",
        text: "text-gray-600",
        row: "",
      };
  }
}

/**
 * Format ISO date string to readable locale date.
 */
export function formatDate(isoString) {
  return new Date(isoString).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Return Tailwind classes for session status badge.
 */
export function statusStyle(status) {
  switch (status) {
    case "APPLIED":
      return "bg-emerald-100 text-emerald-800 border border-emerald-200";
    case "DISMISSED":
      return "bg-red-100 text-red-800 border border-red-200";
    default:
      return "bg-amber-100 text-amber-800 border border-amber-200";
  }
}
