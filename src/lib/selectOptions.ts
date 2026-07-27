// Builds label/id pairs for a native <select>, disambiguating entries whose
// display label collides (e.g. multiple therapists with no name on record
// all falling back to the same "Unassigned"-style label) so a chosen label
// always maps back to exactly one id.
export function buildUniqueOptions<T>(
  items: T[],
  labelFor: (item: T) => string,
  idFor: (item: T) => string
): { label: string; id: string }[] {
  const baseLabels = items.map(labelFor);
  const counts = new Map<string, number>();
  baseLabels.forEach((label) => counts.set(label, (counts.get(label) ?? 0) + 1));

  const seen = new Map<string, number>();
  return items.map((item, index) => {
    const base = baseLabels[index];
    const id = idFor(item);
    if ((counts.get(base) ?? 0) <= 1) return { label: base, id };
    const occurrence = (seen.get(base) ?? 0) + 1;
    seen.set(base, occurrence);
    return { label: `${base} (#${id.slice(0, 4)})`, id };
  });
}
