import { useState, useEffect } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PageHeader } from "../components/common/PageHeader";
import { GhostBtn } from "../components/common/Buttons";
import { MetricCard } from "../components/common/MetricCard";
import {
  getAggregateDashboard,
  type AggregateDashboardResponse,
} from "../lib/aggregate";

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { color: string; name: string; value: number }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--app-surface)] border border-[var(--app-border-strong)] rounded-[10px] px-[14px] py-[10px] shadow-xl">
      <p className="font-['JetBrains_Mono'] font-bold text-[var(--app-muted)] text-[10px] mb-[6px]">
        {label}
      </p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-[8px]">
          <div
            className="w-[8px] h-[8px] rounded-full"
            style={{ background: p.color }}
          />
          <span className="font-['Figtree'] text-[12px] text-[var(--app-text)]">
            {p.name}: <strong>{p.value}</strong>
          </span>
        </div>
      ))}
    </div>
  );
};

interface DateRangeCalendarProps {
  startDate: Date;
  endDate: Date;
  onChange: (start: Date, end: Date) => void;
}

function DateRangeCalendar({
  startDate,
  endDate,
  onChange,
}: DateRangeCalendarProps) {
  const [open, setOpen] = useState(false);
  const [field, setField] = useState<"start" | "end">("start");

  const [tempStart, setTempStart] = useState<Date>(startDate);
  const [tempEnd, setTempEnd] = useState<Date>(endDate);

  // Default view month set to end date's month (current active month)
  const [viewDate, setViewDate] = useState<Date>(
    new Date(endDate.getFullYear(), endDate.getMonth(), 1)
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    setTempStart(startDate);
    setTempEnd(endDate);
  }, [startDate, endDate]);

  const year = viewDate.getFullYear();
  const monthIdx = viewDate.getMonth();
  const fullMonthName = viewDate.toLocaleString("default", { month: "long" });

  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, monthIdx, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(year, monthIdx - 1, 1));
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(year, monthIdx + 1, 1);
    if (nextMonth <= new Date(today.getFullYear(), today.getMonth(), 1)) {
      setViewDate(nextMonth);
    }
  };

  const formatDateStr = (d: Date) =>
    `${d.toLocaleString("default", { month: "short" })} ${d.getDate()}, ${d.getFullYear()}`;

  const handleDayClick = (day: number) => {
    const selected = new Date(year, monthIdx, day);
    selected.setHours(0, 0, 0, 0);

    if (selected > today) return;

    if (field === "start") {
      setTempStart(selected);
      if (selected > tempEnd) {
        setTempEnd(selected);
      }
      setField("end");
    } else {
      if (selected < tempStart) {
        setTempStart(selected);
        setTempEnd(selected);
      } else {
        setTempEnd(selected);
      }
      onChange(
        selected < tempStart ? selected : tempStart,
        selected < tempStart ? selected : selected
      );
      setOpen(false);
      setField("start");
    }
  };

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const isInRange = (d: Date) => d >= tempStart && d <= tempEnd;

  const isNextMonthDisabled =
    new Date(year, monthIdx + 1, 1) >
    new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <div className="relative">
      <GhostBtn
        label={`${formatDateStr(startDate)} – ${formatDateStr(endDate)}`}
        icon={<CalendarDays size={14} strokeWidth={1.7} />}
        onClick={() => setOpen((value) => !value)}
      />
      {open && (
        <div className="absolute right-0 top-[46px] z-30 w-[280px] rounded-[10px] bg-[var(--app-surface)] border border-[var(--app-border-strong)] p-[12px] shadow-2xl">
          <div className="grid grid-cols-2 gap-[6px] mb-[10px]">
            <button
              onClick={() => setField("start")}
              className={`rounded-[6px] border px-[8px] py-[6px] text-left cursor-pointer ${
                field === "start"
                  ? "border-[#f37422] bg-[rgba(243,116,34,0.10)]"
                  : "border-[var(--app-border)]"
              }`}
            >
              <span className="block font-['JetBrains_Mono'] text-[8px] text-[var(--app-muted)]">
                FROM
              </span>
              <span className="font-['Figtree'] text-[11px] text-[var(--app-text)]">
                {formatDateStr(tempStart)}
              </span>
            </button>
            <button
              onClick={() => setField("end")}
              className={`rounded-[6px] border px-[8px] py-[6px] text-left cursor-pointer ${
                field === "end"
                  ? "border-[#f37422] bg-[rgba(243,116,34,0.10)]"
                  : "border-[var(--app-border)]"
              }`}
            >
              <span className="block font-['JetBrains_Mono'] text-[8px] text-[var(--app-muted)]">
                TO
              </span>
              <span className="font-['Figtree'] text-[11px] text-[var(--app-text)]">
                {formatDateStr(tempEnd)}
              </span>
            </button>
          </div>

          <div className="flex items-center justify-between mb-[10px]">
            <button
              onClick={handlePrevMonth}
              className="p-[4px] text-[var(--app-muted)] hover:text-[var(--app-text)] cursor-pointer"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="font-['Figtree'] font-semibold text-[12px] text-[var(--app-text)]">
              {fullMonthName} {year}
            </span>
            <button
              onClick={handleNextMonth}
              disabled={isNextMonthDisabled}
              className="p-[4px] text-[var(--app-muted)] hover:text-[var(--app-text)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-[3px] text-center font-['JetBrains_Mono'] text-[8px] text-[var(--app-muted)] mb-[4px]">
            {"SMTWTFS".split("").map((day, index) => (
              <span key={`${day}-${index}`}>{day}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-[3px]">
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-[27px]" />
            ))}

            {Array.from({ length: daysInMonth }, (_, index) => index + 1).map(
              (day) => {
                const currentDate = new Date(year, monthIdx, day);
                currentDate.setHours(0, 0, 0, 0);

                const isFuture = currentDate > today;
                const isToday = isSameDay(currentDate, today);
                const endpoint =
                  isSameDay(currentDate, tempStart) ||
                  isSameDay(currentDate, tempEnd);
                const range = isInRange(currentDate);

                return (
                  <button
                    key={day}
                    disabled={isFuture}
                    onClick={() => handleDayClick(day)}
                    className={`h-[27px] rounded-[5px] font-['Figtree'] text-[10px] ${
                      isFuture
                        ? "opacity-25 cursor-not-allowed text-[var(--app-muted)]"
                        : "cursor-pointer"
                    } ${
                      endpoint && !isFuture
                        ? "bg-[#f37422] text-white font-bold"
                        : range && !isFuture
                        ? "bg-[rgba(243,116,34,0.12)] text-[#f37422]"
                        : isToday
                        ? "border border-[#f37422] text-[var(--app-text)]"
                        : !isFuture
                        ? "text-[var(--app-text)] hover:bg-[var(--app-hover)]"
                        : ""
                    }`}
                  >
                    {day}
                  </button>
                );
              }
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatLocalDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatXAxis(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("default", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

export function AggregateDataPage() {
  const [dashboard, setDashboard] =
    useState<AggregateDashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialized to exactly 1 Month prior to today
  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d;
  });
  const [endDate, setEndDate] = useState<Date>(() => new Date());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const startFormatted = formatLocalDate(startDate);
    const endFormatted = formatLocalDate(endDate);

    getAggregateDashboard(startFormatted, endFormatted)
      .then((data: AggregateDashboardResponse) => {
        if (!cancelled) {
          setDashboard(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          console.error("Failed to load dashboard:", err);
          setError("Failed to load aggregate data.");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  const handleDateChange = (newStart: Date, newEnd: Date) => {
    setStartDate(newStart);
    setEndDate(newEnd);
  };

  if (loading && !dashboard) {
    return (
      <div className="flex-1 flex items-center justify-center p-[32px]">
        <Loader2 className="animate-spin text-[#f37422]" size={32} />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex-1 p-[32px] text-red-500 font-['Figtree']">
        {error || "No data available."}
      </div>
    );
  }

  const { metrics } = dashboard;
  const activeUserCount = metrics.active_users?.value ?? 0;

  return (
    <div className="flex-1 min-w-0 overflow-y-auto">
      <div className="p-[24px] lg:p-[32px] flex flex-col gap-[20px]">
        {/* Page Header */}
        <PageHeader
          eyebrow={`${activeUserCount.toLocaleString()} USERS · ANONYMIZED`}
          title="Aggregate Data"
        >
          <DateRangeCalendar
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
          />
          <GhostBtn label="Export Report" />
        </PageHeader>

        {/* Metric Cards */}
        <div className="flex gap-[10px] flex-wrap">
          <MetricCard
            label="AVG DAYS SOBER"
            value={metrics.avg_days_sober?.value?.toString() ?? "0"}
            delta={metrics.avg_days_sober?.delta ?? ""}
            deltaColor="#4ade80"
            accentColor="#f37422"
          />
          <MetricCard
            label="ACTIVE USERS"
            value={activeUserCount.toLocaleString()}
            delta={metrics.active_users?.delta ?? ""}
            deltaColor="#4ade80"
            accentColor="#4ade80"
          />
          <MetricCard
            label="AVG MOTIVATION"
            value={`${metrics.avg_motivation?.value ?? 0}%`}
            delta={metrics.avg_motivation?.delta ?? ""}
            deltaColor="#4ade80"
            accentColor="#6b8ab0"
          />
          <MetricCard
            label="CHECK-IN RATE"
            value={`${metrics.checkin_rate?.value ?? 0}%`}
            delta={metrics.checkin_rate?.delta ?? ""}
            deltaColor="#4ade80"
            accentColor="#6b8ab0"
          />
          <MetricCard
            label="HIGH RISK"
            value={`${metrics.high_risk?.value ?? 0}%`}
            delta={metrics.high_risk?.delta ?? ""}
            deltaColor="#4ade80"
            accentColor="#ef4444"
          />
          <MetricCard
            label="AVG ANXIETY"
            value={`${metrics.avg_anxiety?.value ?? 0}%`}
            delta={metrics.avg_anxiety?.delta ?? ""}
            deltaColor="#facc15"
            accentColor="#facc15"
          />
        </div>

        {/* Population Sobriety Trend Chart Container */}
        <div className="bg-[var(--app-surface)] rounded-[12px] relative">
          {loading && (
            <div className="absolute inset-0 bg-[var(--app-surface)]/60 z-20 flex items-center justify-center rounded-[12px]">
              <Loader2 className="animate-spin text-[#f37422]" size={24} />
            </div>
          )}
          <div className="absolute inset-0 rounded-[12px] border border-[var(--app-border)] pointer-events-none" />
          <div className="p-[24px]">
            <div className="flex items-center justify-between mb-[20px]">
              <div>
                <p className="font-['Figtree'] font-bold text-[var(--app-text)] text-[16px]">
                  Population Sobriety Trend
                </p>
                <p className="font-['JetBrains_Mono'] font-bold text-[var(--app-muted)] text-[10px] mt-[2px]">
                  {startDate.toLocaleDateString("default", {
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  –{" "}
                  {endDate.toLocaleDateString("default", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  · {activeUserCount.toLocaleString()} users
                </p>
              </div>
              <div className="flex items-center gap-[16px]">
                {[
                  { color: "#f37422", label: "Avg Days Sober" },
                  { color: "#6b8ab0", label: "Check-in Rate %" },
                  { color: "#ef4444", label: "High Risk %" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-[6px]">
                    <div
                      className="w-[8px] h-[8px] rounded-full"
                      style={{ background: l.color }}
                    />
                    <span className="font-['JetBrains_Mono'] font-bold text-[var(--app-muted)] text-[9px]">
                      {l.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dashboard?.trend ?? []}
                  margin={{ top: 4, right: 8, left: -24, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(244,237,227,0.06)"
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatXAxis}
                    tick={{
                      fill: "#8a8073",
                      fontSize: 10,
                      fontFamily: "JetBrains Mono",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fill: "#8a8073",
                      fontSize: 10,
                      fontFamily: "JetBrains Mono",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="avgDays"
                    stroke="#f37422"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#f37422" }}
                    name="Avg Days Sober"
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="checkIn"
                    stroke="#6b8ab0"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#6b8ab0" }}
                    name="Check-in Rate %"
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="highRisk"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#ef4444" }}
                    name="High Risk %"
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sub Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[10px]">
          {/* Motivation Chart */}
          <div className="bg-[var(--app-surface)] rounded-[12px] relative">
            <div className="absolute inset-0 rounded-[12px] border border-[var(--app-border)] pointer-events-none" />
            <div className="p-[20px]">
              <p className="font-['Figtree'] font-bold text-[var(--app-text)] text-[14px]">
                Avg Motivation Score
              </p>
              <p className="font-['JetBrains_Mono'] font-bold text-[var(--app-muted)] text-[10px] mt-[2px] mb-[16px]">
                {metrics.avg_motivation?.value ?? 0}% avg ·{" "}
                {metrics.avg_motivation?.delta ?? ""}
              </p>
              <div className="w-full h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dashboard?.motivation ?? []}
                    margin={{ top: 4, right: 4, left: -28, bottom: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(244,237,227,0.06)"
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatXAxis}
                      tick={{
                        fill: "#8a8073",
                        fontSize: 9,
                        fontFamily: "JetBrains Mono",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fill: "#8a8073",
                        fontSize: 9,
                        fontFamily: "JetBrains Mono",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="val"
                      stroke="#6b8ab0"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Anxiety Chart */}
          <div className="bg-[var(--app-surface)] rounded-[12px] relative">
            <div className="absolute inset-0 rounded-[12px] border border-[var(--app-border)] pointer-events-none" />
            <div className="p-[20px]">
              <p className="font-['Figtree'] font-bold text-[var(--app-text)] text-[14px]">
                Avg Anxiety Score
              </p>
              <p className="font-['JetBrains_Mono'] font-bold text-[var(--app-muted)] text-[10px] mt-[2px] mb-[16px]">
                {metrics.avg_anxiety?.value ?? 0}% avg ·{" "}
                {metrics.avg_anxiety?.delta ?? ""}
              </p>
              <div className="w-full h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dashboard?.anxiety ?? []}
                    margin={{ top: 4, right: 4, left: -28, bottom: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(244,237,227,0.06)"
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatXAxis}
                      tick={{
                        fill: "#8a8073",
                        fontSize: 9,
                        fontFamily: "JetBrains Mono",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fill: "#8a8073",
                        fontSize: 9,
                        fontFamily: "JetBrains Mono",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="val"
                      stroke="#facc15"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}