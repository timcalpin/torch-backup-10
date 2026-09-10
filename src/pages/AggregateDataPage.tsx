import { useEffect, useState } from "react";
import { CalendarDays, Download, Loader2 } from "lucide-react";
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/common/PageHeader";
import { GhostBtn } from "../components/common/Buttons";
import { MetricCard } from "../components/common/MetricCard";
import { getAggregateDashboard, type AggregateCohortRow, type AggregateDashboardResponse } from "../lib/aggregate";
import { useAppContext } from "@/app/app-context";

const panel = "relative rounded-[12px] border border-[var(--app-border)] bg-[var(--app-surface)]";
const riskTiers = [
  { name: "Moderate", value: 27, count: 58, color: "#facc15" },
  { name: "High", value: 12, count: 25, color: "#fb923c" },
  { name: "Critical", value: 9, count: 19, color: "#ef4444" },
];

function formatDate(value: Date) { return value.toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" }); }
function localDate(value: Date) { return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`; }

function DateRange({ start, end, onChange }: { start: Date; end: Date; onChange: (start: Date, end: Date) => void }) {
  const [open, setOpen] = useState(false);
  return <div className="relative"><GhostBtn label={`${formatDate(start)} – ${formatDate(end)}`} icon={<CalendarDays size={14} />} onClick={() => setOpen((value) => !value)} />{open && <div className="absolute right-0 top-[44px] z-30 flex w-[260px] flex-col gap-[10px] rounded-[10px] border border-[var(--app-border-strong)] bg-[var(--app-surface)] p-[12px] shadow-xl"><label className="text-[9px] text-[var(--app-muted)]">FROM<input className="mt-[4px] w-full rounded border border-[var(--app-border)] bg-transparent p-[7px] text-[12px] text-[var(--app-text)]" type="date" value={localDate(start)} onChange={(event) => onChange(new Date(`${event.target.value}T00:00:00`), end)} /></label><label className="text-[9px] text-[var(--app-muted)]">TO<input className="mt-[4px] w-full rounded border border-[var(--app-border)] bg-transparent p-[7px] text-[12px] text-[var(--app-text)]" type="date" value={localDate(end)} onChange={(event) => onChange(start, new Date(`${event.target.value}T00:00:00`))} /></label></div>}</div>;
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return <div className="rounded-[8px] border border-[var(--app-border-strong)] bg-[var(--app-surface)] px-[10px] py-[8px] shadow-xl"><p className="mb-[4px] text-[9px] text-[var(--app-muted)]">{label}</p>{payload.map((item) => <p key={item.name} className="text-[11px]" style={{ color: item.color }}>{item.name}: {item.value}</p>)}</div>;
}

function xDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("default", { month: "short", day: "numeric" }); }

function FilterDropdown({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  return <div className="relative"><button type="button" onClick={() => setOpen((current) => !current)} className="flex h-[34px] items-center gap-[8px] rounded-[8px] border border-[var(--app-border-strong)] bg-[var(--app-bg)] px-[12px] text-[12px] text-[var(--app-text)]">{label}: {value}<span className="text-[var(--app-muted)]">⌄</span></button>{open && <div className="absolute left-0 top-[40px] z-40 min-w-full overflow-hidden rounded-[8px] border border-[var(--app-border-strong)] bg-[var(--app-surface)] p-[4px] shadow-xl">{options.map((option) => <button type="button" key={option} onClick={() => { onChange(option); setOpen(false); }} className={`block w-full whitespace-nowrap rounded-[5px] px-[10px] py-[7px] text-left text-[11px] ${option === value ? "bg-[rgba(243,116,34,0.12)] text-[#f37422]" : "text-[var(--app-text)] hover:bg-[var(--app-hover)]"}`}>{option}</button>)}</div>}</div>;
}

export function AggregateDataPage() {
  const { dataRefreshVersion } = useAppContext();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<AggregateDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ risk: "All", sobriety: "All", adherence: "All", mat: "All" });
  const [start, setStart] = useState(() => { const date = new Date(); date.setMonth(date.getMonth() - 2); return date; });
  const [end, setEnd] = useState(() => new Date());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAggregateDashboard(localDate(start), localDate(end), filters).then((data) => { if (!cancelled) setDashboard(data); }).catch(() => { if (!cancelled) setError("Failed to load aggregate data."); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [start, end, filters, dataRefreshVersion]);

  if (loading && !dashboard) return <div className="flex flex-1 items-center justify-center"><Loader2 className="animate-spin text-[#f37422]" size={30} /></div>;
  if (!dashboard) return <div className="flex-1 p-[32px] text-red-500">{error ?? "No data available."}</div>;

  const metrics = dashboard.metrics;
  const userCount = metrics.active_users?.value ?? 0;
  const metricCards = [
    ["active-users", "ACTIVE USERS", userCount.toLocaleString(), metrics.active_users?.delta ?? "", "#4ade80"],
    ["avg-days-sober", "AVG DAYS SOBER", String(metrics.avg_days_sober?.value ?? 0), metrics.avg_days_sober?.delta ?? "", "#f37422"],
    ["rs-score", "AVG RS SCORE", String(metrics.avg_motivation?.value ?? 0), metrics.avg_motivation?.delta ?? "", "#6b8ab0"],
    ["checkin-rate", "CHECK-IN RATE", `${metrics.checkin_rate?.value ?? 0}%`, metrics.checkin_rate?.delta ?? "", "#6b8ab0"],
    ["high-risk", "HIGH RISK", `${metrics.high_risk?.value ?? 0}%`, metrics.high_risk?.delta ?? "", "#ef4444"],
    ["motivation", "AVG MOTIVATION", String(metrics.avg_motivation?.value ?? 0), metrics.avg_motivation?.delta ?? "", "#facc15"],
    ["anxiety", "AVG ANXIETY", String(metrics.avg_anxiety?.value ?? 0), metrics.avg_anxiety?.delta ?? "", "#a3738f"],
  ] as const;

  return <div className="flex-1 min-w-0 overflow-y-auto"><div className="flex flex-col gap-[20px] p-[24px] lg:p-[32px]">
    <PageHeader eyebrow={`POPULATION INSIGHTS · ANONYMIZED · ${userCount.toLocaleString()} USERS`} title="Aggregate Data"><DateRange start={start} end={end} onChange={(nextStart, nextEnd) => { setStart(nextStart); setEnd(nextEnd); }} /><GhostBtn label="Export Report" icon={<Download size={14} />} disabled /></PageHeader>
    <div className={`${panel} flex flex-wrap gap-[10px] p-[12px]`}><FilterDropdown label="Risk Tier" value={filters.risk} options={["All", "High", "Critical", "Moderate"]} onChange={(value) => setFilters((current) => ({ ...current, risk: value }))} /><FilterDropdown label="Sobriety Stage" value={filters.sobriety} options={["All", "0–30 days", "31–90 days", "91–180 days", "181–365 days", "365+ days"]} onChange={(value) => setFilters((current) => ({ ...current, sobriety: value }))} /><FilterDropdown label="Check-in Adherence" value={filters.adherence} options={["All", ">75%", "25–75%", "<25%"]} onChange={(value) => setFilters((current) => ({ ...current, adherence: value }))} /><FilterDropdown label="MAT Status" value={filters.mat} options={["All", "On MAT", "Not on MAT"]} onChange={(value) => setFilters((current) => ({ ...current, mat: value }))} /></div>
    <div className="grid grid-cols-2 gap-[10px] md:grid-cols-4 xl:grid-cols-7">{metricCards.map(([key, label, value, delta, color]) => <button key={key} className="text-left cursor-pointer" onClick={() => navigate(`/aggregate-data/metric/${key}?start=${localDate(start)}&end=${localDate(end)}`)}><MetricCard label={label} value={value} delta={delta} deltaColor={color === "#ef4444" ? "#ef4444" : "#4ade80"} accentColor={color} /></button>)}</div>
    <div className="grid grid-cols-1 gap-[12px] xl:grid-cols-[1.45fr_0.85fr]">
      <div className={`${panel} p-[20px]`}><p className="text-[16px] font-bold text-[var(--app-text)]">Population Sobriety Trend</p><p className="mt-[2px] text-[10px] text-[var(--app-muted)]">{formatDate(start)} – {formatDate(end)} · {userCount.toLocaleString()} users (8-Week metrics)</p><div className="my-[12px] flex flex-wrap gap-[14px] text-[9px] text-[var(--app-muted)]">{[["#f37422", "Avg Days Sober"], ["#6b8ab0", "Check-in Rate"], ["#ef4444", "High Risk"]].map(([color, label]) => <span key={label} className="flex items-center gap-[6px]"><i className="h-[2px] w-[10px]" style={{ background: color }} />{label}</span>)}</div><div className="h-[245px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={dashboard.trend} margin={{ top: 4, right: 8, left: -24, bottom: 4 }}><CartesianGrid stroke="rgba(244,237,227,0.06)" /><XAxis dataKey="date" tickFormatter={xDate} tick={{ fill: "#8a8073", fontSize: 9 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: "#8a8073", fontSize: 9 }} axisLine={false} tickLine={false} /><Tooltip content={<ChartTooltip />} /><Line type="monotone" dataKey="avgDays" stroke="#f37422" strokeWidth={2} dot={false} name="Avg Days Sober" /><Line type="monotone" dataKey="checkIn" stroke="#6b8ab0" strokeWidth={2} dot={false} name="Check-in Rate" /><Line type="monotone" dataKey="highRisk" stroke="#ef4444" strokeWidth={2} dot={false} name="High Risk" /></LineChart></ResponsiveContainer></div></div>
      <div className={`${panel} p-[20px]`}><p className="text-[16px] font-bold text-[var(--app-text)]">Risk Tier Distribution</p><p className="mt-[2px] text-[10px] text-[var(--app-muted)]">Current snapshot · {userCount.toLocaleString()} Users</p><div className="mt-[10px] flex items-center justify-center gap-[10px]"><div className="relative h-[180px] w-[180px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={riskTiers} dataKey="value" innerRadius={55} outerRadius={78} paddingAngle={2} stroke="var(--app-surface)">{riskTiers.map((tier) => <Cell key={tier.name} fill={tier.color} />)}</Pie></PieChart></ResponsiveContainer><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-[22px] font-bold text-[var(--app-text)]">{userCount}</span><span className="text-[8px] text-[var(--app-muted)]">USERS</span></div></div><div className="flex flex-col gap-[9px] text-[11px] text-[var(--app-text)]">{riskTiers.map((tier) => <span key={tier.name} className="flex items-center gap-[7px]"><i className="h-[6px] w-[6px] rounded-full" style={{ background: tier.color }} />{tier.name} <em className="not-italic text-[var(--app-muted)]">{tier.value}% ({tier.count})</em></span>)}</div></div></div>
    </div>
    <div className="grid grid-cols-1 gap-[12px] lg:grid-cols-2"><DynamicCohortCard title="Medication-Assisted Treatment (MAT) Cohorts" subtitle="Compare retention, adherence, and risk metrics" rows={dashboard.cohort_breakdowns?.mat} columns={["RS SCORE", "CHECK-IN %", "90-DAY RET."]} /><DynamicCohortCard title="Check-In Adherence Performance" subtitle="Impact of high vs low adherence on primary outcomes" rows={dashboard.cohort_breakdowns?.adherence} columns={["RS SCORE", "90-DAY RET."]} /></div>
  </div></div>;
}

function DynamicCohortCard({ title, subtitle, rows, columns }: { title: string; subtitle: string; rows?: AggregateCohortRow[]; columns: string[] }) {
  const gridStyle = { gridTemplateColumns: `minmax(0, 1fr) repeat(${columns.length}, 90px)` };
  return <div className={`${panel} p-[20px]`}><p className="text-[15px] font-bold text-[var(--app-text)]">{title}</p><p className="mt-[3px] text-[11px] text-[var(--app-muted)]">{subtitle}</p>{!rows?.length ? <p className="mt-[24px] text-[11px] text-[var(--app-muted)]">No cohort breakdown data returned by the analytics API.</p> : <><div style={gridStyle} className="mt-[18px] grid gap-[8px] border-b border-[var(--app-border)] pb-[8px] text-[9px] text-[var(--app-muted)]"><span>COHORT</span>{columns.map((column) => <span key={column}>{column}</span>)}</div>{rows.map((row) => <div key={row.label} style={gridStyle} className="grid gap-[8px] py-[9px] text-[12px] text-[var(--app-text)]"><span><b className={row.label.includes("<") ? "text-[#ef4444]" : row.label.includes(">") || row.label === "On MAT" ? "text-[#4ade80]" : "text-[var(--app-muted)]"}>{row.label}</b><small className="block text-[10px] text-[var(--app-muted)]">n={row.count} users</small></span><span>{row.rs_score ?? "—"}</span>{columns.includes("CHECK-IN %") && <span className="text-[#4ade80]">{row.checkin_rate == null ? "—" : `${row.checkin_rate}%`}</span>}<span className={row.retention_90_day == null ? "" : "text-[#4ade80]"}>{row.retention_90_day == null ? "—" : `${row.retention_90_day}%`}</span></div>)}</> }</div>;
}
