const TIME_ZONE = "Asia/Seoul";

function readParts(iso: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

/** `2026-10-03` (한국 시간) */
export function formatDate(iso: string): string {
  const p = readParts(iso);
  return `${p.year}-${p.month}-${p.day}`;
}

/** `2026-10-03 09:41` (한국 시간). `withSeconds` 면 초까지 */
export function formatDateTime(iso: string, withSeconds = false): string {
  const p = readParts(iso);
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}${withSeconds ? `:${p.second}` : ""}`;
}
