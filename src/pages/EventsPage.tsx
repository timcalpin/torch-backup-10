import { useState } from "react";
import { useAppContext } from "@/app/app-context";
import { PageHeader } from "@/components/common/PageHeader";
import { GhostBtn, PrimaryBtn } from "@/components/common/Buttons";
import { MetricCard } from "@/components/common/MetricCard";
import { TableCard, TableToolbar, TableHead, TableRow } from "@/components/common/Table";
import { StatusPill } from "@/components/common/StatusPill";
import { ActionBtn } from "@/components/common/ActionBtn";
import { FilterIcon, CalendarIcon, EyeIcon, EditIcon } from "@/components/icons";

const EVENTS = [
  { id: 1, name: "Tuesday Night Recovery Meeting", organizer: "James T.", type: "RECOVERY", date: "Jun 17", time: "7:00 PM", location: "Community Center", attendees: 18, status: "ACTIVE" as const },
  { id: 2, name: "Morning Meditation Session", organizer: "Sarah K.", type: "WELLNESS", date: "Jun 17", time: "9:00 AM", location: "Online", attendees: 12, status: "ACTIVE" as const },
  { id: 3, name: "SMART Recovery Workshop", organizer: "Dr. Chen", type: "RECOVERY", date: "Jun 20", time: "6:00 PM", location: "Room 3B", attendees: 22, status: "PENDING" as const },
  { id: 4, name: "Family Healing Circle", organizer: "Maria L.", type: "COMMUNITY", date: "Jun 22", time: "2:00 PM", location: "Main Hall", attendees: 30, status: "ACTIVE" as const },
  { id: 5, name: "Yoga & Mindfulness", organizer: "Sarah K.", type: "WELLNESS", date: "Jun 20", time: "10:00 AM", location: "Studio A", attendees: 10, status: "ACTIVE" as const },
  { id: 6, name: "NA Saturday Meeting", organizer: "James T.", type: "RECOVERY", date: "Jun 21", time: "11:00 AM", location: "Room 1A", attendees: 25, status: "ACTIVE" as const },
];

const EVENT_TYPE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  RECOVERY: { bg: "rgba(243,116,34,0.1)", color: "#f37422", border: "rgba(243,116,34,0.3)" },
  WELLNESS: { bg: "rgba(183,163,110,0.1)", color: "#b7a36e", border: "rgba(183,163,110,0.3)" },
  COMMUNITY: { bg: "rgba(74,222,128,0.1)", color: "#4ade80", border: "rgba(74,222,128,0.3)" },
  CLINICAL: { bg: "rgba(107,138,176,0.1)", color: "#6b8ab0", border: "rgba(107,138,176,0.3)" },
};

