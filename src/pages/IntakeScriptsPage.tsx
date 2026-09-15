import { useEffect, useState } from "react";
import { Download, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { GhostBtn, PrimaryBtn } from "@/components/common/Buttons";
import { MetricCard } from "@/components/common/MetricCard";
import { TableCard, TableHead, TableRow } from "@/components/common/Table";
import { ActionBtn } from "@/components/common/ActionBtn";
import { ApiError } from "@/lib/api";
import {
  listIntakeScripts,
  publishIntakeScript,
  downloadIntakeScript,
  uploadIntakeScript,
  type IntakeScriptSummary,
} from "@/lib/intakeScripts";
import { UploadScriptModal, DownloadVersionModal } from "../components/modals/IntakeScriptsModals";

type FilterTab = "All Versions" | "Draft" | "Live";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatFileSize(bytes: number | null): string {
  if (bytes == null) return "—";
  return `${Math.round(bytes / 1024)} KB`;
}

export function IntakeScriptsPage() {
  const navigate = useNavigate();

  const [scripts, setScripts] = useState<IntakeScriptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>("All Versions");
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDownload, setSelectedDownload] = useState<IntakeScriptSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    listIntakeScripts()
      .then((response) => {
        if (!cancelled) setScripts(response.results);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Unable to load intake scripts.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const liveScript = scripts.find((s) => s.status === "live") ?? null;

  const filteredScripts = scripts.filter((s) => {
    if (filterTab === "Draft") return s.status === "draft";
    if (filterTab === "Live") return s.status === "live";
    return true;
  });

  const handleUpload = async (versionLabel: string, file: File) => {
    setActionError(null);
    try {
      const draft = await uploadIntakeScript(file, versionLabel);
      setShowUploadModal(false);
      // Straight to the editor: the admin reviews/fixes whatever the
      // parser flagged before this version can ever be made live.
      navigate(`/intake-scripts/${draft.id}`);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Unable to upload this script.");
    }
  };

  const handleMakeLive = async (id: string) => {
    setBusyId(id);
    setActionError(null);
    try {
      await publishIntakeScript(id);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Unable to publish this version.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDownload = async (item: IntakeScriptSummary) => {
    setActionError(null);
    try {
      await downloadIntakeScript(item.id, item.source_filename || `${item.version_label}.docx`);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Unable to download this version.");
    } finally {
      setSelectedDownload(null);
    }
  };

  return (
    <div className="flex-1 min-w-0 overflow-y-auto">
      <div className="p-[24px] lg:p-[32px] flex flex-col gap-[20px]">
        <PageHeader
          eyebrow={`CONTENT • ${scripts.length} ITEMS • ACTIVE VERSION ${liveScript?.version_label ?? "NONE"}`}
          title="Intake Scripts"
        >
          {liveScript && (
            <GhostBtn
              label="Download Live Version"
              onClick={() => handleDownload(liveScript)}
            />
          )}
          <PrimaryBtn label="+ Upload Script" onClick={() => setShowUploadModal(true)} />
        </PageHeader>

        {error && <p className="font-['Figtree'] text-[13px] text-red-500">{error}</p>}
        {actionError && <p className="font-['Figtree'] text-[13px] text-red-500">{actionError}</p>}

        <div className="flex gap-[10px] flex-wrap">
          <MetricCard
            label="TOTAL VERSIONS"
            value={String(scripts.length)}
            delta={`${scripts.filter((s) => s.status === "draft").length} draft`}
            deltaColor="#8a8073"
            accentColor="#f37422"
          />
          <MetricCard
            label="ACTIVE SCRIPT"
            value={liveScript?.version_label ?? "—"}
            delta={liveScript ? `Live since ${formatDate(liveScript.published_at ?? liveScript.updated_at)}` : "Nothing published yet"}
            deltaColor="#4ade80"
            accentColor="#4ade80"
          />
        </div>

        <TableCard>
          <div className="flex items-center justify-between px-[18px] py-[14px] border-b border-[var(--app-border)] flex-wrap gap-3">
            <div className="flex items-center gap-[16px]">
              <span className="font-['Figtree'] font-bold text-[14px] text-[var(--app-text)]">Script History</span>

              <div className="inline-flex items-center gap-[4px] rounded-[8px] border border-[var(--app-border)] bg-[var(--app-surface)] p-[3px]">
                {(["All Versions", "Draft", "Live"] as const).map((tab) => {
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

          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <TableHead
                cols={[
                  { label: "VERSION", w: "w-[120px]" },
                  { label: "UPLOADED BY", w: "flex-1 min-w-[200px]" },
                  { label: "DATE", w: "w-[140px]" },
                  { label: "STATUS", w: "w-[100px]" },
                  { label: "ACTIONS", w: "w-[180px] text-right" },
                ]}
              />

              {loading && (
                <div className="py-[48px] text-center">
                  <p className="font-['Figtree'] text-[var(--app-muted)] text-[14px]">Loading intake scripts…</p>
                </div>
              )}

              {!loading &&
                filteredScripts.map((item) => (
                  <TableRow key={item.id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/intake-scripts/${item.id}`)}
                      className="w-[120px] text-left font-['JetBrains_Mono'] font-bold text-[#f37422] text-[13px] hover:underline"
                    >
                      {item.version_label}
                    </button>

                    <div className="flex items-center gap-[10px] flex-1 min-w-[200px]">
                      <div className="w-[28px] h-[28px] rounded-full bg-[rgba(243,116,34,0.18)] text-[#f37422] font-['Figtree'] font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                        {item.uploaded_by_name ? initials(item.uploaded_by_name) : "—"}
                      </div>
                      <span className="font-['Figtree'] font-semibold text-[13px] text-[var(--app-text)]">
                        {item.uploaded_by_name ?? "Unknown"}
                      </span>
                    </div>

                    <div className="w-[140px] font-['JetBrains_Mono'] font-normal text-[var(--app-muted)] text-[11px]">
                      {formatDate(item.created_at)}
                    </div>

                    <div className="w-[100px]">
                      {item.status === "live" ? (
                        <span className="inline-flex items-center px-[8px] py-[2px] rounded-full font-['JetBrains_Mono'] text-[9px] font-bold bg-[rgba(74,222,128,0.12)] text-[#4ade80] border border-[rgba(74,222,128,0.3)]">
                          ● LIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-[8px] py-[2px] rounded-full font-['JetBrains_Mono'] text-[9px] font-bold bg-[rgba(6,182,212,0.12)] text-[#06b6d4] border border-[rgba(6,182,212,0.3)]">
                          ● DRAFT
                        </span>
                      )}
                    </div>

                    <div className="w-[180px] flex items-center justify-end gap-[8px]">
                      {item.status !== "live" && (
                        <button
                          type="button"
                          onClick={() => handleMakeLive(item.id)}
                          disabled={busyId === item.id}
                          className="h-[28px] px-[10px] rounded-[6px] border border-[rgba(243,116,34,0.4)] text-[#f37422] hover:bg-[rgba(243,116,34,0.1)] font-['Figtree'] font-semibold text-[11px] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                        >
                          {busyId === item.id ? "Publishing…" : "Make Live"}
                        </button>
                      )}
                      <ActionBtn
                        onClick={() => navigate(`/intake-scripts/${item.id}`)}
                        title="Review Steps"
                        icon={<Pencil size={14} strokeWidth={1.8} />}
                      />
                      <ActionBtn
                        onClick={() => setSelectedDownload(item)}
                        title="Download Version"
                        icon={<Download size={14} strokeWidth={1.8} />}
                      />
                    </div>
                  </TableRow>
                ))}

              {!loading && filteredScripts.length === 0 && (
                <div className="py-[48px] text-center">
                  <p className="font-['Figtree'] text-[var(--app-muted)] text-[14px]">No intake scripts found.</p>
                </div>
              )}
            </div>
          </div>

          <div className="px-[18px] py-[12px] border-t border-[var(--app-border)] flex items-center justify-between font-['JetBrains_Mono'] text-[11px] text-[var(--app-muted)]">
            <span>Showing {filteredScripts.length} of {scripts.length} versions</span>
          </div>
        </TableCard>

        {showUploadModal && (
          <UploadScriptModal onClose={() => setShowUploadModal(false)} onUpload={handleUpload} />
        )}

        {selectedDownload && (
          <DownloadVersionModal
            version={selectedDownload.version_label}
            uploadedBy={selectedDownload.uploaded_by_name ?? "Unknown"}
            date={formatDate(selectedDownload.created_at)}
            fileSize={formatFileSize(selectedDownload.file_size)}
            onClose={() => setSelectedDownload(null)}
            onConfirm={() => handleDownload(selectedDownload)}
          />
        )}
      </div>
    </div>
  );
}

export default IntakeScriptsPage;
