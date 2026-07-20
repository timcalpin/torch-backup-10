import { useState } from "react";
import { ModalOverlay, ModalCard, ModalHeader, ModalFooter, SectionLabel } from "@/components/common/Modal";
import { FormField, TextInput } from "@/components/common/FormFields";

export function ExportInsightsModal({ onClose }: { onClose: () => void }) {
  const [format, setFormat] = useState<"pdf" | "csv">("pdf");
  const [includes, setIncludes] = useState({
    summaries: true,
    cohort: true,
    metrics: true,
    methodology: false,
  });
  return (
    <ModalOverlay onClose={onClose}>
      <ModalCard>
        <ModalHeader title="Export Insights" onClose={onClose} />
        <p className="font-['Figtree'] font-normal text-[var(--app-muted)] text-[14px] mb-[24px] -mt-[16px]">
          Download current insights as a formatted report.
        </p>
        <div className="flex flex-col gap-[20px]">
          <div className="flex flex-col gap-[12px]">
            <SectionLabel label="Report Format" />
            {(["pdf", "csv"] as const).map((f) => (
              <button key={f} onClick={() => setFormat(f)} className="flex items-center gap-[12px] p-[14px] rounded-[10px] bg-[var(--app-surface)] border border-[var(--app-border)] cursor-pointer hover:border-[rgba(244,237,227,0.16)] transition-colors text-left">
                <div className="w-[16px] h-[16px] rounded-full flex items-center justify-center" style={{ border: `2px solid ${format === f ? "#f37422" : "rgba(244,237,227,0.2)"}`, background: format === f ? "#f37422" : "transparent" }}>
                  {format === f && <div className="w-[6px] h-[6px] rounded-full bg-white" />}
                </div>
                <span className={`font-['Figtree'] text-[14px] ${format === f ? "text-[var(--app-text)] font-semibold" : "text-[var(--app-muted)]"}`}>
                  {f === "pdf" ? "PDF Report" : "CSV Export"}
                </span>
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-[12px]">
            <SectionLabel label="Include in Report" />
            <div className="grid grid-cols-2 gap-[8px]">
              {(Object.entries(includes) as [keyof typeof includes, boolean][]).map(([k, v]) => {
                const labels = { summaries: "Insight Summaries", cohort: "Cohort Details", metrics: "Supporting Metrics", methodology: "Methodology Notes" };
                return (
                  <button
                    key={k}
                    onClick={() => setIncludes((prev) => ({ ...prev, [k]: !prev[k] }))}
                    className="flex items-center gap-[10px] p-[12px] rounded-[10px] bg-[var(--app-surface)] border border-[var(--app-border)] cursor-pointer text-left"
                  >
                    <div className={`w-[16px] h-[16px] rounded-[4px] flex items-center justify-center flex-shrink-0 ${v ? "bg-[#f37422]" : "bg-transparent border border-[rgba(244,237,227,0.2)]"}`}>
                      {v && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>}
                    </div>
                    <span className={`font-['Figtree'] text-[13px] ${v ? "text-[var(--app-text)]" : "text-[var(--app-muted)]"}`}>{labels[k]}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[160px]"><FormField label="Date From"><TextInput placeholder="Jan 1, 2026" /></FormField></div>
            <div className="flex-1 min-w-[160px]"><FormField label="Date To"><TextInput placeholder="Mar 15, 2026" /></FormField></div>
          </div>
          <FormField label="Report Name"><TextInput placeholder="e.g. Q1 2026 Insights Report" /></FormField>
        </div>
        <ModalFooter onCancel={onClose} onConfirm={onClose} confirmLabel="Export Report" />
      </ModalCard>
    </ModalOverlay>
  );
}
