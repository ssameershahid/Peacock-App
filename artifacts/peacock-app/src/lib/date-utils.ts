export function formatDate(
  date: string | Date,
  style: "short" | "medium" | "long" | "warm" | "warm-long" = "medium"
): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  switch (style) {
    case "short":
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      });
    case "medium":
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    case "long":
      return d.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    case "warm":
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    case "warm-long":
      return d.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
  }
}

export function formatDateRange(
  start: string | Date,
  end: string | Date
): string {
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return `${String(start)} — ${String(end)}`;
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth) {
    return `${s.getDate()} — ${e.getDate()} ${e.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}`;
  }
  const sameYear = s.getFullYear() === e.getFullYear();
  if (sameYear) {
    return `${s.getDate()} ${s.toLocaleDateString("en-GB", { month: "long" })} — ${e.getDate()} ${e.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}`;
  }
  return `${formatDate(s, "warm")} — ${formatDate(e, "warm")}`;
}

export function formatDateRangeWithDay(
  start: string | Date,
  end: string | Date
): string {
  const s = new Date(start);
  const dayOfWeek = s.toLocaleDateString("en-GB", { weekday: "long" });
  return `${dayOfWeek}, ${formatDateRange(start, end)}`;
}

export function daysUntil(date: string | Date): number {
  const d = new Date(date);
  const now = new Date();
  return Math.ceil((d.getTime() - now.getTime()) / 86400000);
}

export function daysAgo(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  if (diff < 14) return "1 week ago";
  if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
  if (diff < 60) return "1 month ago";
  return `${Math.floor(diff / 30)} months ago`;
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  return `${formatDate(d, "medium")} at ${d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function timeAgo(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

export function getAgingStatus(
  date: string | Date
): "fresh" | "warning" | "overdue" {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = diffMs / 3600000;
  if (diffHours < 24) return "fresh";
  if (diffHours < 48) return "warning";
  return "overdue";
}
