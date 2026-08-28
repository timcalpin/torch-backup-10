import { useRef, useState } from "react";
import { AlertTriangle, Check, CloudDownload, CloudUpload, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { useAppContext } from "@/app/app-context";
import { ModalCard, ModalOverlay } from "@/components/common/Modal";
import { loadTestData } from "@/lib/testData";
import { ApiError } from "@/lib/api";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function formatFileSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function TestDataPage() {
  const { bumpUsersVersion, bumpDataRefreshVersion } = useAppContext();
  const [isAddDataOpen, setIsAddDataOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const chooseFile = (nextFile?: File) => {
    if (!nextFile) return;
    setError(null);
    if (!nextFile.name.toLowerCase().endsWith(".xlsx")) {
      setFile(null);
      setError("Only .xlsx files are accepted.");
      return;
    }
    if (nextFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setError("The file must be 10 MB or smaller.");
      return;
    }
    setFile(nextFile);
  };

  const closeModal = () => {
    setIsAddDataOpen(false);
    setFile(null);
    setIsDragging(false);
    setError(null);
  };

  const submit = async () => {
    if (!file) {
      setError("Please select an .xlsx template before loading test data.");
      return;
    }
    setIsUploading(true);
    setError(null);
    try {
      const result = await loadTestData(file);
      bumpUsersVersion();
      bumpDataRefreshVersion();
      toast.success(`Test data loaded successfully: ${result.rows_imported} row${result.rows_imported === 1 ? "" : "s"} imported.`);
      closeModal();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Unable to load test data. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative flex-1 min-h-full">
      <button
        type="button"
        onClick={() => setIsAddDataOpen(true)}
        className="absolute right-[28px] top-[24px] inline-flex items-center gap-[8px] rounded-[9px] bg-[#f37422] px-[16px] py-[10px] font-['Figtree'] text-[13px] font-semibold text-white shadow-[0_4px_8px_rgba(243,116,34,0.25)] transition-colors hover:bg-[#e06820]"
      >
        <Plus size={16} strokeWidth={2} />
        Add data
      </button>

      {isAddDataOpen && (
        <ModalOverlay onClose={closeModal}>
          <div className="w-[min(420px,calc(100vw-32px))]">
          <ModalCard className="rounded-[18px] p-[24px]">
            <div className="flex items-center justify-between gap-[12px] mb-[18px]">
              <div className="flex items-center gap-[8px]">
                <p className="font-['Figtree'] font-bold text-[20px] text-[var(--app-text)]">Load Test Data</p>
                <span className="rounded-[4px] border border-[rgba(243,116,34,0.45)] bg-[rgba(243,116,34,0.1)] px-[4px] py-[2px] font-['JetBrains_Mono'] text-[6px] font-bold text-[#f37422]">SUPER ADMIN</span>
                <span className="rounded-[4px] border border-[rgba(243,116,34,0.45)] bg-[rgba(243,116,34,0.1)] px-[4px] py-[2px] font-['JetBrains_Mono'] text-[6px] font-bold text-[#f37422]">UAT ONLY</span>
              </div>
              <button type="button" aria-label="Close" onClick={closeModal} className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[var(--app-surface)] text-[var(--app-muted)] transition-colors hover:text-[var(--app-text)]">
                <X size={14} />
              </button>
            </div>

            <div className="rounded-[7px] border border-[#b72e32] bg-[rgba(183,46,50,0.12)] px-[12px] py-[10px]">
              <div className="flex gap-[8px]">
                <AlertTriangle size={15} className="mt-[1px] flex-shrink-0 text-[#ef464b]" />
                <div>
                  <p className="font-['Figtree'] text-[11px] font-semibold text-[var(--app-text)]">Warning: Demo and UAT Purposes Only</p>
                  <p className="mt-[2px] font-['Figtree'] text-[9px] leading-[1.35] text-[var(--app-muted)]">This loads dummy metric data for demo/UAT purposes. Never run this function on live production databases.</p>
                </div>
              </div>
            </div>

            <div className="mt-[18px] rounded-[8px] border border-[var(--app-border)] bg-[var(--app-surface)] px-[12px] py-[11px]">
              <p className="font-['JetBrains_Mono'] text-[9px] font-bold tracking-wide text-[var(--app-muted)]">TEST DATA TEMPLATE</p>
              <div className="mt-[7px] flex items-center justify-between gap-[12px]">
                <div>
                  <p className="font-['Figtree'] text-[11px] font-semibold text-[var(--app-text)]">Torch dummy data template</p>
                  <p className="mt-[2px] font-['Figtree'] text-[9px] text-[var(--app-muted)]">Excel workbook · Joey C. sample format</p>
                </div>
                <a href="/Torch_Dummy_Data_Joey_C.xlsx" download className="inline-flex h-[30px] flex-shrink-0 items-center gap-[6px] rounded-[7px] bg-[rgba(243,116,34,0.12)] px-[10px] font-['Figtree'] text-[10px] font-semibold text-[#f37422] transition-colors hover:bg-[rgba(243,116,34,0.2)]">
                  <CloudDownload size={14} />
                  Download template
                </a>
              </div>
            </div>

            <p className="mt-[18px] font-['JetBrains_Mono'] text-[9px] font-bold tracking-wide text-[var(--app-muted)]">UPLOAD METRICS XLSX</p>
            <input ref={fileInputRef} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" disabled={isUploading} className="hidden" onChange={(event) => chooseFile(event.target.files?.[0])} />
            <div
              role="button"
              tabIndex={0}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              onKeyDown={(event) => { if (!isUploading && (event.key === "Enter" || event.key === " ")) fileInputRef.current?.click(); }}
              onDragOver={(event) => { event.preventDefault(); if (!isUploading) setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => { event.preventDefault(); if (!isUploading) { setIsDragging(false); chooseFile(event.dataTransfer.files?.[0]); } }}
              aria-disabled={isUploading}
              className={`mt-[7px] flex min-h-[76px] flex-col items-center justify-center rounded-[8px] border border-dashed px-[12px] transition-colors ${isUploading ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${isDragging ? "border-[#f37422] bg-[rgba(243,116,34,0.08)]" : "border-[var(--app-border)] bg-[var(--app-surface)] hover:border-[#f37422]"}`}
            >
              <CloudUpload size={18} className="mb-[6px] text-[#f37422]" />
              <p className="font-['Figtree'] text-[11px] font-semibold text-[var(--app-text)]">{file ? file.name : "Drag & drop .xlsx file here"}</p>
              <p className="mt-[2px] font-['Figtree'] text-[9px] text-[var(--app-muted)]">{file ? formatFileSize(file.size) : "or Browse files · .xlsx only · Max 10MB"}</p>
            </div>

            {error && <p role="alert" className="mt-[10px] rounded-[6px] border border-[#b72e32] bg-[rgba(183,46,50,0.12)] px-[10px] py-[7px] font-['Figtree'] text-[10px] text-[#ef6b6f]">{error}</p>}

            <div className="mt-[14px] rounded-[7px] bg-[var(--app-surface)] px-[10px] py-[9px]">
              <p className="font-['JetBrains_Mono'] text-[9px] font-bold tracking-wide text-[var(--app-muted)]">UPLOADING THE FULL DATA POINTS:</p>
              <div className="mt-[7px] flex flex-wrap gap-x-[12px] gap-y-[6px]">
                {["Check-in scores", "Days sober metrics", "Relapse Spectrum score", "Domain appetite scores"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-[4px] font-['Figtree'] text-[10px] text-[var(--app-text)]"><Check size={10} className="text-[#f37422]" />{item}</span>
                ))}
              </div>
            </div>

            <div className="mt-[18px] flex items-center justify-end gap-[8px]">
              <button type="button" onClick={closeModal} disabled={isUploading} className="h-[32px] rounded-[8px] border border-[var(--app-border)] bg-[var(--app-surface)] px-[14px] font-['Figtree'] text-[11px] text-[var(--app-muted)] hover:text-[var(--app-text)] disabled:cursor-not-allowed disabled:opacity-50">Cancel</button>
              <button type="button" onClick={submit} disabled={isUploading} className="inline-flex h-[32px] items-center gap-[6px] rounded-[8px] bg-gradient-to-r from-[#f37422] to-[#c04a12] px-[14px] font-['Figtree'] text-[11px] font-semibold text-white shadow-[0_4px_8px_rgba(243,116,34,0.25)] disabled:cursor-not-allowed disabled:opacity-60">{isUploading && <Loader2 size={13} className="animate-spin" />}{isUploading ? "Loading…" : "Load Test Data"}</button>
            </div>
          </ModalCard>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
