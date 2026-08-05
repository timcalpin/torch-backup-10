import { useState,useEffect } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { GhostBtn } from "@/components/common/Buttons";
import { MetricCard } from "@/components/common/MetricCard";
import { EditIcon } from "@/components/icons";
import {
  getRelapseSignalStats,
  getRelapseSignalLogs,
  type RelapseSignalStats,
  type RelapseSignalLog,
} from "@/lib/relapseSignals";


function RiskPill({ risk }: { risk: string }) {
  const config = risk === "CRITICAL"
    ? "border-[#ef4444] bg-[rgba(239,68,68,0.12)] text-[#ff5c55]"
    : risk === "MODERATE"
      ? "border-[#eab308] bg-[rgba(234,179,8,0.12)] text-[#facc15]"
      : "border-[#4ade80] bg-[rgba(74,222,128,0.12)] text-[#4ade80]";
  return <span className={`inline-flex w-fit whitespace-nowrap items-center gap-[3px] rounded-full border px-[5px] py-[2px] font-['JetBrains_Mono'] font-bold text-[8px] ${config}`}><span className="h-[4px] w-[4px] rounded-full bg-current" />{risk}</span>;
}

export function RelapseSignalsPage() {
  const [filter, setFilter] = useState("All Signals");
  const [dateOpen, setDateOpen] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(15);
  const [rangeField, setRangeField] = useState<"start" | "end">("start");
  const [stats, setStats] = useState<RelapseSignalStats | null>(null);
  const [logs, setLogs] = useState<RelapseSignalLog[]>([]);
useEffect(() => {
  const fetchData = async () => {
    try {
      const [statsData, logsData] = await Promise.all([
        getRelapseSignalStats(),
        getRelapseSignalLogs(),
      ]);

      setStats(statsData);
      setLogs(logsData);
    } catch (error) {
      console.error(error);
    }
  };

  fetchData();
}, []);
  const monthLabel = monthOffset === 0 ? "March 2026" : monthOffset < 0 ? "February 2026" : "April 2026";
  const tabs = ["All Signals", "Critical", "Moderate", "Low Risk"];
  const visible =
  filter === "All Signals"
    ? logs
    : logs.filter((signal) => {
        if (filter === "Critical") {
          return signal.severity.toLowerCase() === "critical";
        }

        if (filter === "Moderate") {
          return signal.severity.toLowerCase() === "moderate";
        }

        if (filter === "Low Risk") {
          return signal.severity.toLowerCase() === "low risk";
        }

        return true;
      });
  const bars = [
    ["Missed Check-ins", "34%", "#f97342", "w-[84%]"], ["Anxiety Spike", "24%", "#ef4444", "w-[62%]"], ["Mood Decline", "18%", "#facc15", "w-[48%]"], ["Confidence Drop", "12%", "#6b8ab0", "w-[34%]"], ["Social Isolation", "6%", "#71685d", "w-[18%]"], ["Sleep Disruption", "6%", "#71685d", "w-[18%]"],
  ];
  return (
    <div className="flex-1 min-w-0 overflow-y-auto bg-[var(--app-bg)]">
      <div className="p-[24px] lg:p-[32px] flex flex-col gap-[20px]">
        <PageHeader eyebrow="HIGH RISK MONITORED · 156 ACTIVE SIGNALS" title="Relapse Signals">
          <div className="relative">
            <GhostBtn label={`${monthOffset === 0 ? "Mar" : monthOffset < 0 ? "Feb" : "Apr"} ${rangeStart} – ${monthOffset === 0 ? "Mar" : monthOffset < 0 ? "Feb" : "Apr"} ${rangeEnd}, 2026`} icon={<CalendarDays size={14} strokeWidth={1.7} />} onClick={() => setDateOpen((open) => !open)} />
            {dateOpen && <div className="absolute right-0 top-[46px] z-20 w-[278px] rounded-[10px] bg-[var(--app-surface)] border border-[var(--app-border-strong)] p-[12px] shadow-2xl">
              <div className="grid grid-cols-2 gap-[6px] mb-[10px]"><button onClick={() => setRangeField("start")} className={`rounded-[6px] border px-[8px] py-[6px] text-left ${rangeField === "start" ? "border-[#f37422] bg-[rgba(243,116,34,0.10)]" : "border-[var(--app-border)]"}`}><span className="block font-['JetBrains_Mono'] text-[8px] text-[var(--app-muted)]">FROM</span><span className="font-['Figtree'] text-[11px] text-[var(--app-text)]">{monthLabel.split(" ")[0]} {rangeStart}</span></button><button onClick={() => setRangeField("end")} className={`rounded-[6px] border px-[8px] py-[6px] text-left ${rangeField === "end" ? "border-[#f37422] bg-[rgba(243,116,34,0.10)]" : "border-[var(--app-border)]"}`}><span className="block font-['JetBrains_Mono'] text-[8px] text-[var(--app-muted)]">TO</span><span className="font-['Figtree'] text-[11px] text-[var(--app-text)]">{monthLabel.split(" ")[0]} {rangeEnd}</span></button></div>
              <div className="flex items-center justify-between mb-[10px]"><button aria-label="Previous month" onClick={() => setMonthOffset((offset) => Math.max(-1, offset - 1))} className="p-[4px] text-[var(--app-muted)] hover:text-[#f37422] cursor-pointer"><ChevronLeft size={15} /></button><span className="font-['Figtree'] font-semibold text-[12px] text-[var(--app-text)]">{monthLabel}</span><button aria-label="Next month" onClick={() => setMonthOffset((offset) => Math.min(1, offset + 1))} className="p-[4px] text-[var(--app-muted)] hover:text-[#f37422] cursor-pointer"><ChevronRight size={15} /></button></div>
              <div className="grid grid-cols-7 gap-[3px] text-center font-['JetBrains_Mono'] text-[8px] text-[var(--app-muted)] mb-[4px]">{"SMTWTFS".split("").map((day, i) => <span key={`${day}-${i}`}>{day}</span>)}</div>
              <div className="grid grid-cols-7 gap-[3px]">{Array.from({ length: 31 }, (_, index) => index + 1).map((day) => { const inRange = day >= rangeStart && day <= rangeEnd; const selected = day === rangeStart || day === rangeEnd; return <button key={day} onClick={() => { if (rangeField === "start") { setRangeStart(day); if (day > rangeEnd) setRangeEnd(day); setRangeField("end"); } else { setRangeEnd(Math.max(day, rangeStart)); setDateOpen(false); } }} className={`h-[27px] rounded-[5px] font-['Figtree'] text-[10px] cursor-pointer ${selected ? "bg-[#f37422] text-white" : inRange ? "bg-[rgba(243,116,34,0.12)] text-[#f37422]" : "text-[var(--app-text)] hover:bg-[var(--app-hover)]"}`}>{day}</button>; })}</div>
            </div>}
          </div>
          <GhostBtn label="Export Report" />
        </PageHeader>
        <div className="flex flex-wrap gap-[10px]">
          <MetricCard label="SIGNALS DETECTED" value={String(stats?.signals_detected ?? 0)} delta="↑ 8% vs last week" deltaColor="#4ade80" accentColor="#f37422" />
          <MetricCard label="CRITICAL ALERTS" value={String(stats?.critical_alerts ?? 0)} delta="↑ 12% vs last week" deltaColor="#4ade80" accentColor="#ef4444" />
          <MetricCard label="AVG RESPONSE TIME" value="2.4h" delta="↓ 15% vs last week" deltaColor="#ef4444" accentColor="#4ade80" />
          <MetricCard label="INTERVENTION SUCCESS" value="84%" delta="↑ 3% vs last week" deltaColor="#4ade80" accentColor="#6b8ab0" />
        </div> 
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_250px] gap-[12px] min-h-[440px]">
          <section className="rounded-[12px] bg-[var(--app-surface)] border border-[var(--app-border)] overflow-hidden">
            <div className="px-[14px] pt-[12px] border-b border-[var(--app-border)] flex items-center justify-between gap-3">
              <div className="flex gap-[4px] overflow-x-auto">
                <span className="font-['Figtree'] font-semibold text-[var(--app-text)] text-[12px] pr-[10px] py-[8px] whitespace-nowrap">Recent Logs</span>
                {tabs.map((tab) => <button key={tab} onClick={() => setFilter(tab)} className={`px-[9px] py-[5px] mb-[6px] rounded-[5px] whitespace-nowrap font-['Figtree'] text-[10px] cursor-pointer ${filter === tab ? "bg-[rgba(243,116,34,0.16)] text-[#f37422] font-semibold" : "text-[var(--app-muted)] hover:text-[var(--app-text)]"}`}>{tab}</button>)}
              </div>
              <button className="hidden md:block shrink-0 text-[var(--app-muted)] rounded-[5px] border border-[var(--app-border)] px-[8px] py-[5px] font-['Figtree'] text-[9px]">Sort by: <b className="text-[var(--app-text)]">Severity ↓</b></button>
            </div>
            <div className="min-w-[700px] px-[12px]">
              <div className="grid grid-cols-[90px_102px_52px_minmax(150px,1fr)_75px_74px_55px] gap-[8px] py-[10px] font-['JetBrains_Mono'] font-bold text-[var(--app-muted)] text-[10px] border-b border-[var(--app-border-soft)]"><span>PATIENT</span><span>SIGNAL TYPE</span><span>TIME</span><span>DESCRIPTION</span><span>COUNSELOR</span><span>STATUS</span></div>
              {visible.map((signal) => <div key={signal.patient} className="grid grid-cols-[90px_102px_52px_minmax(150px,1fr)_75px_74px_55px] gap-[8px] items-center py-[7px] border-b border-[var(--app-border-soft)]">
                <div className="flex gap-[7px] items-center min-w-0"><span className="w-[22px] h-[22px] rounded-full bg-[var(--app-hover)] text-[var(--app-muted)] flex items-center justify-center font-['JetBrains_Mono'] text-[8px] shrink-0">{signal.patient.split(" ").map((name) => name[0]).join("").slice(0, 2).toUpperCase()}</span><div className="min-w-0"><p className="font-['Figtree'] font-semibold text-[var(--app-text)] text-[12px] truncate">{signal.patient}</p><p className="font-['Figtree'] text-[var(--app-muted)] text-[11px] truncate">{signal.email}</p></div></div>
                <RiskPill risk={signal.severity.toString().toUpperCase()} /><span className="font-['Figtree'] text-[var(--app-muted)] text-[11px]">{signal.time}</span><p className="font-['Figtree'] text-[var(--app-text)] text-[12px] truncate">{signal.reason}</p><span className="font-['Figtree'] text-[var(--app-muted)] text-[11px] truncate">{signal.counselor}</span><span className={`w-fit rounded-[4px] px-[6px] py-[3px] font-['Figtree'] text-[8px] ${signal.status === "New" ? "bg-[rgba(243,116,34,0.16)] text-[#f37422]" : signal.status === "Reviewing" ? "bg-[rgba(250,204,21,0.14)] text-[#facc15]" : "bg-[rgba(138,128,115,0.13)] text-[var(--app-muted)]"}`}>{signal.status}</span><div className="flex gap-[9px] text-[var(--app-muted)]"></div>
              </div>)}
            </div> 
          </section> 
          <aside className="flex flex-col gap-[12px]">
            <section className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-[12px] p-[12px]"><p className="font-['Figtree'] font-semibold text-[var(--app-text)] text-[12px]">Signals by Substance / Type</p><p className="font-['Figtree'] text-[var(--app-muted)] text-[11px] mt-[2px]">Proportion of triggers surfaced this week</p><div className="mt-[10px] space-y-[7px]">{bars.map(([label, pct, color, width]) => <div key={label as string} className="grid grid-cols-[84px_1fr_24px] gap-[7px] items-center"><span className="font-['Figtree'] text-[var(--app-muted)] text-[11px] truncate">{label}</span><span className="h-[5px] rounded-full bg-[var(--app-border)] overflow-hidden"><span className={`block h-full rounded-full ${width}`} style={{ background: color as string }} /></span><span className="font-['JetBrains_Mono'] text-[var(--app-muted)] text-[8px] text-right">{pct}</span></div>)}</div></section>
            <section className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-[12px] p-[12px]"><p className="font-['Figtree'] font-semibold text-[var(--app-text)] text-[12px]">Response Time Trend</p><p className="font-['Figtree'] text-[var(--app-muted)] text-[11px] mt-[2px]">Avg response times over past 7 days (hours)</p><svg className="w-full h-[102px] mt-[8px]" viewBox="0 0 230 100" fill="none"><path d="M0 16H230M0 48H230M0 80H230" stroke="rgba(244,237,227,.06)" /><path d="M0 14 C25 24,33 26,55 36 S99 53,126 59 S166 70,190 77 S215 80,230 82" stroke="#4ade80" strokeWidth="1.5" /><text x="0" y="97" fill="#8a8073" fontSize="7">Mon</text><text x="77" y="97" fill="#8a8073" fontSize="7">Wed</text><text x="151" y="97" fill="#8a8073" fontSize="7">Fri</text><text x="218" y="97" fill="#8a8073" fontSize="7">Sun</text></svg></section>
          </aside>
        </div>
      </div>
    </div>
  );
}
