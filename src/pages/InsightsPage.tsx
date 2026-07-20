import { useAppContext } from "@/app/app-context";
import { PageHeader } from "@/components/common/PageHeader";
import { GhostBtn } from "@/components/common/Buttons";

const INSIGHTS = [
  {
    num: "01",
    category: "Wellbeing",
    color: "#f37422",
    bg: "rgba(243,116,34,0.12)",
    text: "Users who experience a 2+ increase in work or school satisfaction see a 30%–40% decrease in Depression and a 20%–30% increase in Purpose.",
    cohort: "847 users",
    confidence: "High",
  },
  {
    num: "02",
    category: "MAT Outcomes",
    color: "#4ade80",
    bg: "rgba(74,222,128,0.12)",
    text: "Opioid users who spend 6+ months on Sublocade/Suboxone relapse 35% less than users not using MAT.",
    cohort: "312 users",
    confidence: "High",
  },
  {
    num: "03",
    category: "Community",
    color: "#6b8ab0",
    bg: "rgba(107,138,176,0.12)",
    text: "Members attending 3+ support group sessions per week are 2.4x more likely to reach 90 days sober.",
    cohort: "1,204 users",
    confidence: "Very High",
  },
  {
    num: "04",
    category: "Engagement",
    color: "#facc15",
    bg: "rgba(250,204,21,0.12)",
    text: "A daily check-in streak of 30+ days correlates with 45% reduction in relapse signals over following quarter.",
    cohort: "634 users",
    confidence: "High",
  },
  {
    num: "05",
    category: "Correlation",
    color: "#a3738f",
    bg: "rgba(163,115,143,0.12)",
    text: "Users matched with counselor within 48 hours show 68% higher six-month retention than those matched after one week.",
    cohort: "2,847 users",
    confidence: "Very High",
  },
];

export function InsightsPage() {
  const { setModal } = useAppContext();
  return (
    <div className="flex-1 min-w-0 overflow-y-auto">
      <div className="p-[24px] lg:p-[32px] flex flex-col gap-[20px]">
        <PageHeader eyebrow="GENERATED THIS WEEK 5 · SOURCES 14 COHORTS" title="Insights">
          <GhostBtn label="Export" onClick={() => setModal("export-insights")} />
        </PageHeader>

        <p className="font-['Figtree'] font-normal text-[var(--app-muted)] text-[14px] -mt-[8px]">
          Patterns surfaced from aggregate, de-identified member data. Correlational — not causal.
        </p>

        <div className="flex flex-col gap-[4px]">
          {INSIGHTS.map((ins, i) => (
            <div key={ins.num} className="flex gap-[20px]">
              {/* Left rail */}
              <div className="flex flex-col items-center flex-shrink-0 w-[32px]">
                <div className="w-[32px] h-[32px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: ins.bg }}>
                  <span className="font-['JetBrains_Mono'] font-extrabold text-[10px]" style={{ color: ins.color }}>{ins.num}</span>
                </div>
                {i < INSIGHTS.length - 1 && (
                  <div className="w-[2px] flex-1 min-h-[20px]" style={{ background: `linear-gradient(to bottom, ${ins.color}40, transparent)` }} />
                )}
              </div>
              {/* Card */}
              <div className="flex-1 min-w-0 bg-[var(--app-surface)] rounded-[12px] relative mb-[8px]">
                <div className="absolute inset-0 rounded-[12px] border border-[var(--app-border)] pointer-events-none" />
                <div className="p-[20px] flex flex-col gap-[12px]">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-full font-['JetBrains_Mono'] font-bold text-[10px]" style={{ background: ins.bg, color: ins.color }}>
                      <span className="w-[5px] h-[5px] rounded-full" style={{ background: ins.color }} />
                      {ins.category.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-[16px]">
                      <span className="font-['JetBrains_Mono'] font-bold text-[var(--app-muted)] text-[10px]">COHORT: {ins.cohort}</span>
                      <span className="inline-flex items-center gap-[6px] px-[8px] py-[3px] rounded-full font-['JetBrains_Mono'] font-bold text-[10px] bg-[rgba(74,222,128,0.12)] text-[#4ade80]">
                        {ins.confidence} Confidence
                      </span>
                    </div>
                  </div>
                  <p className="font-['Figtree'] font-normal text-[var(--app-text)] text-[15px] leading-relaxed">{ins.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
