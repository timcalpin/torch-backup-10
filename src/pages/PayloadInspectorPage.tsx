import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { MetricCard } from "@/components/common/MetricCard";
import { ApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/relativeTime";
import { getHealthKitDebugPayloadInspector, type PayloadInspectorData } from "@/lib/healthkitDebug";

function formatPayloadValue(value: unknown): string {
  if (typeof value === "boolean") return value ? "true" : "false";
  if (value === null || value === undefined) return "null";
  return String(value);
}

function PayloadJson({ payload }: { payload: Record<string, unknown> }) {
  return (
    <pre className="overflow-x-auto whitespace-pre font-['JetBrains_Mono'] text-[10px] leading-[1.6] text-[var(--app-text)]">
      {"{\n"}
      {Object.entries(payload).map(([key, value], index, arr) => (
        <span key={key}>
          {"  "}
          <span className="text-[#f37422]">"{key}"</span>: {formatPayloadValue(value)}
          {index < arr.length - 1 ? "," : ""}
          {"\n"}
        </span>
      ))}
      {"}"}
    </pre>
  );
}

export function PayloadInspectorPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<PayloadInspectorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getHealthKitDebugPayloadInspector(userId)
      .then((response) => {
        if (!cancelled) setData(response);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Unable to load payload history for this user.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return <div className="flex-1 p-[32px] font-['Figtree'] text-[13px] text-[var(--app-muted)]">Loading payload inspector...</div>;
  }
  if (error || !data) {
    return <div className="flex-1 p-[32px] font-['Figtree'] text-[13px] text-red-500">{error ?? "No payload history found."}</div>;
  }

  const comparison = data.comparison;

  return (
    <div className="flex-1 min-w-0 overflow-y-auto bg-[var(--app-bg)]">
      <div className="p-[24px] lg:p-[32px] flex flex-col gap-[18px]">
        <button
          onClick={() => navigate(`/metrics-debug/${userId}`)}
          className="flex w-fit items-center gap-[5px] font-['Figtree'] text-[11px] text-[var(--app-muted)] hover:text-[#f37422]"
        >
          <ArrowLeft size={12} /> Back to Metrics Debug
        </button>

        <PageHeader eyebrow="SYSTEM TEST · PAYLOAD INSPECTOR" title="Payload Inspector" />
        <p className="font-['Figtree'] text-[12px] text-[var(--app-muted)] -mt-[10px]">
          Compares raw HealthDashboardData sync rows to flag the "all fields defaulted to 0" pattern caused by
          SaveHealthDataView's missing request validation.
        </p>

        <div className="flex flex-wrap gap-[10px]">
          <MetricCard label="TOTAL PAYLOADS" value={data.total_payloads.toLocaleString()} delta="Historical sync rows" deltaColor="#8a8073" accentColor="#6b8ab0" />
          <MetricCard label="FLAGGED" value={String(data.flagged_count)} delta="Empty payload pattern" deltaColor="#ef4444" accentColor="#ef4444" />
          <MetricCard label="CLEAN RATE" value={`${data.clean_rate}%`} delta="Not flagged" deltaColor="#4ade80" accentColor="#4ade80" />
        </div>

        <section className="overflow-hidden rounded-[12px] border border-[var(--app-border)] bg-[var(--app-surface)]">
          <div className="border-b border-[var(--app-border)] px-[16px] py-[10px]">
            <p className="font-['Figtree'] text-[13px] font-bold text-[var(--app-text)]">Flagged Payloads</p>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <div className="grid grid-cols-[90px_150px_minmax(200px,1fr)_150px] gap-[8px] border-b border-[var(--app-border-soft)] px-[16px] py-[8px]">
                {["PAYLOAD ID", "SYNC TIMESTAMP", "DIAGNOSED ISSUE", "VERDICT"].map((heading) => (
                  <span key={heading} className="font-['JetBrains_Mono'] text-[8px] font-bold uppercase tracking-wide text-[var(--app-muted)]">
                    {heading}
                  </span>
                ))}
              </div>
              {data.flagged_payloads.length === 0 && (
                <div className="flex items-center gap-[8px] px-[16px] py-[16px] font-['Figtree'] text-[12px] text-[#4ade80]">
                  <CheckCircle2 size={14} /> No flagged payloads for this user.
                </div>
              )}
              {data.flagged_payloads.map((payload) => (
                <div key={payload.row_id} className="grid grid-cols-[90px_150px_minmax(200px,1fr)_150px] items-center gap-[8px] border-b border-[var(--app-border-soft)] px-[16px] py-[9px]">
                  <span className="font-['JetBrains_Mono'] text-[11px] text-[var(--app-text)]">{payload.id}</span>
                  <span className="font-['Figtree'] text-[10px] text-[var(--app-muted)]">{formatDateTime(payload.sync_timestamp)}</span>
                  <span className="truncate font-['Figtree'] text-[11px] text-[var(--app-text)]">{payload.diagnosed_issue}</span>
                  <span className="w-fit rounded-full border border-[#ef4444] bg-[rgba(239,68,68,0.12)] px-[8px] py-[3px] font-['JetBrains_Mono'] text-[8px] font-bold text-[#ff5c55]">
                    {payload.verdict}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {comparison && (
          <>
            <section className="grid grid-cols-1 gap-[12px] lg:grid-cols-2">
              <div className="rounded-[12px] border border-[#ef4444] bg-[rgba(239,68,68,0.05)] p-[14px]">
                <div className="flex items-center justify-between">
                  <p className="font-['Figtree'] text-[12px] font-bold text-[var(--app-text)]">
                    Suspected Bad Payload <span className="text-[var(--app-muted)]">· {comparison.bad_payload.id}</span>
                  </p>
                  <span className="rounded-full border border-[#ef4444] bg-[rgba(239,68,68,0.15)] px-[8px] py-[3px] font-['JetBrains_Mono'] text-[8px] font-bold text-[#ff5c55]">
                    {comparison.bad_payload.label}
                  </span>
                </div>
                <p className="mt-[2px] font-['JetBrains_Mono'] text-[9px] text-[var(--app-muted)]">{formatDateTime(comparison.bad_payload.sync_timestamp)}</p>
                <div className="mt-[10px] rounded-[8px] bg-[var(--app-bg)] p-[10px]">
                  <PayloadJson payload={comparison.bad_payload.payload} />
                </div>
                <div className="mt-[10px] flex items-start gap-[7px] rounded-[8px] bg-[rgba(239,68,68,0.1)] p-[10px]">
                  <AlertTriangle size={13} className="mt-[1px] shrink-0 text-[#ff5c55]" />
                  <p className="font-['Figtree'] text-[10px] leading-relaxed text-[#ff9d97]">
                    All numeric fields default to 0 — missing keys in the app's payload, or a sync sent while HealthKit
                    permission wasn't granted.
                  </p>
                </div>
              </div>

              {comparison.healthy_payload && (
                <div className="rounded-[12px] border border-[#4ade80] bg-[rgba(74,222,128,0.05)] p-[14px]">
                  <div className="flex items-center justify-between">
                    <p className="font-['Figtree'] text-[12px] font-bold text-[var(--app-text)]">
                      Healthy Payload <span className="text-[var(--app-muted)]">· {comparison.healthy_payload.id}</span>
                    </p>
                    <span className="rounded-full border border-[#4ade80] bg-[rgba(74,222,128,0.15)] px-[8px] py-[3px] font-['JetBrains_Mono'] text-[8px] font-bold text-[#4ade80]">
                      {comparison.healthy_payload.label}
                    </span>
                  </div>
                  <p className="mt-[2px] font-['JetBrains_Mono'] text-[9px] text-[var(--app-muted)]">{formatDateTime(comparison.healthy_payload.sync_timestamp)}</p>
                  <div className="mt-[10px] rounded-[8px] bg-[var(--app-bg)] p-[10px]">
                    <PayloadJson payload={comparison.healthy_payload.payload} />
                  </div>
                </div>
              )}
            </section>

            <section className="overflow-hidden rounded-[12px] border border-[var(--app-border)] bg-[var(--app-surface)]">
              <div className="border-b border-[var(--app-border)] px-[16px] py-[10px]">
                <p className="font-['Figtree'] text-[13px] font-bold text-[var(--app-text)]">Field Comparison</p>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[640px]">
                  <div className="grid grid-cols-[minmax(140px,1.2fr)_100px_100px_130px_minmax(160px,1fr)] gap-[8px] border-b border-[var(--app-border-soft)] px-[16px] py-[8px]">
                    {["FIELD NAME", "BAD VALUE", "HEALTHY VALUE", "DIFF", "ROOT CAUSE"].map((heading) => (
                      <span key={heading} className="font-['JetBrains_Mono'] text-[8px] font-bold uppercase tracking-wide text-[var(--app-muted)]">
                        {heading}
                      </span>
                    ))}
                  </div>
                  {comparison.field_comparison.map((row) => (
                    <div key={row.field} className="grid grid-cols-[minmax(140px,1.2fr)_100px_100px_130px_minmax(160px,1fr)] items-center gap-[8px] border-b border-[var(--app-border-soft)] px-[16px] py-[8px]">
                      <span className="truncate font-['JetBrains_Mono'] text-[10px] text-[var(--app-text)]">{row.field}</span>
                      <span className="font-['JetBrains_Mono'] text-[10px] text-[#ff5c55]">{formatPayloadValue(row.bad_value)}</span>
                      <span className="font-['JetBrains_Mono'] text-[10px] text-[#4ade80]">{formatPayloadValue(row.healthy_value)}</span>
                      <span
                        className={`w-fit rounded-[4px] px-[6px] py-[2px] font-['JetBrains_Mono'] text-[8px] font-bold ${
                          row.diff === "Match" || row.diff === "No diff"
                            ? "bg-[rgba(138,128,115,0.12)] text-[var(--app-muted)]"
                            : "bg-[rgba(243,116,34,0.14)] text-[#f37422]"
                        }`}
                      >
                        {row.diff}
                      </span>
                      <span className="truncate font-['Figtree'] text-[10px] text-[var(--app-muted)]">{row.root_cause}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-[12px] border border-[#f37422] bg-[rgba(243,116,34,0.06)] p-[16px]">
              <p className="font-['Figtree'] text-[13px] font-bold text-[#f37422]">Root Cause Analysis — Row {comparison.bad_payload.id}</p>
              <ul className="mt-[10px] flex flex-col gap-[8px]">
                {comparison.root_cause_analysis.map((line, index) => (
                  <li key={index} className="flex items-start gap-[8px] font-['Figtree'] text-[11px] leading-relaxed text-[var(--app-text)]">
                    <span className="mt-[6px] h-[4px] w-[4px] shrink-0 rounded-full bg-[#f37422]" />
                    {line}
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