export function EventsPage() {
  const { setModal } = useAppContext();
  const [filter, setFilter] = useState("All");
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const calDays = [
    { day: "MON", date: 16 + weekOffset * 7, events: [] as string[] },
    { day: "TUE", date: 17 + weekOffset * 7, events: ["Recovery", "Wellness"] },
    { day: "WED", date: 18 + weekOffset * 7, events: [] as string[] },
    { day: "THU", date: 19 + weekOffset * 7, events: ["Meditation", "Therapy"], today: weekOffset === 0 },
    { day: "FRI", date: 20 + weekOffset * 7, events: ["SMART", "Yoga"] },
    { day: "SAT", date: 21 + weekOffset * 7, events: ["NA Meeting"] },
    { day: "SUN", date: 22 + weekOffset * 7, events: ["Family", "Sober Social"] },
  ];

  const evTagColors: Record<string, { bg: string; color: string }> = {
    Recovery: { bg: "rgba(243,116,34,0.15)", color: "#f37422" },
    Wellness: { bg: "rgba(183,163,110,0.15)", color: "#b7a36e" },
    Meditation: { bg: "rgba(243,116,34,0.15)", color: "#f37422" },
    Therapy: { bg: "rgba(107,138,176,0.15)", color: "#6b8ab0" },
    SMART: { bg: "rgba(243,116,34,0.15)", color: "#f37422" },
    Yoga: { bg: "rgba(183,163,110,0.15)", color: "#b7a36e" },
    "NA Meeting": { bg: "rgba(243,116,34,0.15)", color: "#f37422" },
    Family: { bg: "rgba(74,222,128,0.15)", color: "#4ade80" },
    "Sober Social": { bg: "rgba(74,222,128,0.15)", color: "#4ade80" },
  };

  return (
    <div className="flex-1 min-w-0 overflow-y-auto">
      <div className="p-[24px] lg:p-[32px] flex flex-col gap-[20px]">
        <PageHeader eyebrow="84 SCHEDULED · 12 THIS WEEK" title="Real World Resources">
          <GhostBtn label="Filter" icon={<FilterIcon />} />
          <GhostBtn label="Export" />
          <PrimaryBtn label="+ Create Event" onClick={() => setModal("create-event")} />
        </PageHeader>

        <div className="flex gap-[10px] flex-wrap">
          <MetricCard label="TOTAL EVENTS" value="84" delta="↑ +6 vs last week" deltaColor="#4ade80" accentColor="#f37422" />
          <MetricCard label="THIS WEEK" value="12" delta="↑ +3 vs last week" deltaColor="#4ade80" accentColor="#4ade80" />
          <MetricCard label="AVG ATTENDANCE" value="18" delta="↑ +2 vs last week" deltaColor="#4ade80" accentColor="#6b8ab0" />
          <MetricCard label="COMPLETION RATE" value="76%" delta="↑ +4% vs last week" deltaColor="#4ade80" accentColor="#facc15" />
          <MetricCard label="UPCOMING TODAY" value="3" delta="next at 7:00 PM" deltaColor="#4ade80" accentColor="#a3738f" />
        </div>

        {/* Mini calendar */}
        <div className="bg-[var(--app-surface)] rounded-[12px] relative">
          <div className="absolute inset-0 rounded-[12px] border border-[var(--app-border)] pointer-events-none" />
          <div className="p-[18px] flex flex-col gap-[16px]">
            <div className="flex items-center justify-between">
              <button onClick={() => setWeekOffset((offset) => offset - 1)} className="text-[var(--app-muted)] hover:text-[#f37422] font-['Figtree'] text-[18px] cursor-pointer">‹</button>
              <p className="font-['Figtree'] font-semibold text-[var(--app-text)] text-[13px]">{weekOffset === 0 ? "June 16–22, 2025" : `June ${16 + weekOffset * 7}–${22 + weekOffset * 7}, 2025`}</p>
              <button onClick={() => setWeekOffset((offset) => offset + 1)} className="text-[var(--app-muted)] hover:text-[#f37422] font-['Figtree'] text-[18px] cursor-pointer">›</button>
            </div>
            <div className="flex gap-0 overflow-x-auto">
              {calDays.map((d) => (
                <div key={d.date} className="flex-1 min-w-[80px] flex flex-col items-center gap-[10px]">
                  <div className="flex flex-col items-center gap-[6px]">
                    <p className="font-['JetBrains_Mono'] font-bold text-[var(--app-muted)] text-[10px]">{d.day}</p>
                    <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center ${d.today ? "bg-gradient-to-r from-[#f37422] to-[#c04a12] shadow-[0_0_8px_rgba(243,116,34,0.4)]" : ""}`}>
                      <span className={`font-['Figtree'] text-[14px] ${d.today ? "font-bold text-white" : "font-normal text-[var(--app-text)]"}`}>{d.date}</span>
                    </div>
                  </div>
                  <div className="w-full flex flex-col gap-[3px] px-[3px]">
                    {d.events.map((ev) => {
                      const tc = evTagColors[ev] ?? { bg: "rgba(138,128,115,0.15)", color: "#8a8073" };
                      return (
                        <button key={ev} onClick={() => { setSelectedEvent(ev); setFilter(ev === "Recovery" ? "Recovery" : "All"); }} className={`rounded-[4px] px-[5px] py-[3px] text-left cursor-pointer ${selectedEvent === ev ? "ring-1 ring-[#f37422]" : ""}`} style={{ background: tc.bg }}>
                          <p className="font-['Figtree'] font-semibold text-[9px] truncate" style={{ color: tc.color }}>{ev}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <TableCard>
          <TableToolbar
            title="All Events"
            tabs={["All", "Today", "This Week", "Recovery", "Community", "Clinical"]}
            activeTab={filter}
            onTab={setFilter}
            sortLabel="Date ↑"
          />
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <TableHead cols={[
                { label: "EVENT", w: "flex-1 min-w-[220px]" },
                { label: "TYPE", w: "w-[100px]" },
                { label: "DATE", w: "w-[70px]" },
                { label: "TIME", w: "w-[80px]" },
                { label: "LOCATION", w: "w-[130px]" },
                { label: "ATTENDEES", w: "w-[90px]" },
                { label: "STATUS", w: "w-[100px]" },
                { label: "ACTIONS", w: "w-[60px] text-right" },
              ]} />
              {EVENTS.map((ev) => {
                const tc = EVENT_TYPE_COLORS[ev.type] ?? EVENT_TYPE_COLORS.RECOVERY;
                return (
                  <TableRow key={ev.id}>
                    <div className="flex items-center gap-[10px] flex-1 min-w-[220px]">
                      <div className="w-[32px] h-[32px] rounded-full bg-[rgba(243,116,34,0.15)] flex items-center justify-center flex-shrink-0">
                        <CalendarIcon color="#f37422" />
                      </div>
                      <div>
                        <p className="font-['Figtree'] font-semibold text-[var(--app-text)] text-[13px] leading-tight">{ev.name}</p>
                        <p className="font-['Figtree'] font-normal text-[var(--app-muted)] text-[10px] leading-tight">Organizer: {ev.organizer}</p>
                      </div>
                    </div>
                    <div className="w-[100px]">
                      <span className="inline-flex items-center px-[8px] py-[3px] rounded-[4px] font-['JetBrains_Mono'] font-bold text-[10px]" style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
                        {ev.type}
                      </span>
                    </div>
                    <div className="w-[70px] font-['JetBrains_Mono'] font-bold text-[var(--app-text)] text-[11px]">{ev.date}</div>
                    <div className="w-[80px] font-['JetBrains_Mono'] font-normal text-[var(--app-muted)] text-[11px]">{ev.time}</div>
                    <div className="w-[130px] font-['Figtree'] font-normal text-[var(--app-text)] text-[12px]">{ev.location}</div>
                    <div className="w-[90px] font-['JetBrains_Mono'] font-bold text-[var(--app-text)] text-[12px]">{ev.attendees}</div>
                    <div className="w-[100px]"><StatusPill status={ev.status} /></div>
                    <div className="w-[60px] flex items-center justify-end gap-[10px]">
                      <ActionBtn onClick={() => {}} title="View" icon={<EyeIcon />} />
                      <ActionBtn onClick={() => {}} title="Edit" icon={<EditIcon />} />
                    </div>
                  </TableRow>
                );
              })}
            </div>
          </div>
        </TableCard>
      </div>
    </div>
  );
}
