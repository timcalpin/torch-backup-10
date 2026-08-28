import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowLeft, CalendarDays, Download, GitCompareArrows, Loader2 } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { GhostBtn } from "../components/common/Buttons";
import { getMetricDetail, type MetricDetailResponse, type MetricFilters } from "../lib/metricDetail";
import { useAppContext } from "@/app/app-context";

const panel = "rounded-[12px] border border-[var(--app-border)] bg-[var(--app-surface)]";
const colors = ["#f37422", "#6b8ab0"];
type Filters = { risk: string; sobriety: string; adherence: string; mat: string };
const initialFilters: Filters = { risk: "All", sobriety: "All", adherence: "All", mat: "All" };
const cohortOptions = ["On MAT", "Not on MAT", "Sobriety 365+", "Adherence >75%"];

function SelectFilter({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="flex h-[34px] items-center gap-[4px] rounded-[8px] border border-[var(--app-border-strong)] bg-[var(--app-bg)] px-[10px] text-[11px] text-[var(--app-text)]">{label}: <select value={value} onChange={(event) => onChange(event.target.value)} className="bg-transparent outline-none"><option>All</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

function FilterBar({ filters, setFilters }: { filters: Filters; setFilters: (filters: Filters) => void }) {
  const update = (key: keyof Filters) => (value: string) => setFilters({ ...filters, [key]: value });
  return <div className={`${panel} flex flex-wrap gap-[10px] p-[12px]`}><span className="flex h-[34px] items-center px-[2px] text-[9px] uppercase tracking-wider text-[var(--app-muted)]">COHORTS</span><SelectFilter label="Risk Tier" value={filters.risk} options={["High", "Critical", "Moderate"]} onChange={update("risk")} /><SelectFilter label="Sobriety Stage" value={filters.sobriety} options={["0–30 days", "31–90 days", "91–180 days", "181–365 days", "365+ days"]} onChange={update("sobriety")} /><SelectFilter label="Check-in Adherence" value={filters.adherence} options={[">75%", "25–75%", "<25%"]} onChange={update("adherence")} /><SelectFilter label="MAT Status" value={filters.mat} options={["On MAT", "Not on MAT"]} onChange={update("mat")} /></div>;
}

function CohortSelect({ label, value, options, color, onChange }: { label: string; value: string; options: string[]; color: string; onChange: (value: string) => void }) {
  return <label className="flex h-[38px] items-center gap-[7px] rounded-[9px] border border-[var(--app-border-strong)] bg-[var(--app-bg)] px-[12px] text-[12px] text-[var(--app-text)]"><i className="h-[8px] w-[8px] rounded-full" style={{ background: color }} />{label}: <select value={value} onChange={(event) => onChange(event.target.value)} className="bg-transparent font-semibold outline-none">{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

export function MetricDetailPage() {
  const { dataRefreshVersion } = useAppContext();
  const navigate = useNavigate();
  const { metric = "avg-days-sober" } = useParams();
  const [params, setParams] = useSearchParams();
  const [compare, setCompare] = useState(params.get("compare") === "true");
  const [cohortA, setCohortA] = useState(params.get("cohort_a") ?? "On MAT");
  const [cohortB, setCohortB] = useState(params.get("cohort_b") ?? "Not on MAT");
  const [filters, setFilters] = useState(initialFilters);
  const [data, setData] = useState<MetricDetailResponse>();
  const [error, setError] = useState<string | null>(null);
  const title = metric.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setData(undefined);
    const request: MetricFilters = { metric, ...filters, compare, cohortA, cohortB };
    getMetricDetail(request).then((result) => { if (!cancelled) setData(result); }).catch((reason: Error) => { if (!cancelled) setError(reason.message || "Metric detail could not be loaded."); });
    return () => { cancelled = true; };
  }, [metric, filters, compare, cohortA, cohortB, dataRefreshVersion]);

  const toggleCompare = () => {
    const next = !compare;
    setCompare(next);
    const nextParams = new URLSearchParams(params);
    nextParams.set("compare", String(next));
    if (next) { nextParams.set("cohort_a", cohortA); nextParams.set("cohort_b", cohortB); }
    else { nextParams.delete("cohort_a"); nextParams.delete("cohort_b"); }
    setParams(nextParams);
  };

  if (!data) return <div className="flex flex-1 items-center justify-center p-[32px]"><div className="max-w-[520px] rounded-[12px] border border-[rgba(239,68,68,0.35)] bg-[var(--app-surface)] p-[20px] text-center">{!error && <Loader2 className="mx-auto mb-[10px] animate-spin text-[#f37422]" size={28} />}<p className="text-[14px] font-semibold text-[var(--app-text)]">{error ? "Unable to load metric details" : "Loading metric details"}</p><p className="mt-[6px] text-[11px] text-[#ef8888]">{error ?? "Waiting for the analytics API."}</p><p className="mt-[10px] text-[10px] text-[var(--app-muted)]">Check that the backend is running and that this admin account can access the metric-detail endpoint.</p></div></div>;

  const activeCohorts = compare ? [cohortA, cohortB] : [cohortA];
  const trend = data.trend.map((point) => ({ ...point, cohortA: point.cohorts[0]?.value ?? 0, cohortB: point.cohorts[1]?.value ?? 0 }));
  const distribution = data.distribution.map((point) => ({ ...point, cohortA: point.cohorts[0]?.value ?? 0, cohortB: point.cohorts[1]?.value ?? 0 }));

  return <div className="flex-1 min-w-0 overflow-y-auto"><div className="flex flex-col gap-[20px] p-[24px] lg:p-[32px]">
    <div className="flex flex-wrap items-end justify-between gap-[12px]"><div><button onClick={() => navigate("/aggregate-data")} className="mb-[8px] flex items-center gap-[6px] text-[10px] uppercase tracking-wider text-[#f37422]"><ArrowLeft size={12} /> Aggregate Data</button><p className="text-[10px] uppercase tracking-widest text-[#f37422]">AGGREGATE DATA › METRIC DETAIL</p><h1 className="text-[28px] font-bold text-[var(--app-text)]">{title}</h1><p className="text-[12px] text-[var(--app-muted)]">{compare ? "Population comparison mode · Active cohorts overview" : `Population metric · ${data.population.toLocaleString()} active users`}</p></div><div className="flex flex-wrap items-center gap-[8px]"><button onClick={toggleCompare} className={`inline-flex h-[38px] items-center gap-[8px] rounded-[9px] px-[16px] text-[13px] font-semibold ${compare ? "bg-[#4ade80] text-[#07130b]" : "bg-[#f37422] text-white"}`}><GitCompareArrows size={15} />{compare ? "Compare Mode Active" : "Compare"}</button>{compare && <><CohortSelect label="Cohort A" value={cohortA} color={colors[0]} options={cohortOptions} onChange={setCohortA} /><CohortSelect label="Cohort B" value={cohortB} color={colors[1]} options={cohortOptions} onChange={setCohortB} /></>}{!compare && <GhostBtn label="Jun 15 – Aug 9, 2026" icon={<CalendarDays size={14} />} />}<GhostBtn label="Export Report" icon={<Download size={14} />} disabled /></div></div>
    <FilterBar filters={filters} setFilters={setFilters} />
    <div className="grid grid-cols-1 gap-[12px] xl:grid-cols-[1.45fr_0.85fr]"><div className={`${panel} p-[20px]`}><p className="text-[16px] font-bold text-[var(--app-text)]">Trend Over Time</p><p className="text-[11px] text-[var(--app-muted)]">8-week view {compare ? `comparing ${cohortA} vs ${cohortB}` : `showing ${title}`}</p><div className="my-[14px] flex gap-[16px] text-[9px]">{activeCohorts.map((cohort, index) => <span key={cohort} style={{ color: colors[index] }}>● {cohort}</span>)}</div><div className="h-[230px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={trend} margin={{ left: -24, right: 8 }}><CartesianGrid stroke="rgba(244,237,227,0.06)" /><XAxis dataKey="date" tick={{ fill: "#8a8073", fontSize: 9 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: "#8a8073", fontSize: 9 }} axisLine={false} tickLine={false} /><Tooltip /><Line dataKey="cohortA" stroke={colors[0]} strokeWidth={2} dot={{ r: 2 }} name={cohortA} />{compare && <Line dataKey="cohortB" stroke={colors[1]} strokeWidth={2} dot={{ r: 2 }} name={cohortB} />}</LineChart></ResponsiveContainer></div></div><div className={`${panel} p-[20px]`}><p className="text-[16px] font-bold text-[var(--app-text)]">{compare ? "Distribution Comparison" : "Distribution"}</p><p className="text-[11px] text-[var(--app-muted)]">{compare ? "Side-by-side milestone brackets across both cohorts" : "Sober milestone brackets across population"}</p><div className="mt-[22px] h-[225px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={distribution} margin={{ top: 18, right: 0, left: -24, bottom: 4 }}><CartesianGrid vertical={false} stroke="rgba(244,237,227,0.06)" /><XAxis dataKey="label" tick={{ fill: "#8a8073", fontSize: 9 }} axisLine={false} tickLine={false} /><YAxis hide /><Tooltip />{compare ? <><Bar dataKey="cohortA" fill={colors[0]} name={cohortA} /><Bar dataKey="cohortB" fill={colors[1]} name={cohortB} /></> : <Bar dataKey="cohortA" fill="#4ade80" radius={[4, 4, 0, 0]} />}</BarChart></ResponsiveContainer></div></div></div>
    <div className={`${panel} p-[20px]`}><p className="text-[16px] font-bold text-[var(--app-text)]">{compare ? "Cohort Metrics Breakdown" : "Cohort Comparison"}</p><p className="text-[11px] text-[var(--app-muted)]">{compare ? "Highlighting the two actively compared target sub-populations" : `Comparing ${title} across targeted active groups`}</p>{data.cohortComparison.map((row, index) => <div key={row.key} className={`mt-[12px] grid grid-cols-[1fr_1fr_70px] items-center gap-[10px] rounded-[8px] border px-[12px] py-[10px] text-[12px] text-[var(--app-text)] ${compare && index < 2 ? index === 0 ? "border-[#f37422] bg-[rgba(243,116,34,0.14)]" : "border-[#6b8ab0] bg-[rgba(107,138,176,0.14)]" : "border-transparent"}`}><span><b>{compare && index < 2 ? `${row.label} (Cohort ${index === 0 ? "A" : "B"})` : row.label}</b><small className="block text-[10px] text-[var(--app-muted)]">n={row.count}{compare && index < 2 ? " · Active group" : ""}</small></span><div className="h-[16px] rounded-[4px] bg-[var(--app-bg)]"><div className="h-full rounded-[4px]" style={{ width: `${Math.min(100, row.value / 5)}%`, background: compare && index < 2 ? colors[index] : "#4ade80" }} /></div><strong className="text-right">{row.value} {data.unit}</strong></div>)}</div>
  </div></div>;
}
