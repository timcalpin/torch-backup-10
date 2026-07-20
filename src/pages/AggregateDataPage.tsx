import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PageHeader } from "@/components/common/PageHeader";
import { GhostBtn } from "@/components/common/Buttons";
import { MetricCard } from "@/components/common/MetricCard";

const trendData = [
  { date: "Jan 1", avgDays: 45, checkIn: 64, highRisk: 6.2 },
  { date: "Jan 15", avgDays: 47, checkIn: 66, highRisk: 5.9 },
  { date: "Feb 1", avgDays: 52, checkIn: 69, highRisk: 5.4 },
  { date: "Feb 15", avgDays: 55, checkIn: 72, highRisk: 5.1 },
  { date: "Mar 1", avgDays: 58, checkIn: 75, highRisk: 4.6 },
  { date: "Mar 15", avgDays: 61, checkIn: 78, highRisk: 4.2 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--app-surface)] border border-[var(--app-border-strong)] rounded-[10px] px-[14px] py-[10px] shadow-xl">
      <p className="font-['JetBrains_Mono'] font-bold text-[var(--app-muted)] text-[10px] mb-[6px]">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-[8px]">
          <div className="w-[8px] h-[8px] rounded-full" style={{ background: p.color }} />
          <span className="font-['Figtree'] text-[12px] text-[var(--app-text)]">{p.name}: <strong>{p.value}</strong></span>
        </div>
      ))}
    </div>
  );
};

