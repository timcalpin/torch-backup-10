export interface CsvRow {
  row: number;
  values: Record<string, string>;
}

function parseLine(line: string): string[] {
  const values: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') { value += '"'; index += 1; }
      else quoted = !quoted;
    } else if (character === "," && !quoted) {
      values.push(value.trim()); value = "";
    } else value += character;
  }
  values.push(value.trim());
  return values;
}

export function parseCsv(text: string): CsvRow[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const headers = parseLine(lines[0]).map((header) => header.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""));
  return lines.slice(1).map((line, index) => ({
    row: index + 2,
    values: parseLine(line).reduce<Record<string, string>>((result, value, column) => {
      if (headers[column]) result[headers[column]] = value;
      return result;
    }, {}),
  }));
}
