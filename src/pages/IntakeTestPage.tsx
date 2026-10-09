import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getIntakeTests } from "@/api/adminIntakeTestsApi";
import { IntakeTestFilters } from "@/components/admin/IntakeTestFilters";
import { IntakeTestsTable } from "@/components/admin/IntakeTestsTable";
import { PageHeader } from "@/components/common/PageHeader";
import { ApiError } from "@/lib/api";
import type { IntakeTest } from "@/types/intakeTests";

export function IntakeTestPage() {
  const navigate = useNavigate(); const [search, setSearch] = useState(""); const [status, setStatus] = useState("all"); const [version, setVersion] = useState("all"); const [page, setPage] = useState(1); const [rows, setRows] = useState<IntakeTest[]>([]); const [total, setTotal] = useState(0); const [hasNext, setHasNext] = useState(false); const [hasPrevious, setHasPrevious] = useState(false); const [loading, setLoading] = useState(true); const [error, setError] = useState<{ status?: number; message: string } | null>(null);
  const load = () => { const controller = new AbortController(); setLoading(true); setError(null); getIntakeTests({ page, search, status, intake_version: version, signal: controller.signal }).then((response) => { setRows(response.results); setTotal(response.count); setHasNext(Boolean(response.next)); setHasPrevious(Boolean(response.previous)); }).catch((reason) => { if (reason?.name === "AbortError") return; setError(reason instanceof ApiError ? { status: reason.status, message: reason.message } : { message: "Unable to load intake tests." }); }).finally(() => setLoading(false)); return controller; };
  useEffect(() => { const controller = load(); return () => controller.abort(); }, [page, search, status, version]);
  const reset = (setter: (value: string) => void, value: string) => { setter(value); setPage(1); };
  const versions = Array.from(new Set(rows.map((row) => row.intake_version).filter(Boolean) as string[])).sort();
  return <div className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-[var(--app-bg)]"><div className="flex flex-col gap-[18px] p-[24px] lg:p-[32px]"><PageHeader eyebrow="INTAKE ADMIN DEBUG CONSOLE" title="Intake Tests"><button type="button" onClick={load} disabled={loading} className="inline-flex h-[38px] items-center gap-[6px] rounded-[9px] border border-[var(--app-border-strong)] px-[12px] font-['Figtree'] text-[12px] text-[var(--app-muted)] disabled:opacity-50"><RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh</button></PageHeader><p className="-mt-[8px] font-['Figtree'] text-[12px] text-[var(--app-muted)]">Voice/chat intake sessions and their debug logs.</p><IntakeTestFilters search={search} status={status} version={version} versions={versions} onSearch={(value) => reset(setSearch, value)} onStatus={(value) => reset(setStatus, value)} onVersion={(value) => reset(setVersion, value)} /><IntakeTestsTable rows={rows} total={total} page={page} hasNext={hasNext} hasPrevious={hasPrevious} loading={loading} error={error} onPage={setPage} onRefresh={load} onView={(id) => navigate(`/admin/intake-tests/${id}`)} /></div></div>;
}
