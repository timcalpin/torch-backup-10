import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { useAppContext } from "@/app/app-context";
import { PageHeader } from "@/components/common/PageHeader";
import { GhostBtn, PrimaryBtn } from "@/components/common/Buttons";
import { MetricCard } from "@/components/common/MetricCard";
import { TableCard, TableToolbar, TableHead, TableRow } from "@/components/common/Table";
import { StatusPill } from "@/components/common/StatusPill";
import { ActionBtn } from "@/components/common/ActionBtn";
import { ModalOverlay, ModalCard, ModalHeader, ModalFooter } from "@/components/common/Modal";
import { FormField, TextInput, TextArea, SelectInput } from "@/components/common/FormFields";
import { FilterIcon, CalendarIcon, EyeIcon, EditIcon } from "@/components/icons";
import { ApiError } from "@/lib/api";
import {
  listEvents,
  getEvent,
  getEventStats,
  updateEvent,
  deleteEvent,
  EVENT_TYPES,
  EVENT_STATUSES,
  type ApiEvent,
  type EventStats,
  type EventType,
  type EventStatus,
} from "@/lib/events";
const EVENT_TYPE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  RECOVERY: { bg: "rgba(243,116,34,0.1)", color: "#f37422", border: "rgba(243,116,34,0.3)" },
  WELLNESS: { bg: "rgba(183,163,110,0.1)", color: "#b7a36e", border: "rgba(183,163,110,0.3)" },
  COMMUNITY: { bg: "rgba(74,222,128,0.1)", color: "#4ade80", border: "rgba(74,222,128,0.3)" },
};

const FILTER_TABS = ["All", "Today", "This Week", "Recovery", "Wellness", "Community"];

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  recovery: "Recovery",
  wellness: "Wellness",
  community: "Community",
};

const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  scheduled: "Scheduled",
  active: "Active",
  pending: "Pending",
  cancelled: "Cancelled",
};

