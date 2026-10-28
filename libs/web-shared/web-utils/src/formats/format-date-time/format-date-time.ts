import { readParts } from "./_utils/read-parts/index.js";
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
