/** Format a Date (or null) to a yyyy-mm-dd string for <input type="date">. */
export function toDateInput(d: Date | null | undefined): string {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

/**
 * Human-friendly date, e.g. "5 Aug 2026".
 *
 * Locale and timeZone are pinned so server (Node) and client (browser) always
 * produce the identical string — otherwise the runtime-default locale/timezone
 * differs between the two and React throws a hydration mismatch.
 */
export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function timeAgo(d: Date | string): string {
  const date = new Date(d);
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  const units: [number, string][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [30, "day"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];
  const value = secs;
  let unit = "second";
  let acc = 1;
  for (const [size, name] of units) {
    if (Math.abs(value) < size * acc) {
      unit = name;
      break;
    }
    acc *= size;
    unit = name;
  }
  const amount = Math.floor(value / acc);
  if (amount <= 0) return "just now";
  return `${amount} ${unit}${amount === 1 ? "" : "s"} ago`;
}