function toDisplayStatus(status: ApiEvent["status"]): "ACTIVE" | "PENDING" | "ARCHIVED" {
  if (status === "active" || status === "scheduled") return "ACTIVE";
  if (status === "cancelled") return "ARCHIVED";
  return "PENDING";
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function ViewEventModal({ eventId, onClose }: { eventId: number; onClose: () => void }) {
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getEvent(eventId)
      .then((response) => {
        if (!cancelled) setEvent(response);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Unable to load event details.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  return (
    <ModalOverlay onClose={onClose}>
      <ModalCard>
        <ModalHeader title="Event details" onClose={onClose} />
        {loading && <p className="font-['Figtree'] text-[13px] text-[var(--app-muted)]">Loading event details...</p>}
        {!loading && error && <p className="font-['Figtree'] text-[13px] text-red-500">{error}</p>}
        {!loading && !error && event && (
          <div className="flex flex-col gap-[20px]">
            <div className="flex items-center gap-[14px]">
              <div className="w-[48px] h-[48px] rounded-full bg-[rgba(243,116,34,0.18)] flex items-center justify-center flex-shrink-0">
                <CalendarIcon color="#f37422" />
              </div>
              <p className="font-['Figtree'] font-bold text-[17px] text-[var(--app-text)]">{event.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-[12px]">
              {[
                ["Type", event.event_type ? EVENT_TYPE_LABELS[event.event_type] : "—"],
                ["Status", event.status ? EVENT_STATUS_LABELS[event.status] : "—"],
                ["Date", new Date(event.start_datetime).toLocaleDateString()],
                ["Time", new Date(event.start_datetime).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })],
                ["Location", event.location || "—"],
                ["Max Attendees", event.max_attendees != null ? String(event.max_attendees) : "—"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[9px] bg-[var(--app-surface)] border border-[var(--app-border)] p-[12px]">
                  <p className="font-['JetBrains_Mono'] text-[9px] text-[var(--app-muted)]">{label}</p>
                  <p className="mt-[4px] font-['Figtree'] font-semibold text-[13px] text-[var(--app-text)]">{value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="font-['JetBrains_Mono'] text-[9px] text-[var(--app-muted)] mb-[6px]">DESCRIPTION</p>
              <p className="font-['Figtree'] text-[13px] text-[var(--app-text)] whitespace-pre-wrap">{event.description || "No description."}</p>
            </div>
          </div>
        )}
        <ModalFooter onCancel={onClose} onConfirm={onClose} confirmLabel="Close" />
      </ModalCard>
    </ModalOverlay>
  );
}

function EditEventModal({ event, onClose, onSaved }: { event: ApiEvent; onClose: () => void; onSaved: () => void }) {
  const start = new Date(event.start_datetime);

  const [name, setName] = useState(event.title);
  const [eventType, setEventType] = useState<EventType>(event.event_type ?? "recovery");
  const [description, setDescription] = useState(event.description);
  const [date, setDate] = useState(start.toISOString().slice(0, 10));
  const [time, setTime] = useState(start.toTimeString().slice(0, 5));
  const [location, setLocation] = useState(event.location);
  const [maxAttendees, setMaxAttendees] = useState(event.max_attendees != null ? String(event.max_attendees) : "");
  const [status, setStatus] = useState<EventStatus>(event.status ?? "scheduled");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim() || !date) {
      setError("Event name and date are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const startDatetime = new Date(`${date}T${time || "00:00"}`).toISOString();
      await updateEvent(event.id, {
        title: name.trim(),
        description: description.trim(),
        event_type: eventType,
        start_datetime: startDatetime,
        location: location.trim(),
        max_attendees: maxAttendees ? Number(maxAttendees) : null,
        status,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to save changes. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalCard>
        <ModalHeader title={`Edit ${event.title}`} onClose={onClose} />
        <div className="flex flex-col gap-[16px]">
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <FormField label="Event Name" required><TextInput value={name} onChange={setName} /></FormField>
            </div>
            <div className="w-full sm:w-[180px]">
              <FormField label="Type">
                <SelectInput
                  options={EVENT_TYPES.map((t) => EVENT_TYPE_LABELS[t])}
                  value={EVENT_TYPE_LABELS[eventType]}
                  onChange={(label) => setEventType(EVENT_TYPES.find((t) => EVENT_TYPE_LABELS[t] === label) ?? "recovery")}
                />
              </FormField>
            </div>
          </div>
          <FormField label="Description"><TextArea value={description} onChange={setDescription} /></FormField>
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[160px]">
              <FormField label="Date" required><TextInput type="date" value={date} onChange={setDate} /></FormField>
            </div>
            <div className="flex-1 min-w-[160px]">
              <FormField label="Time"><TextInput type="time" value={time} onChange={setTime} /></FormField>
            </div>
          </div>
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[160px]">
              <FormField label="Location"><TextInput value={location} onChange={setLocation} /></FormField>
            </div>
            <div className="flex-1 min-w-[160px]">
              <FormField label="Max Attendees"><TextInput type="number" value={maxAttendees} onChange={setMaxAttendees} /></FormField>
            </div>
          </div>
          <FormField label="Status">
            <SelectInput
              options={EVENT_STATUSES.map((s) => EVENT_STATUS_LABELS[s])}
              value={EVENT_STATUS_LABELS[status]}
              onChange={(label) => setStatus(EVENT_STATUSES.find((s) => EVENT_STATUS_LABELS[s] === label) ?? "scheduled")}
            />
          </FormField>
          {error && <p className="font-['Figtree'] text-[13px] text-red-500">{error}</p>}
        </div>
        <ModalFooter
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmLabel={submitting ? "Saving..." : "Save changes"}
          confirmDisabled={submitting}
        />
      </ModalCard>
    </ModalOverlay>
  );
}

export function EventsPage() {
  const { setModal, eventsVersion, bumpEventsVersion } = useAppContext();
  const [filter, setFilter] = useState("All");
  const [weekOffset, setWeekOffset] = useState(0);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [viewEventId, setViewEventId] = useState<number | null>(null);
  const [editEvent, setEditEvent] = useState<ApiEvent | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listEvents()
      .then((response) => {
        if (!cancelled) setEvents(response.results);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Unable to load events.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    getEventStats()
      .then((response) => {
        if (!cancelled) setStats(response);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [eventsVersion]);

  const today = useMemo(() => new Date(), []);
  const weekStart = useMemo(() => {
    const base = startOfWeek(today);
    base.setDate(base.getDate() + weekOffset * 7);
    return base;
  }, [today, weekOffset]);

  const calDays = useMemo(() => {
    const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    return DAY_LABELS.map((label, i) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dayEvents = events.filter((ev) => isSameDay(new Date(ev.start_datetime), date));
      return { day: label, date, isToday: isSameDay(date, today), events: dayEvents };
    });
  }, [weekStart, events, today]);

  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 6);
    return d;
  }, [weekStart]);

  const filtered = events.filter((ev) => {
    if (filter === "All") return true;
    if (filter === "Today") return isSameDay(new Date(ev.start_datetime), today);
    if (filter === "This Week") return calDays.some((d) => isSameDay(d.date, new Date(ev.start_datetime)));
    return ev.event_type?.toLowerCase() === filter.toLowerCase();
  });

  const handleDelete = async (event: ApiEvent) => {
    if (!window.confirm(`Delete "${event.title}"? This cannot be undone.`)) return;
    setActionError(null);
    try {
      await deleteEvent(event.id);
      bumpEventsVersion();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Unable to delete event.");
    }
  };

  const nextUpcomingLabel = stats?.next_upcoming_start
    ? `next at ${new Date(stats.next_upcoming_start).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`
    : "none today";

  return (
    <div className="flex-1 min-w-0 overflow-y-auto">
      <div className="p-[24px] lg:p-[32px] flex flex-col gap-[20px]">
        <PageHeader eyebrow={stats ? `${stats.total_events} SCHEDULED · ${stats.this_week_count} THIS WEEK` : "LOADING EVENTS…"} title="Real World Resources">
          <GhostBtn label="Filter" icon={<FilterIcon />} />
          <GhostBtn label="Export" />
          <PrimaryBtn label="+ Create Event" onClick={() => setModal("create-event")} />
        </PageHeader>

        {error && <p className="font-['Figtree'] text-[13px] text-red-500">{error}</p>}
        {actionError && <p className="font-['Figtree'] text-[13px] text-red-500">{actionError}</p>}

        <div className="flex gap-[10px] flex-wrap">
          <MetricCard label="TOTAL EVENTS" value={stats ? String(stats.total_events) : "—"} delta="Live from server" deltaColor="#8a8073" accentColor="#f37422" />
          <MetricCard label="THIS WEEK" value={stats ? String(stats.this_week_count) : "—"} delta="Live from server" deltaColor="#8a8073" accentColor="#4ade80" />
          <MetricCard label="AVG CAPACITY" value={stats ? String(stats.avg_capacity) : "—"} delta="Live from server" deltaColor="#8a8073" accentColor="#6b8ab0" />
          <MetricCard label="ACTIVE NOW" value={stats ? String(stats.active_now_count) : "—"} delta="Live from server" deltaColor="#8a8073" accentColor="#facc15" />
          <MetricCard label="UPCOMING TODAY" value={stats ? String(stats.upcoming_today_count) : "—"} delta={nextUpcomingLabel} deltaColor="#8a8073" accentColor="#a3738f" />
        </div>

        {/* Mini calendar */}
        <div className="bg-[var(--app-surface)] rounded-[12px] relative">
          <div className="absolute inset-0 rounded-[12px] border border-[var(--app-border)] pointer-events-none" />
          <div className="p-[18px] flex flex-col gap-[16px]">
            <div className="flex items-center justify-between">
              <button onClick={() => setWeekOffset((offset) => offset - 1)} className="text-[var(--app-muted)] hover:text-[#f37422] font-['Figtree'] text-[18px] cursor-pointer">‹</button>
              <p className="font-['Figtree'] font-semibold text-[var(--app-text)] text-[13px]">
                {weekStart.toLocaleDateString(undefined, { month: "long", day: "numeric" })}–{weekEnd.toLocaleDateString(undefined, { day: "numeric", year: "numeric" })}
              </p>
              <button onClick={() => setWeekOffset((offset) => offset + 1)} className="text-[var(--app-muted)] hover:text-[#f37422] font-['Figtree'] text-[18px] cursor-pointer">›</button>
            </div>
            <div className="flex gap-0 overflow-x-auto">
              {calDays.map((d) => (
                <div key={d.date.toISOString()} className="flex-1 min-w-[80px] flex flex-col items-center gap-[10px]">
                  <div className="flex flex-col items-center gap-[6px]">
                    <p className="font-['JetBrains_Mono'] font-bold text-[var(--app-muted)] text-[10px]">{d.day}</p>
                    <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center ${d.isToday ? "bg-gradient-to-r from-[#f37422] to-[#c04a12] shadow-[0_0_8px_rgba(243,116,34,0.4)]" : ""}`}>
                      <span className={`font-['Figtree'] text-[14px] ${d.isToday ? "font-bold text-white" : "font-normal text-[var(--app-text)]"}`}>{d.date.getDate()}</span>
                    </div>
                  </div>
                  <div className="w-full flex flex-col gap-[3px] px-[3px]">
                    {d.events.slice(0, 3).map((ev) => {
                      const tc = EVENT_TYPE_COLORS[(ev.event_type ?? "").toUpperCase()] ?? { bg: "rgba(138,128,115,0.15)", color: "#8a8073", border: "" };
                      return (
                        <button key={ev.id} onClick={() => setViewEventId(ev.id)} className="rounded-[4px] px-[5px] py-[3px] text-left cursor-pointer" style={{ background: tc.bg }} title={ev.title}>
                          <p className="font-['Figtree'] font-semibold text-[9px] truncate" style={{ color: tc.color }}>{ev.title}</p>
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
          <TableToolbar title="All Events" tabs={FILTER_TABS} activeTab={filter} onTab={setFilter} />
          <div className="overflow-x-auto">
            <div className="min-w-[820px]">
              <TableHead cols={[
                { label: "EVENT", w: "flex-1 min-w-[220px]" },
                { label: "TYPE", w: "w-[100px]" },
                { label: "DATE", w: "w-[80px]" },
                { label: "TIME", w: "w-[80px]" },
                { label: "LOCATION", w: "w-[130px]" },
                { label: "MAX ATTENDEES", w: "w-[110px]" },
                { label: "STATUS", w: "w-[100px]" },
                { label: "ACTIONS", w: "w-[80px] text-right" },
              ]} />
              {loading && (
                <div className="py-[48px] text-center">
                  <p className="font-['Figtree'] text-[var(--app-muted)] text-[14px]">Loading events...</p>
                </div>
              )}
              {!loading && filtered.map((ev) => {
                const typeKey = (ev.event_type ?? "").toUpperCase();
                const tc = EVENT_TYPE_COLORS[typeKey] ?? EVENT_TYPE_COLORS.RECOVERY;
                const start = new Date(ev.start_datetime);
                return (
                  <TableRow key={ev.id}>
                    <div className="flex items-center gap-[10px] flex-1 min-w-[220px]">
                      <div className="w-[32px] h-[32px] rounded-full bg-[rgba(243,116,34,0.15)] flex items-center justify-center flex-shrink-0">
                        <CalendarIcon color="#f37422" />
                      </div>
                      <p className="font-['Figtree'] font-semibold text-[var(--app-text)] text-[13px] leading-tight">{ev.title}</p>
                    </div>
                    <div className="w-[100px]">
                      <span className="inline-flex items-center px-[8px] py-[3px] rounded-[4px] font-['JetBrains_Mono'] font-bold text-[10px]" style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
                        {typeKey || "—"}
                      </span>
                    </div>
                    <div className="w-[80px] font-['JetBrains_Mono'] font-bold text-[var(--app-text)] text-[11px]">
                      {start.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </div>
                    <div className="w-[80px] font-['JetBrains_Mono'] font-normal text-[var(--app-muted)] text-[11px]">
                      {start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                    </div>
                    <div className="w-[130px] font-['Figtree'] font-normal text-[var(--app-text)] text-[12px]">{ev.location || "—"}</div>
                    <div className="w-[110px] font-['JetBrains_Mono'] font-bold text-[var(--app-text)] text-[12px]">{ev.max_attendees ?? "—"}</div>
                    <div className="w-[100px]"><StatusPill status={toDisplayStatus(ev.status)} /></div>
                    <div className="w-[80px] flex items-center justify-end gap-[10px]">
                      <ActionBtn onClick={() => setViewEventId(ev.id)} title="View" icon={<EyeIcon />} />
                      <ActionBtn onClick={() => setEditEvent(ev)} title="Edit" icon={<EditIcon />} />
                      <ActionBtn onClick={() => handleDelete(ev)} title="Delete" icon={<Trash2 size={15} strokeWidth={1.8} />} />
                    </div>
                  </TableRow>
                );
              })}
              {!loading && filtered.length === 0 && (
                <div className="py-[48px] text-center">
                  <p className="font-['Figtree'] text-[var(--app-muted)] text-[14px]">
                    {events.length === 0 ? "No events yet." : "No events match this filter."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </TableCard>
        {viewEventId != null && <ViewEventModal eventId={viewEventId} onClose={() => setViewEventId(null)} />}
        {editEvent && <EditEventModal event={editEvent} onClose={() => setEditEvent(null)} onSaved={bumpEventsVersion} />}
      </div>
    </div>
  );
}
