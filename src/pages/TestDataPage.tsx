import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ChevronDown, CloudDownload, CloudUpload, Loader2, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import { useAppContext } from "@/app/app-context";
import { ModalCard, ModalOverlay } from "@/components/common/Modal";
import { ApiError } from "@/lib/api";
import { listTestData, loadTestData, type TestDataset } from "@/lib/testData";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const formatDate = (value: string) => value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "—";

import { downloadS3Template } from "@/lib/excel";

export function TestDataPage() {
  const { user, bumpUsersVersion, bumpDataRefreshVersion } = useAppContext();
  const [datasets, setDatasets] = useState<TestDataset[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchDatasets = async () => {
    setLoading(true); setLoadError(null);
    try {
      const response = await listTestData({ search, status });
      setDatasets(response.results ?? []); setTotal(response.count ?? response.results?.length ?? 0);
    } catch (reason) {
      setDatasets([]); setTotal(0); setLoadError(reason instanceof ApiError ? reason.message : "Unable to load test data.");
    } finally { setLoading(false); }
  };

  useEffect(() => { const timer = window.setTimeout(() => { void fetchDatasets(); }, 300); return () => window.clearTimeout(timer); }, [search, status]);

  const chooseFile = (next: File | undefined) => {
    setError(null); if (!next) return;
    if (!next.name.toLowerCase().endsWith(".xlsx")) return setError("Only .xlsx files are accepted.");
    if (next.size > MAX_FILE_SIZE) return setError("The file must be 10 MB or smaller.");
    setFile(next);
  };
  const closeModal = () => { if (uploading) return; setModalOpen(false); setFile(null); setError(null); };
  const submit = async () => {
    if (!file) return setError("Please select an .xlsx file.");
    setUploading(true); setError(null);
    try {
      const result = await loadTestData(file); await fetchDatasets(); bumpUsersVersion(); bumpDataRefreshVersion();
      toast.success(`Test data loaded successfully: ${result.rows_imported} row${result.rows_imported === 1 ? "" : "s"} imported.`);
      setModalOpen(false); setFile(null); setError(null);
    } catch (reason) { setError(reason instanceof ApiError ? reason.message : "Unable to load test data."); }
    finally { setUploading(false); }
  };

  if (!user?.is_staff && !user?.is_superuser) return <div className="flex flex-1 items-center justify-center p-[32px] text-[13px] text-[var(--app-muted)]">You do not have permission to access Test Data.</div>;

  return <div className="relative min-h-full flex-1 overflow-y-auto bg-[var(--app-bg)] px-[24px] py-[28px] text-[var(--app-text)] lg:px-[40px]">
    <div className="mx-auto max-w-[1180px]">
      <div className="flex flex-wrap items-center justify-between gap-[16px]"><div className="flex items-center gap-[12px]"><h1 className="text-[28px] font-bold">Test Data</h1>{user.is_superuser && <span className="rounded-[8px] border border-[#f37422] px-[10px] py-[5px] font-['JetBrains_Mono'] text-[10px] font-bold uppercase tracking-wide text-[#f37422]">Super Admin · UAT Only</span>}</div><button type="button" onClick={() => setModalOpen(true)} className="inline-flex items-center gap-[8px] rounded-[12px] bg-gradient-to-r from-[#f37422] to-[#c84b12] px-[22px] py-[12px] text-[13px] font-semibold text-white"><Plus size={16} />Add Test Data</button></div>
      <div className="mt-[42px] flex flex-wrap items-center gap-[16px] rounded-[12px] bg-[var(--app-surface)] px-[16px] py-[14px]"><label className="flex h-[34px] min-w-[260px] flex-1 items-center gap-[9px] rounded-[7px] bg-[var(--app-bg)] px-[12px] text-[var(--app-muted)]"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or persona..." className="min-w-0 flex-1 bg-transparent text-[12px] text-[var(--app-text)] outline-none" /></label><div className="relative"><select value={status} onChange={(event) => setStatus(event.target.value)} className="h-[34px] appearance-none rounded-[7px] bg-[var(--app-bg)] pl-[13px] pr-[32px] text-[12px] text-[var(--app-text)] outline-none"><option value="all">All Statuses</option><option value="active">Active</option><option value="expired">Expired</option></select><ChevronDown size={13} className="pointer-events-none absolute right-[10px] top-[10px] text-[var(--app-muted)]" /></div><span className="ml-auto text-[12px] text-[var(--app-muted)]">Showing {datasets.length} of {total} test dataset{total === 1 ? "" : "s"}</span></div>
      <div className="mt-[32px] overflow-hidden rounded-[24px] bg-[var(--app-surface)]"><div className="hidden grid-cols-[160px_1.1fr_1.7fr_125px_88px] gap-[20px] px-[24px] py-[17px] md:grid">{["Name", "Persona Type", "Data Points Loaded", "Date Loaded", "Status"].map((heading) => <span key={heading} className="font-['JetBrains_Mono'] text-[10px] font-bold uppercase text-[var(--app-muted)]">{heading}</span>)}</div>{loading ? <div className="space-y-[10px] px-[24px] py-[24px]">{[1, 2, 3].map((row) => <div key={row} className="h-[42px] animate-pulse rounded-[8px] bg-[var(--app-hover)]" />)}</div> : loadError ? <div className="px-[24px] py-[50px] text-center text-[13px] text-[#ef6b6f]">{loadError}</div> : datasets.length === 0 ? <div className="px-[24px] py-[50px] text-center text-[13px] text-[var(--app-muted)]">No test datasets match your search.</div> : datasets.map((dataset) => <div key={dataset.id} className="grid gap-[7px] border-t border-[var(--app-border)] px-[24px] py-[16px] md:grid-cols-[160px_1.1fr_1.7fr_125px_88px] md:items-center md:gap-[20px]"><span className="text-[13px] font-semibold">{dataset.name}</span><span className="text-[12px] text-[var(--app-muted)]">{dataset.persona_type || "—"}</span><span className="text-[12px]">{(dataset.data_points_loaded ?? dataset.data_points ?? []).join(", ") || "—"}</span><span className="text-[12px] text-[var(--app-muted)]">{formatDate(dataset.date_loaded)}</span><span className={`w-fit rounded-[5px] border px-[8px] py-[3px] text-[11px] ${dataset.status.toLowerCase() === "active" ? "border-[#35d47b] text-[#35d47b]" : "border-[var(--app-muted)] text-[var(--app-muted)]"}`}>{dataset.status.toLowerCase() === "active" ? "Active" : "Expired"}</span></div>)}</div>
    </div>
    {modalOpen && <ModalOverlay onClose={closeModal}><ModalCard className="w-[min(420px,calc(100vw-32px))] rounded-[18px] p-[24px]"><div className="mb-[18px] flex items-center justify-between"><div><p className="text-[20px] font-bold">Load Test Data</p><p className="mt-[3px] text-[10px] text-[var(--app-muted)]">Super Admin · UAT Only</p></div><button type="button" onClick={closeModal} aria-label="Close"><X size={16} /></button></div><div className="rounded-[7px] border border-[#b72e32] bg-[rgba(183,46,50,0.12)] px-[12px] py-[10px] text-[11px]"><AlertTriangle size={15} className="mr-[7px] inline text-[#ef464b]" />Demo and UAT purposes only. Never use this on production.</div><button type="button" onClick={() => downloadS3Template("Torch_Test_Data_Template.xlsx")} className="mt-[18px] flex min-h-[44px] w-full items-center justify-center gap-[7px] rounded-[8px] border border-[#f37422] bg-[rgba(243,116,34,0.1)] text-[11px] font-semibold text-[#f37422] hover:bg-[rgba(243,116,34,0.18)]"><CloudDownload size={15} />Download template</button><p className="mt-[6px] text-center text-[9px] text-[var(--app-muted)]">All fields included · Name, DOB, then Email</p><input ref={inputRef} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="hidden" onChange={(event) => chooseFile(event.target.files?.[0])} /><button type="button" disabled={uploading} onClick={() => inputRef.current?.click()} className="mt-[18px] flex min-h-[100px] w-full flex-col items-center justify-center rounded-[8px] border border-dashed border-[var(--app-border)] text-[11px] hover:border-[#f37422]"><CloudUpload size={20} className="mb-[6px] text-[#f37422]" /><span>{file?.name ?? "Choose an .xlsx file"}</span><span className="mt-[3px] text-[9px] text-[var(--app-muted)]">XLSX only · Max 10 MB</span></button>{error && <p role="alert" className="mt-[10px] rounded-[6px] border border-[#b72e32] px-[10px] py-[7px] text-[10px] text-[#ef6b6f]">{error}</p>}<div className="mt-[18px] flex justify-end gap-[8px]"><button type="button" onClick={closeModal} disabled={uploading} className="rounded-[8px] border border-[var(--app-border)] px-[14px] py-[8px] text-[11px]">Cancel</button><button type="button" onClick={submit} disabled={uploading} className="inline-flex items-center gap-[6px] rounded-[8px] bg-[#f37422] px-[14px] py-[8px] text-[11px] font-semibold text-white">{uploading && <Loader2 size={13} className="animate-spin" />}{uploading ? "Uploading..." : "Load Test Data"}</button></div></ModalCard></ModalOverlay>}
  </div>;
}
