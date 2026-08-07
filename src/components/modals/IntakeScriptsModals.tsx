import React, { useState, useRef } from "react";
import { Download, Upload, X, FileText } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { GhostBtn, PrimaryBtn } from "@/components/common/Buttons";
import { MetricCard } from "@/components/common/MetricCard";
import { TableCard, TableHead, TableRow } from "@/components/common/Table";
import { ActionBtn } from "@/components/common/ActionBtn";

export interface ScriptVersion {
  id: string;
  version: string;
  uploadedBy: string;
  uploadedByInitials: string;
  date: string;
  status: "LATEST" | "LIVE" | null;
  fileSize: string;
}

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
  onUpload: (version: string, file: File) => void;
}

export function UploadScriptModal({ onClose, onUpload }: UploadScriptModalProps) {
  const [version, setVersion] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
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
    if (dropped && (dropped.name.endsWith(".docx") || dropped.name.endsWith(".doc"))) {
      setFile(dropped);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (version.trim() && file) {
      onUpload(version.trim(), file);
      onClose();
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
        Upload a completed intake script in .docx format. It will be saved as a new version.
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
              accept=".doc,.docx"
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

        <div className="flex items-center justify-end gap-3 mt-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-[var(--app-border)] bg-transparent text-xs font-semibold text-[var(--app-text)] hover:bg-[var(--app-hover)] transition-colors font-['Figtree'] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!version.trim() || !file}
            className="px-6 py-2.5 rounded-lg bg-[#f37422] text-xs font-semibold text-white hover:bg-[#e06311] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-['Figtree'] cursor-pointer"
          >
            Upload
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

// 2. Download Sample Template Modal
export function DownloadSampleModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalOverlay onClose={onClose}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[var(--app-text)] font-['Figtree']">Download Sample Template</h2>
        <button
          onClick={onClose}
          type="button"
          className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--app-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-hover)] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="mt-2 text-xs text-[var(--app-muted)] font-['Figtree'] leading-relaxed">
        Download the intake script template (.docx) to see the required format. Fill in your questions and upload it back.
      </p>

      <div className="my-6 flex items-center gap-3.5 rounded-[12px] border border-[var(--app-border)] bg-[var(--app-bg)] p-4">
        <div className="w-10 h-10 rounded-lg bg-[rgba(243,116,34,0.12)] border border-[rgba(243,116,34,0.25)] flex items-center justify-center text-[#f37422] flex-shrink-0">
          <FileText className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-[var(--app-text)] truncate font-['Figtree']">
            intake-script-template.docx
          </p>
          <p className="text-xs text-[var(--app-muted)] mt-0.5 font-['JetBrains_Mono']">
            24 KB
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-lg border border-[var(--app-border)] bg-transparent text-xs font-semibold text-[var(--app-text)] hover:bg-[var(--app-hover)] transition-colors font-['Figtree'] cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 rounded-lg bg-[#f37422] text-xs font-semibold text-white hover:bg-[#e06311] transition-colors font-['Figtree'] cursor-pointer"
        >
          Download
        </button>
      </div>
    </ModalOverlay>
  );
}

// 3. Download Script Version Modal
export interface ScriptVersionModalProps {
  version: string;
  uploadedBy: string;
  date: string;
  fileSize: string;
  onClose: () => void;
}

