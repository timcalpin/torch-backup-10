/** Shared sobriety date normalization and day-counting for admin screens. */
export function normalizeSobrietyDate(
  value: string | null | undefined,
): string {
  if (!value) return "";

  // Preserve the calendar date from ISO values; parsing it as a Date can
  // shift it across a day in some browser time zones.
  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})/)?.[0];
  if (dateOnly) return dateOnly;

  const dayFirst = value.match(/^(\d{2})[-/]\s?(\d{2})[-/]\s?(\d{4})$/);
  if (dayFirst) {
    return `${dayFirst[3]}-${dayFirst[2]}-${dayFirst[1]}`;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
}

export function daysSoberFromDate(
  value: string | null | undefined,
): number | null {
  const sobrietyDate = normalizeSobrietyDate(value);
  const match = sobrietyDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const start = Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  if (!Number.isFinite(start) || start > today) return 0;
  return Math.floor((today - start) / 86400000);
}
