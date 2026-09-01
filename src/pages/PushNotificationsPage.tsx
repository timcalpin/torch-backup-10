import { useMemo, useState } from "react";
import { Bell, ChevronLeft, ChevronRight, Filter, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const notifications = [
  ["Daily Check-in Reminder", "Time for your daily reflection. How are you feeling today?", "Rule-Based", "All Active Users", "Every day @ 8:00 AM", "42.8%", "SCHEDULED", "blue"],
  ["Milestone reached: 30 Days!", "Incredible job! You've officially hit 30 days of sobriety.", "Scheduled", "Cohort 30d+", "Aug 10, 2026", "78.2%", "DELIVERED", "green"],
  ["New Group Session Available", "Join Dr. Chen tonight for an open discussion on craving management.", "Manual", "Anxiety Focus Cohort", "Aug 9, 2026", "31.5%", "DELIVERED", "green"],
  ["Crisis Resource Update", "Emergency counselors are available 24/7. Tap to see phone/chat.", "Manual", "All Users", "Aug 8, 2026", "55.0%", "DELIVERED", "green"],
  ["Weekly Progress Summary", "Your weekly dashboard summary. You did great this week!", "Scheduled", "All Users", "Aug 7, 2026", "49.1%", "DELIVERED", "green"],
  ["Missed Check-in Follow-up", "We noticed you missed today's check-in. Just wanted to say we're here.", "Rule-Based", "Inactive 1d+", "Triggered (Real-time)", "62.4%", "SCHEDULED", "blue"],
] as const;

function StatCard({ label, value, note, color }: { label: string; value: string; note: string; color: string }) {
  return <div className="relative overflow-hidden rounded-[12px] border border-[var(--app-border)] bg-[var(--app-surface)] p-[16px]">
    <span className="font-['JetBrains_Mono'] text-[9px] font-bold tracking-widest text-[var(--app-muted)]">{label}</span>
    <p className="mt-[14px] font-['Figtree'] text-[28px] font-bold" style={{ color }}>{value}</p>
    <p className="mt-[2px] font-['JetBrains_Mono'] text-[9px] text-[var(--app-muted)]">{note}</p>
    <span className="absolute right-[16px] top-[20px] h-[1px] w-[48px] rotate-[-12deg]" style={{ background: color }} />
  </div>;
}

export function PushNotificationsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All");
  const filtered = useMemo(() => notifications.filter(([title, body, type]) => {
    const matchesSearch = `${title} ${body} ${type}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (tab === "All" || type.toLowerCase() === tab.toLowerCase() || (tab === "Scheduled" && type === "Rule-Based"));
  }), [search, tab]);

  return <div className="flex-1 min-w-0 overflow-y-auto bg-[var(--app-bg)]">
    <div className="mx-auto flex max-w-[1180px] flex-col gap-[20px] p-[24px] lg:p-[32px]">
      <div className="flex flex-wrap items-end justify-between gap-[16px]">
        <div>
          <p className="font-['JetBrains_Mono'] text-[10px] font-bold uppercase tracking-widest text-[#f37422]">SYSTEM · 8 ACTIVE RULES · UAT STAGING</p>
          <h1 className="mt-[5px] font-['Figtree'] text-[28px] font-bold text-[var(--app-text)]">Push Notifications</h1>
        </div>
        <div className="flex flex-wrap items-center gap-[10px]">
          <div className="relative"><Search size={15} className="pointer-events-none absolute left-[12px] top-1/2 -translate-y-1/2 text-[var(--app-muted)]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notifications..." className="h-[38px] w-[240px] rounded-[9px] border border-[var(--app-border)] bg-[var(--app-surface)] pl-[34px] pr-[12px] text-[12px] text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)] focus:border-[#f37422]" /></div>
          <button type="button" className="inline-flex h-[38px] items-center gap-[8px] rounded-[9px] border border-[var(--app-border)] px-[14px] text-[12px] text-[var(--app-muted)]"><Filter size={14} />Filter</button>
          <button type="button" onClick={() => navigate("/push-notifications/create")} className="inline-flex h-[38px] items-center gap-[7px] rounded-[9px] bg-[#f37422] px-[15px] text-[12px] font-semibold text-white shadow-[0_5px_16px_rgba(243,116,34,0.25)]"><Plus size={14} />Create Notification</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="TOTAL SENT" value="12,847" note="↑ 5.2% this month" color="#f37422" />
        <StatCard label="AVG. OPEN RATE" value="34.2%" note="↑ 1.8% vs avg" color="#4ade80" />
        <StatCard label="ACTIVE RULES" value="8" note="— custom conditions" color="#facc15" />
        <StatCard label="SCHEDULED QUEUE" value="3" note="↓ 2 pending delivery" color="#38bdf8" />
      </div>

      <section className="overflow-hidden rounded-[12px] border border-[var(--app-border)] bg-[var(--app-surface)]">
        <div className="flex flex-wrap items-center justify-between gap-[12px] border-b border-[var(--app-border)] px-[18px] py-[12px]">
          <div className="flex items-center gap-[18px]"><h2 className="font-['Figtree'] text-[14px] font-semibold text-[var(--app-text)]">History &amp; Logs</h2><div className="flex items-center gap-[4px]">{["All", "Sent", "Scheduled", "Drafts"].map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={`rounded-[6px] px-[10px] py-[6px] text-[11px] ${tab === item ? "bg-[rgba(243,116,34,0.14)] font-semibold text-[#f37422]" : "text-[var(--app-muted)]"}`}>{item}</button>)}</div></div>
          <span className="rounded-[6px] border border-[var(--app-border)] px-[8px] py-[5px] font-['JetBrains_Mono'] text-[9px] text-[var(--app-muted)]">Sort by: <b className="text-[var(--app-text)]">Date ↓</b></span>
        </div>
        <div className="overflow-x-auto"><div className="min-w-[920px]">
          <div className="grid grid-cols-[minmax(300px,1.6fr)_110px_140px_175px_80px_105px_70px] gap-[10px] border-b border-[var(--app-border)] px-[18px] py-[10px] font-['JetBrains_Mono'] text-[9px] font-bold tracking-wide text-[var(--app-muted)]"><span>NOTIFICATION</span><span>TYPE</span><span>AUDIENCE</span><span>DATE / TRIGGER</span><span>OPEN RATE</span><span>STATUS</span><span>ACTION</span></div>
          {filtered.map(([title, body, type, audience, date, rate, status, statusColor]) => <div key={title} className="grid grid-cols-[minmax(300px,1.6fr)_110px_140px_175px_80px_105px_70px] items-center gap-[10px] border-b border-[var(--app-border-soft)] px-[18px] py-[13px] last:border-0"><div><p className="font-['Figtree'] text-[12px] font-semibold text-[var(--app-text)]">{title}</p><p className="mt-[2px] truncate font-['Figtree'] text-[10px] text-[var(--app-muted)]">{body}</p></div><span className="font-['JetBrains_Mono'] text-[10px] text-[var(--app-muted)]">{type}</span><span className="font-['Figtree'] text-[12px] text-[var(--app-text)]">{audience}</span><span className="font-['JetBrains_Mono'] text-[10px] text-[var(--app-muted)]">{date}</span><span className="font-['JetBrains_Mono'] text-[11px] font-bold text-[#f37422]">{rate}</span><span className={`w-fit rounded-full border px-[8px] py-[3px] font-['JetBrains_Mono'] text-[9px] font-bold ${statusColor === "blue" ? "border-sky-400 text-sky-400" : "border-green-400 text-green-400"}`}>● {status}</span><button type="button" className="text-left font-['Figtree'] text-[11px] font-semibold text-[#f37422]">View →</button></div>)}
        </div></div>
        <div className="flex items-center justify-between border-t border-[var(--app-border)] px-[18px] py-[11px]"><span className="font-['JetBrains_Mono'] text-[9px] text-[var(--app-muted)]">Showing <b className="text-[var(--app-text)]">{Math.min(filtered.length, 6)}</b> of 24 notifications</span><div className="flex items-center gap-[6px] text-[11px] text-[var(--app-muted)]"><ChevronLeft size={14} /><span className="rounded-[6px] bg-[#f37422] px-[10px] py-[7px] font-bold text-white">1</span><span className="px-[5px]">2</span><span className="px-[5px]">3</span><ChevronRight size={14} /></div></div>
      </section>
    </div>
  </div>;
}
