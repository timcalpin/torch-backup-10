import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, SearchCode } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { GhostBtn } from "@/components/common/Buttons";
import { ApiError } from "@/lib/api";
import { formatDateTime, formatRelativeTime } from "@/lib/relativeTime";
import {
  getHealthKitDebugUserDetail,
  type MetricCategory,
  type MetricEntry,
  type MetricStatus,
  type UserDetail,
} from "@/lib/healthkitDebug";

const STATUS_CONFIG: Record<MetricStatus, { bg: string; color: string; label: string }> = {
  fresh: { bg: "rgba(74,222,128,0.14)", color: "#4ade80", label: "FRESH" },
  stale: { bg: "rgba(250,204,21,0.14)", color: "#facc15", label: "STALE" },
  missing: { bg: "rgba(239,68,68,0.14)", color: "#ef4444", label: "MISSING" },
  not_implemented: { bg: "rgba(138,128,115,0.14)", color: "#8a8073", label: "NOT IMPLEMENTED" },
};

const SOURCE_COLORS: Record<string, string> = {
  HealthKit: "#6b8ab0",
  Intake: "#f37422",
  "App Tracking": "#a78bfa",
  Calculation: "#4ade80",
};

const SOURCE_FILTERS = ["All Sources", "HealthKit", "Intake", "App Tracking", "Calculation"];

function StatusPill({ status, reason }: { status: MetricStatus; reason: string | null }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      title={reason ?? undefined}
      className="inline-flex w-fit items-center gap-[5px] rounded-full px-[8px] py-[3px] font-['JetBrains_Mono'] text-[8px] font-bold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span className="h-[5px] w-[5px] rounded-full" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  );
}

function SourceBadge({ source }: { source: string }) {
  const color = SOURCE_COLORS[source] ?? "#8a8073";
  return (
    <span
      className="inline-flex w-fit items-center rounded-[4px] border px-[6px] py-[2px] font-['JetBrains_Mono'] text-[8px] uppercase tracking-wide"
      style={{ color, borderColor: `${color}55`, background: `${color}14` }}
    >
      {source}
    </span>
  );
}

function formatValue(metric: MetricEntry): string {
  if (metric.value === null || metric.value === undefined) return "—";
  if (typeof metric.value === "number") {
    const rounded = Number.isInteger(metric.value) ? metric.value : Math.round(metric.value * 10) / 10;
    return metric.unit ? `${rounded.toLocaleString()} ${metric.unit}` : rounded.toLocaleString();
  }
  return metric.unit ? `${metric.value} ${metric.unit}` : String(metric.value);
}

