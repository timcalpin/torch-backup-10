import * as XLSX from "xlsx";

export type ExcelRow = Record<string, string>;

export function downloadExcelTemplate(headers: readonly string[], filename: string) {
  const worksheet = XLSX.utils.aoa_to_sheet([headers]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
  XLSX.writeFile(workbook, filename);
}

export async function readExcelRows(file: File): Promise<ExcelRow[]> {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json<ExcelRow>(sheet, { defval: "", raw: false });
}

export function excelRowsToCsvFile(
  headers: readonly string[],
  rows: ExcelRow[],
  filename: string
): File {
  const escape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escape(row[header])).join(",")),
  ].join("\r\n");
  return new File([csv], filename, { type: "text/csv;charset=utf-8" });
}
