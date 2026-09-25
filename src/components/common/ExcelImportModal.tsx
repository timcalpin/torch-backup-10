import { useRef, useState } from "react";
import { AlertTriangle, CloudDownload, CloudUpload, Loader2, X } from "lucide-react";
import { ModalCard, ModalOverlay } from "./Modal";
import { downloadExcelTemplate } from "@/lib/excel";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function ExcelImportModal({
  title, subtitle, templateHeaders, templateFilename, templateUrl, actionLabel, helperText, onClose, onUpload,
}: {
  title: string;
  subtitle: string;
  templateHeaders: readonly string[];
  templateFilename: string;
  templateUrl?: string;
  actionLabel: string;
  helperText: string;
  onClose: () => void;
  onUpload: (file: File) => Promise<boolean | void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chooseFile = (next: File | undefined) => {
    setError(null);
    if (!next) return;
    if (!next.name.toLowerCase().endsWith(".xlsx")) return setError("Only .xlsx files are accepted.");
    if (next.size > MAX_FILE_SIZE) return setError("The file must be 10 MB or smaller.");
    setFile(next);
  };

  const submit = async () => {
    if (!file) return setError("Please select an .xlsx file.");
    setUploading(true); setError(null);
    try {
      const uploaded = await onUpload(file);
      if (uploaded !== false) onClose();
    }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to upload the Excel file."); }
    finally { setUploading(false); }
  };

  return (
    <ModalOverlay onClose={() => !uploading && onClose()}>
      <ModalCard className="w-[min(420px,calc(100vw-32px))] rounded-[18px] p-[24px] text-[var(--app-text)]">
        <div className="mb-[18px] flex items-center justify-between">
          <div><p className="text-[20px] font-bold">{title}</p><p className="mt-[3px] text-[10px] text-[var(--app-muted)]">{subtitle}</p></div>
          <button type="button" onClick={onClose} disabled={uploading} aria-label="Close"><X size={16} /></button>
        </div>

        <div className="rounded-[7px] border border-[#b72e32] bg-[rgba(183,46,50,0.12)] px-[12px] py-[10px] text-[11px]"><AlertTriangle size={15} className="mr-[7px] inline text-[#ef464b]" />Demo and UAT purposes only. Never use this on production.</div>

        <button type="button" onClick={() => templateUrl ? window.open(templateUrl, "_blank", "noopener,noreferrer") : downloadExcelTemplate(templateHeaders, templateFilename)} className="mt-[18px] flex min-h-[44px] w-full items-center justify-center gap-[7px] rounded-[8px] border border-[#f37422] bg-[rgba(243,116,34,0.1)] text-[11px] font-semibold text-[#f37422] hover:bg-[rgba(243,116,34,0.18)]"><CloudDownload size={15} />Download template</button>
        <p className="mt-[6px] text-center text-[9px] text-[var(--app-muted)]">{helperText}</p>
        <input ref={inputRef} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="hidden" onChange={(event) => chooseFile(event.target.files?.[0])} />
        <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()} className="mt-[18px] flex min-h-[100px] w-full flex-col items-center justify-center rounded-[8px] border border-dashed border-[var(--app-border)] text-[11px] hover:border-[#f37422]"><CloudUpload size={20} className="mb-[6px] text-[#f37422]" /><span>{file?.name ?? "Choose an .xlsx file"}</span><span className="mt-[3px] text-[9px] text-[var(--app-muted)]">XLSX only · Max 10 MB</span></button>
        {error && <p role="alert" className="mt-[10px] rounded-[6px] border border-[#b72e32] px-[10px] py-[7px] text-[10px] text-[#ef6b6f]">{error}</p>}
        <div className="mt-[18px] flex justify-end gap-[8px]"><button type="button" onClick={onClose} disabled={uploading} className="rounded-[8px] border border-[var(--app-border)] px-[14px] py-[8px] text-[11px] text-[var(--app-text)]">Cancel</button><button type="button" onClick={submit} disabled={uploading} className="inline-flex items-center gap-[6px] rounded-[8px] bg-[#f37422] px-[14px] py-[8px] text-[11px] font-semibold text-white">{uploading && <Loader2 size={13} className="animate-spin" />}{uploading ? "Uploading..." : actionLabel}</button></div>
      </ModalCard>
    </ModalOverlay>
  );
}
