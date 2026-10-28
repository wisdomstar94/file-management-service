export function isValidFixedVersion(value: {
  defaultVersionMode?: "FOLLOW_DOCUMENT" | "FIXED";
  fixedVersionId?: string | null;
}): boolean {
  return value.defaultVersionMode !== "FIXED" || !!value.fixedVersionId;
}