export function DownloadVersionModal({
  version,
  uploadedBy,
  date,
  fileSize,
  onClose,
}: ScriptVersionModalProps) {
  const fileName = `intake-script-${version}.docx`;

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
        Download this version of the intake script.
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
            {fileName}
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
          className="px-5 py-2.5 rounded-lg border border-[var(--app-border)] bg-transparent text-xs font-semibold text-[var(--app-text)] hover:bg-[var(--app-hover)] transition-colors font-['Figtree'] cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 rounded-lg bg-[#f37422] text-xs font-semibold text-white hover:bg-[#e06311] transition-colors font-['Figtree'] cursor-pointer"
        >
          Download
        </button>
      </div>
    </ModalOverlay>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

const INITIAL_SCRIPTS: ScriptVersion[] = [
  {
    id: "1",
    version: "v2.1",
    uploadedBy: "Sarah A.",
    uploadedByInitials: "SA",
    date: "Aug 4, 2026",
    status: "LATEST",
    fileSize: "22 KB",
  },
  {
    id: "2",
    version: "v2.0",
    uploadedBy: "Sarah A.",
    uploadedByInitials: "SA",
    date: "Jul 20, 2026",
    status: "LIVE",
    fileSize: "20 KB",
  },
  {
    id: "3",
    version: "v1.2",
    uploadedBy: "Dr. Chen",
    uploadedByInitials: "DC",
    date: "Jun 15, 2026",
    status: null,
    fileSize: "18 KB",
  },
  {
    id: "4",
    version: "v1.1",
    uploadedBy: "Dr. Chen",
    uploadedByInitials: "DC",
    date: "May 3, 2026",
    status: null,
    fileSize: "18 KB",
  },
  {
    id: "5",
    version: "v1.0",
    uploadedBy: "Sarah A.",
    uploadedByInitials: "SA",
    date: "Apr 1, 2026",
    status: null,
    fileSize: "16 KB",
  },
];

type FilterTab = "All Versions" | "Latest" | "Live";

export function IntakeScriptsPage() {
  const [scripts, setScripts] = useState<ScriptVersion[]>(INITIAL_SCRIPTS);
  const [filterTab, setFilterTab] = useState<FilterTab>("All Versions");

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [selectedDownloadVersion, setSelectedDownloadVersion] = useState<ScriptVersion | null>(null);

  const activeVersion = scripts.find((s) => s.status === "LIVE")?.version || "v2.0";

  const filteredScripts = scripts.filter((s) => {
    if (filterTab === "Latest") return s.status === "LATEST";
    if (filterTab === "Live") return s.status === "LIVE";
    return true;
  });

  const handleMakeLive = (id: string) => {
    setScripts((prev) =>
      prev.map((s) => ({
        ...s,
        status: s.id === id ? "LIVE" : s.status === "LIVE" ? null : s.status,
      }))
    );
  };

  const handleUploadNewScript = (version: string, file: File) => {
    const formattedVersion = version.startsWith("v") ? version : `v${version}`;
    const newScript: ScriptVersion = {
      id: Date.now().toString(),
      version: formattedVersion,
      uploadedBy: "Sarah A.",
      uploadedByInitials: "SA",
      date: "Aug 7, 2026",
      status: "LATEST",
      fileSize: `${(file.size / 1024).toFixed(0)} KB`,
    };

    setScripts((prev) => [
      newScript,
      ...prev.map((s) => (s.status === "LATEST" ? { ...s, status: null } : s)),
    ]);
  };

  return (
    <div className="flex-1 min-w-0 overflow-y-auto">
      <div className="p-[24px] lg:p-[32px] flex flex-col gap-[20px]">
        {/* Page Header */}
        <PageHeader
          eyebrow={`CONTENT • ${scripts.length} ITEMS • ACTIVE VERSION ${activeVersion}`}
          title="Intake Scripts"
        >
          <GhostBtn label="Download Sample Template" onClick={() => setShowSampleModal(true)} />
          <PrimaryBtn label="+ Upload Script" onClick={() => setShowUploadModal(true)} />
        </PageHeader>

        {/* Metrics Row */}
        <div className="flex gap-[10px] flex-wrap">
          <MetricCard
            label="TOTAL VERSIONS"
            value={String(scripts.length)}
            delta="12% vs last quarter"
            deltaColor="#4ade80"
            accentColor="#f37422"
          />
          <MetricCard
            label="ACTIVE SCRIPT"
            value={activeVersion}
            delta="Live Jul 20, 2026"
            deltaColor="#4ade80"
            accentColor="#4ade80"
          />
        </div>

        {/* Script History Card */}
        <TableCard>
          {/* Card Header & Tabs */}
          <div className="flex items-center justify-between px-[18px] py-[14px] border-b border-[var(--app-border)] flex-wrap gap-3">
            <div className="flex items-center gap-[16px]">
              <span className="font-['Figtree'] font-bold text-[14px] text-[var(--app-text)]">Script History</span>
              
              <div className="inline-flex items-center gap-[4px] rounded-[8px] border border-[var(--app-border)] bg-[var(--app-surface)] p-[3px]">
                {(["All Versions", "Latest", "Live"] as const).map((tab) => {
                  const active = filterTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setFilterTab(tab)}
                      className={`h-[30px] rounded-[6px] px-[12px] font-['Figtree'] text-[12px] font-semibold transition-all cursor-pointer ${
                        active
                          ? "bg-[rgba(243,116,34,0.12)] text-[#f37422] border border-[rgba(243,116,34,0.3)]"
                          : "text-[var(--app-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-hover)] border border-transparent"
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="font-['JetBrains_Mono'] text-[11px] text-[var(--app-muted)]">
              Sort by: <span className="font-bold text-[var(--app-text)]">Date ↓</span>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <TableHead
                cols={[
                  { label: "VERSION", w: "w-[120px]" },
                  { label: "UPLOADED BY", w: "flex-1 min-w-[200px]" },
                  { label: "DATE", w: "w-[140px]" },
                  { label: "STATUS", w: "w-[120px]" },
                  { label: "ACTIONS", w: "w-[140px] text-right" },
                ]}
              />

              {filteredScripts.map((item) => (
                <TableRow key={item.id}>
                  {/* Version */}
                  <div className="w-[120px] font-['JetBrains_Mono'] font-bold text-[#f37422] text-[13px]">
                    {item.version}
                  </div>

                  {/* Uploaded By */}
                  <div className="flex items-center gap-[10px] flex-1 min-w-[200px]">
                    <div className="w-[28px] h-[28px] rounded-full bg-[rgba(243,116,34,0.18)] text-[#f37422] font-['Figtree'] font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                      {item.uploadedByInitials}
                    </div>
                    <span className="font-['Figtree'] font-semibold text-[13px] text-[var(--app-text)]">
                      {item.uploadedBy}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="w-[140px] font-['JetBrains_Mono'] font-normal text-[var(--app-muted)] text-[11px]">
                    {item.date}
                  </div>

                  {/* Status Pills */}
                  <div className="w-[120px]">
                    {item.status === "LATEST" && (
                      <span className="inline-flex items-center px-[8px] py-[2px] rounded-full font-['JetBrains_Mono'] text-[9px] font-bold bg-[rgba(6,182,212,0.12)] text-[#06b6d4] border border-[rgba(6,182,212,0.3)]">
                        ● LATEST
                      </span>
                    )}
                    {item.status === "LIVE" && (
                      <span className="inline-flex items-center px-[8px] py-[2px] rounded-full font-['JetBrains_Mono'] text-[9px] font-bold bg-[rgba(74,222,128,0.12)] text-[#4ade80] border border-[rgba(74,222,128,0.3)]">
                        ● LIVE
                      </span>
                    )}
                    {!item.status && <span className="font-['JetBrains_Mono'] text-[11px] text-[var(--app-muted)]">—</span>}
                  </div>

                  {/* Action Buttons */}
                  <div className="w-[140px] flex items-center justify-end gap-[8px]">
                    {item.status !== "LIVE" && (
                      <button
                        type="button"
                        onClick={() => handleMakeLive(item.id)}
                        className="h-[28px] px-[10px] rounded-[6px] border border-[rgba(243,116,34,0.4)] text-[#f37422] hover:bg-[rgba(243,116,34,0.1)] font-['Figtree'] font-semibold text-[11px] transition-colors cursor-pointer"
                      >
                        Make Live
                      </button>
                    )}
                    <ActionBtn
                      onClick={() => setSelectedDownloadVersion(item)}
                      title="Download Version"
                      icon={<Download size={14} strokeWidth={1.8} />}
                    />
                  </div>
                </TableRow>
              ))}

              {filteredScripts.length === 0 && (
                <div className="py-[48px] text-center">
                  <p className="font-['Figtree'] text-[var(--app-muted)] text-[14px]">No intake scripts found.</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Pagination Bar */}
          <div className="px-[18px] py-[12px] border-t border-[var(--app-border)] flex items-center justify-between font-['JetBrains_Mono'] text-[11px] text-[var(--app-muted)]">
            <span>Showing 1-{filteredScripts.length} of {scripts.length} versions</span>
            <div className="flex items-center gap-[4px]">
              <button disabled className="w-[28px] h-[28px] rounded-[6px] border border-[var(--app-border)] flex items-center justify-center text-[var(--app-muted)] opacity-40 cursor-not-allowed">
                &lt;
              </button>
              <span className="w-[28px] h-[28px] rounded-[6px] bg-[#f37422] text-white font-bold flex items-center justify-center">
                1
              </span>
              <button disabled className="w-[28px] h-[28px] rounded-[6px] border border-[var(--app-border)] flex items-center justify-center text-[var(--app-muted)] opacity-40 cursor-not-allowed">
                &gt;
              </button>
            </div>
          </div>
        </TableCard>

        {/* Modals */}
        {showUploadModal && (
          <UploadScriptModal
            onClose={() => setShowUploadModal(false)}
            onUpload={handleUploadNewScript}
          />
        )}

        {showSampleModal && (
          <DownloadSampleModal onClose={() => setShowSampleModal(false)} />
        )}

        {selectedDownloadVersion && (
          <DownloadVersionModal
            version={selectedDownloadVersion.version}
            uploadedBy={selectedDownloadVersion.uploadedBy}
            date={selectedDownloadVersion.date}
            fileSize={selectedDownloadVersion.fileSize}
            onClose={() => setSelectedDownloadVersion(null)}
          />
        )}
      </div>
    </div>
  );
}

export default IntakeScriptsPage;