function MetricSection({
  title,
  metrics,
  sourceFilter,
}: {
  title: string;
  metrics: MetricEntry[];
  sourceFilter: string;
}) {
  const visible = sourceFilter === "All Sources" ? metrics : metrics.filter((m) => m.source === sourceFilter);

  return (
    <section className="overflow-hidden rounded-[12px] border border-[var(--app-border)] bg-[var(--app-surface)]">
      <div className="flex items-center justify-between border-b border-[var(--app-border)] px-[16px] py-[10px]">
        <p className="font-['Figtree'] text-[13px] font-bold uppercase tracking-wide text-[var(--app-text)]">{title}</p>
        <span className="font-['JetBrains_Mono'] text-[9px] text-[var(--app-muted)]">{metrics.length} METRICS</span>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[minmax(160px,1.4fr)_110px_130px_120px_130px] gap-[8px] border-b border-[var(--app-border-soft)] px-[16px] py-[8px]">
            {["METRIC NAME", "VALUE", "DATA SOURCE", "LAST UPDATED", "STATUS"].map((heading) => (
              <span key={heading} className="font-['JetBrains_Mono'] text-[8px] font-bold uppercase tracking-wide text-[var(--app-muted)]">
                {heading}
              </span>
            ))}
          </div>
          {visible.length === 0 && (
            <div className="px-[16px] py-[16px] font-['Figtree'] text-[12px] text-[var(--app-muted)]">No metrics for this source.</div>
          )}
          {visible.map((metric) => (
            <div
              key={metric.key}
              className="grid grid-cols-[minmax(160px,1.4fr)_110px_130px_120px_130px] items-center gap-[8px] border-b border-[var(--app-border-soft)] px-[16px] py-[9px]"
            >
              <span className="truncate font-['Figtree'] text-[12px] text-[var(--app-text)]">{metric.label}</span>
              <span
                className={`font-['JetBrains_Mono'] text-[11px] ${
                  metric.status === "fresh" ? "text-[var(--app-text)] font-semibold" : "text-[var(--app-muted)]"
                }`}
              >
                {formatValue(metric)}
              </span>
              <SourceBadge source={metric.source} />
              <span className="font-['Figtree'] text-[10px] text-[var(--app-muted)]">{formatRelativeTime(metric.last_updated)}</span>
              <StatusPill status={metric.status} reason={metric.reason} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MetricsDebugDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState("All Sources");

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getHealthKitDebugUserDetail(userId)
      .then((response) => {
        if (!cancelled) setDetail(response);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Unable to load metrics for this user.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const categories = useMemo<{ key: MetricCategory; title: string }[]>(
    () => [
      { key: "body", title: "Body" },
      { key: "mind", title: "Mind" },
      { key: "spirit", title: "Spirit (Recovery)" },
    ],
    []
  );

  if (loading) {
    return <div className="flex-1 p-[32px] font-['Figtree'] text-[13px] text-[var(--app-muted)]">Loading metrics debug console...</div>;
  }
  if (error || !detail) {
    return <div className="flex-1 p-[32px] font-['Figtree'] text-[13px] text-red-500">{error ?? "User not found."}</div>;
  }

  return (
    <div className="flex-1 min-w-0 overflow-y-auto bg-[var(--app-bg)]">
      <div className="p-[24px] lg:p-[32px] flex flex-col gap-[18px]">
        <button
          onClick={() => navigate("/metrics-debug")}
          className="flex w-fit items-center gap-[5px] font-['Figtree'] text-[11px] text-[var(--app-muted)] hover:text-[#f37422]"
        >
          <ArrowLeft size={12} /> Back to Metrics Debug
        </button>

        <PageHeader eyebrow="METRICS DEBUG · USER DETAIL" title={`Metrics Debug — ${detail.user.full_name || detail.user.email}`}>
          <GhostBtn
            label="Payload Inspector"
            icon={<SearchCode size={14} strokeWidth={1.7} />}
            onClick={() => navigate(`/metrics-debug/${userId}/payload-inspector`)}
          />
        </PageHeader>

        {/* Source legend cards */}
        <div className="grid grid-cols-2 gap-[10px] sm:grid-cols-3 xl:grid-cols-5">
          {detail.source_cards.map((card) => {
            const cfg = STATUS_CONFIG[card.status];
            return (
              <div key={card.key} className="rounded-[10px] border border-[var(--app-border)] bg-[var(--app-surface)] p-[12px]">
                <div className="flex items-center gap-[6px]">
                  <span className="h-[6px] w-[6px] rounded-full" style={{ background: cfg.color }} />
                  <p className="font-['JetBrains_Mono'] text-[8px] font-bold uppercase tracking-wide text-[var(--app-muted)]">{card.label}</p>
                </div>
                <p className="mt-[6px] font-['Figtree'] text-[13px] font-semibold text-[var(--app-text)]">{card.detail}</p>
                {card.completed_label && (
                  <p className="mt-[2px] font-['Figtree'] text-[10px] text-[var(--app-muted)]">{card.completed_label}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Source filter tabs */}
        <div className="flex flex-wrap gap-[6px]">
          {SOURCE_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setSourceFilter(filter)}
              className={`rounded-[7px] px-[11px] py-[6px] font-['Figtree'] text-[11px] transition-colors ${
                sourceFilter === filter
                  ? "bg-[#f37422] font-bold text-[#15110e]"
                  : "border border-[var(--app-border-strong)] text-[var(--app-muted)] hover:text-[var(--app-text)]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {categories.map((category) => (
          <MetricSection key={category.key} title={category.title} metrics={detail.metrics[category.key]} sourceFilter={sourceFilter} />
        ))}

        {/* Footer legend */}
        <div className="flex flex-col gap-[8px] rounded-[10px] border border-[var(--app-border)] bg-[var(--app-surface)] px-[16px] py-[12px] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-[14px] font-['JetBrains_Mono'] text-[10px]">
            <span className="flex items-center gap-[5px] text-[#4ade80]">
              <span className="h-[6px] w-[6px] rounded-full bg-current" /> {detail.summary.fresh} Fresh
            </span>
            <span className="flex items-center gap-[5px] text-[#facc15]">
              <span className="h-[6px] w-[6px] rounded-full bg-current" /> {detail.summary.stale} Stale
            </span>
            <span className="flex items-center gap-[5px] text-[#ef4444]">
              <span className="h-[6px] w-[6px] rounded-full bg-current" /> {detail.summary.missing} Missing
            </span>
            <span className="flex items-center gap-[5px] text-[#8a8073]">
              <span className="h-[6px] w-[6px] rounded-full bg-current" /> {detail.summary.not_implemented} Not Implemented
            </span>
          </div>
          <span className="font-['JetBrains_Mono'] text-[9px] text-[var(--app-muted)]">
            Last full sync: {formatRelativeTime(detail.last_full_sync)}
            {detail.last_full_sync ? ` (${formatDateTime(detail.last_full_sync)})` : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
