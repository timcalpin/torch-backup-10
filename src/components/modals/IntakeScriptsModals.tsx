import React, { useState, useRef } from "react";
import { Upload, X, FileText } from "lucide-react";

// ============================================================================
// ADAPTIVE MODAL COMPONENTS (Support both Light and Dark Mode)
// ============================================================================

const ModalOverlay: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="relative w-full max-w-[500px] bg-[var(--app-surface)] border border-[var(--app-border)] rounded-[16px] p-7 text-[var(--app-text)] shadow-2xl transition-colors">
      {children}
    </div>
  </div>
);

// 1. Upload Script Modal
export interface UploadScriptModalProps {
  onClose: () => void;
  onUpload: (version: string, file: File) => Promise<void>;
}

export function UploadScriptModal({ onClose, onUpload }: UploadScriptModalProps) {
  const [version, setVersion] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.name.toLowerCase().endsWith(".docx")) {
      setFile(dropped);
    } else if (dropped) {
      setError("Only .docx files are supported.");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!version.trim() || !file || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      await onUpload(version.trim(), file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload this script.");
      setSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[var(--app-text)] font-['Figtree']">Upload Intake Script</h2>
        <button
          onClick={onClose}
          type="button"
          className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--app-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-hover)] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="mt-2 text-xs text-[var(--app-muted)] font-['Figtree'] leading-relaxed">
        Upload the client's edited intake script in .docx format. It's saved as a new draft
        version — review the parsed questions before making it live.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[var(--app-text)] font-['Figtree']">
            Version Number
          </label>
          <input
            type="text"
            placeholder="e.g. v2.2"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className="w-full h-11 px-3.5 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-lg text-sm text-[var(--app-text)] placeholder-[var(--app-muted)] focus:outline-none focus:border-[#f37422] transition-colors font-['Figtree']"
          />
        </div>

        {!file ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`
              h-[182px]
              rounded-[12px]
              border
              border-dashed
              transition-all
              flex
              flex-col
              items-center
              justify-center
              cursor-pointer
              select-none
              p-4
              ${
                isDragging
                  ? "border-[#f37422] bg-[rgba(243,116,34,0.08)]"
                  : "border-[var(--app-border)] bg-[var(--app-bg)] hover:bg-[var(--app-hover)]"
              }
            `}
          >
            <Upload className="w-6 h-6 text-[var(--app-muted)] mb-3" />

            <p className="font-semibold text-[14px] text-[var(--app-text)] font-['Figtree'] text-center">
              Drag and drop your .docx file here
            </p>

            <p className="text-[13px] text-[var(--app-muted)] font-['Figtree'] mt-1">
              or{" "}
              <span className="text-[#f37422] underline cursor-pointer font-medium">
                click to browse
              </span>
            </p>

            <p className="mt-3 text-[11px] text-[var(--app-muted)] font-['Figtree']">
              .docx only, max 10MB
            </p>

            <input
              ref={fileInputRef}
              hidden
              type="file"
              accept=".docx"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="flex items-center gap-3.5 rounded-[12px] border border-[var(--app-border)] bg-[var(--app-bg)] p-4 relative">
            <div className="w-10 h-10 rounded-lg bg-[rgba(243,116,34,0.12)] border border-[rgba(243,116,34,0.25)] flex items-center justify-center text-[#f37422] flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0 pr-6">
              <p className="font-semibold text-sm text-[var(--app-text)] truncate font-['Figtree']">
                {file.name}
              </p>
              <p className="text-xs text-[var(--app-muted)] mt-0.5 font-['JetBrains_Mono']">
                {(file.size / 1024).toFixed(0)} KB
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="absolute right-3.5 top-3.5 p-1 rounded-md text-[var(--app-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-hover)] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && <p className="text-xs text-red-500 font-['Figtree']">{error}</p>}

        <div className="flex items-center justify-end gap-3 mt-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2.5 rounded-lg border border-[var(--app-border)] bg-transparent text-xs font-semibold text-[var(--app-text)] hover:bg-[var(--app-hover)] transition-colors font-['Figtree'] cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!version.trim() || !file || submitting}
            className="px-6 py-2.5 rounded-lg bg-[#f37422] text-xs font-semibold text-white hover:bg-[#e06311] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-['Figtree'] cursor-pointer"
          >
            {submitting ? "Uploading…" : "Upload"}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

// 2. Download Script Version Modal
export interface ScriptVersionModalProps {
  version: string;
  uploadedBy: string;
  date: string;
  fileSize: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export function DownloadVersionModal({
  version,
  uploadedBy,
  date,
  fileSize,
  onClose,
  onConfirm,
}: ScriptVersionModalProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    await onConfirm();
    setDownloading(false);
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[var(--app-text)] font-['Figtree']">Download Script Version</h2>
        <button
          onClick={onClose}
          type="button"
          className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--app-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-hover)] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="mt-2 text-xs text-[var(--app-muted)] font-['Figtree']">
        Download the original .docx file uploaded for this version.
      </p>

      <div className="mt-3 flex items-center justify-between text-xs font-['Figtree']">
        <span className="text-[#f37422] font-bold uppercase tracking-wider font-['JetBrains_Mono']">
          VERSION {version}
        </span>
        <span className="text-[var(--app-muted)]">
          Uploaded by {uploadedBy} on {date}
        </span>
      </div>

      <div className="my-5 flex items-center gap-3.5 rounded-[12px] border border-[var(--app-border)] bg-[var(--app-bg)] p-4">
        <div className="w-10 h-10 rounded-lg bg-[rgba(243,116,34,0.12)] border border-[rgba(243,116,34,0.25)] flex items-center justify-center text-[#f37422] flex-shrink-0">
          <FileText className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-[var(--app-text)] truncate font-['Figtree']">
            Version {version}
          </p>
          <p className="text-xs text-[var(--app-muted)] mt-0.5 font-['JetBrains_Mono']">
            {fileSize}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={downloading}
          className="px-5 py-2.5 rounded-lg border border-[var(--app-border)] bg-transparent text-xs font-semibold text-[var(--app-text)] hover:bg-[var(--app-hover)] transition-colors font-['Figtree'] cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="px-6 py-2.5 rounded-lg bg-[#f37422] text-xs font-semibold text-white hover:bg-[#e06311] transition-colors font-['Figtree'] cursor-pointer disabled:opacity-60"
        >
          {downloading ? "Downloading…" : "Download"}
        </button>
      </div>
    </ModalOverlay>
  );
}