function DateRangeCalendar() {
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState(1);
  const [end, setEnd] = useState(15);
  const [field, setField] = useState<"start" | "end">("start");
  const [monthOffset, setMonthOffset] = useState(0);
  const month = monthOffset === 0 ? "Mar" : monthOffset < 0 ? "Feb" : "Apr";
  const title = month === "Mar" ? "March 2026" : month === "Feb" ? "February 2026" : "April 2026";
  return (
    <div className="relative">
      <GhostBtn label={`${month} ${start} – ${month} ${end}, 2026`} icon={<CalendarDays size={14} strokeWidth={1.7} />} onClick={() => setOpen((value) => !value)} />
      {open && (
        <div className="absolute right-0 top-[46px] z-30 w-[278px] rounded-[10px] bg-[var(--app-surface)] border border-[var(--app-border-strong)] p-[12px] shadow-2xl">
          <div className="grid grid-cols-2 gap-[6px] mb-[10px]">
            <button onClick={() => setField("start")} className={`rounded-[6px] border px-[8px] py-[6px] text-left cursor-pointer ${field === "start" ? "border-[#f37422] bg-[rgba(243,116,34,0.10)]" : "border-[var(--app-border)]"}`}>
              <span className="block font-['JetBrains_Mono'] text-[8px] text-[var(--app-muted)]">FROM</span>
              <span className="font-['Figtree'] text-[11px] text-[var(--app-text)]">{month} {start}, 2026</span>
            </button>
            <button onClick={() => setField("end")} className={`rounded-[6px] border px-[8px] py-[6px] text-left cursor-pointer ${field === "end" ? "border-[#f37422] bg-[rgba(243,116,34,0.10)]" : "border-[var(--app-border)]"}`}>
              <span className="block font-['JetBrains_Mono'] text-[8px] text-[var(--app-muted)]">TO</span>
              <span className="font-['Figtree'] text-[11px] text-[var(--app-text)]">{month} {end}, 2026</span>
            </button>
          </div>
          <div className="flex items-center justify-between mb-[10px]">
            <button onClick={() => setMonthOffset((value) => Math.max(-1, value - 1))} className="p-[4px] text-[var(--app-muted)] cursor-pointer"><ChevronLeft size={15} /></button>
            <span className="font-['Figtree'] font-semibold text-[12px] text-[var(--app-text)]">{title}</span>
            <button onClick={() => setMonthOffset((value) => Math.min(1, value + 1))} className="p-[4px] text-[var(--app-muted)] cursor-pointer"><ChevronRight size={15} /></button>
          </div>
          <div className="grid grid-cols-7 gap-[3px] text-center font-['JetBrains_Mono'] text-[8px] text-[var(--app-muted)] mb-[4px]">
            {"SMTWTFS".split("").map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-[3px]">
            {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => {
              const inRange = day >= start && day <= end;
              const endpoint = day === start || day === end;
              return (
                <button
                  key={day}
                  onClick={() => {
                    if (field === "start") {
                      setStart(day);
                      if (day > end) setEnd(day);
                      setField("end");
                    } else {
                      setEnd(Math.max(day, start));
                      setOpen(false);
                    }
                  }}
                  className={`h-[27px] rounded-[5px] font-['Figtree'] text-[10px] cursor-pointer ${endpoint ? "bg-[#f37422] text-white" : inRange ? "bg-[rgba(243,116,34,0.12)] text-[#f37422]" : "text-[var(--app-text)] hover:bg-[var(--app-hover)]"}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function AggregateDataPage() {
  return (
    <div className="flex-1 min-w-0 overflow-y-auto">
      <div className="p-[24px] lg:p-[32px] flex flex-col gap-[20px]">
        <PageHeader eyebrow="2,847 USERS · ANONYMIZED" title="Aggregate Data">
          <DateRangeCalendar />
          <GhostBtn label="Export Report" />
        </PageHeader>

        <div className="flex gap-[10px] flex-wrap">
          <MetricCard label="AVG DAYS SOBER" value="61.4" delta="↑ +8.2 days (+15%)" deltaColor="#4ade80" accentColor="#f37422" />
          <MetricCard label="ACTIVE USERS" value="1,204" delta="↑ +143 users (+13%)" deltaColor="#4ade80" accentColor="#4ade80" />
          <MetricCard label="AVG MOTIVATION" value="68%" delta="↑ +4% vs last period" deltaColor="#4ade80" accentColor="#6b8ab0" />
          <MetricCard label="CHECK-IN RATE" value="78%" delta="↑ +5% vs last period" deltaColor="#4ade80" accentColor="#6b8ab0" />
          <MetricCard label="HIGH RISK" value="4.2%" delta="↓ -1.1% (good)" deltaColor="#4ade80" accentColor="#ef4444" />
          <MetricCard label="AVG ANXIETY" value="38%" delta="↑ +3% (watch)" deltaColor="#facc15" accentColor="#facc15" />
        </div>

        {/* Chart */}
        <div className="bg-[var(--app-surface)] rounded-[12px] relative">
          <div className="absolute inset-0 rounded-[12px] border border-[var(--app-border)] pointer-events-none" />
          <div className="p-[24px]">
            <div className="flex items-center justify-between mb-[20px]">
              <div>
                <p className="font-['Figtree'] font-bold text-[var(--app-text)] text-[16px]">Population Sobriety Trend</p>
                <p className="font-['JetBrains_Mono'] font-bold text-[var(--app-muted)] text-[10px] mt-[2px]">Jan – Mar 2026 · 2,847 users</p>
              </div>
              <div className="flex items-center gap-[16px]">
                {[
                  { color: "#f37422", label: "Avg Days Sober" },
                  { color: "#6b8ab0", label: "Check-in Rate %" },
                  { color: "#ef4444", label: "High Risk %" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-[6px]">
                    <div className="w-[8px] h-[8px] rounded-full" style={{ background: l.color }} />
                    <span className="font-['JetBrains_Mono'] font-bold text-[var(--app-muted)] text-[9px]">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart id="aggregate-trend-chart" data={trendData} margin={{ top: 4, right: 8, left: -24, bottom: 4 }}>
                <CartesianGrid key="aggregate-grid" strokeDasharray="3 3" stroke="rgba(244,237,227,0.06)" />
                <XAxis key="aggregate-x-axis" xAxisId="aggregate-x" dataKey="date" tick={{ fill: "#8a8073", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                <YAxis key="aggregate-y-axis" yAxisId="aggregate-y" tick={{ fill: "#8a8073", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                <Tooltip key="aggregate-tooltip" content={<CustomTooltip />} />
                <Line key="avg-days-line" id="avg-days-line" xAxisId="aggregate-x" yAxisId="aggregate-y" type="monotone" dataKey="avgDays" stroke="#f37422" strokeWidth={2} dot={{ r: 3, fill: "#f37422" }} name="Avg Days Sober" isAnimationActive={false} />
                <Line key="check-in-line" id="check-in-line" xAxisId="aggregate-x" yAxisId="aggregate-y" type="monotone" dataKey="checkIn" stroke="#6b8ab0" strokeWidth={2} dot={{ r: 3, fill: "#6b8ab0" }} name="Check-in Rate %" isAnimationActive={false} />
                <Line key="high-risk-line" id="high-risk-line" xAxisId="aggregate-x" yAxisId="aggregate-y" type="monotone" dataKey="highRisk" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: "#ef4444" }} name="High Risk %" isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Second chart row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[10px]">
          {[
            { title: "Avg Motivation Score", subtitle: "68% avg · ↑4% this period", color: "#6b8ab0", data: trendData.map((d) => ({ ...d, val: 58 + Math.round(d.avgDays * 0.15) })) },
            { title: "Avg Anxiety Score", subtitle: "38% avg · ↑3% (watch)", color: "#facc15", data: trendData.map((d) => ({ ...d, val: 42 - Math.round(d.avgDays * 0.06) })) },
          ].map((ch) => (
            <div key={ch.title} className="bg-[var(--app-surface)] rounded-[12px] relative">
              <div className="absolute inset-0 rounded-[12px] border border-[var(--app-border)] pointer-events-none" />
              <div className="p-[20px]">
                <p className="font-['Figtree'] font-bold text-[var(--app-text)] text-[14px]">{ch.title}</p>
                <p className="font-['JetBrains_Mono'] font-bold text-[var(--app-muted)] text-[10px] mt-[2px] mb-[16px]">{ch.subtitle}</p>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart id={`${ch.title}-chart`} data={ch.data} margin={{ top: 4, right: 4, left: -28, bottom: 4 }}>
                    <CartesianGrid key={`${ch.title}-grid`} strokeDasharray="3 3" stroke="rgba(244,237,227,0.06)" />
                    <XAxis key={`${ch.title}-x`} xAxisId={`${ch.title}-x`} dataKey="date" tick={{ fill: "#8a8073", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                    <YAxis key={`${ch.title}-y`} yAxisId={`${ch.title}-y`} tick={{ fill: "#8a8073", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                    <Line key={`${ch.title}-line`} id={`${ch.title}-line`} xAxisId={`${ch.title}-x`} yAxisId={`${ch.title}-y`} type="monotone" dataKey="val" stroke={ch.color} strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
