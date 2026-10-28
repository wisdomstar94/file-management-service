export function isValidPeriod(value: { availableFrom?: string | null; availableUntil?: string | null }): boolean {
  if (!value.availableFrom || !value.availableUntil) {
    return true;
  }
  return new Date(value.availableFrom) <= new Date(value.availableUntil);
}
