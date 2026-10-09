import * as XLSX from "xlsx";

export type ExcelRow = Record<string, string>;

export function downloadS3Template(filename: string) {
  const s3MediaUrl = import.meta.env.VITE_S3_MEDIA_URL as string | undefined;
  if (s3MediaUrl) {
    const url = `${s3MediaUrl.replace(/\/$/, "")}/templates/${filename}`;
    window.open(url, "_blank");
    return;
  }
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) || "";
  const url = `${apiBaseUrl.replace(/\/$/, "")}/api/v1/admin/templates/${encodeURIComponent(filename)}/download/`;
  window.open(url, "_blank");
}

export function downloadExcelTemplate(headers: readonly string[], filename: string) {
  downloadS3Template(filename);
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
