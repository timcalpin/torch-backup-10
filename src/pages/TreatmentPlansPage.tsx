import { useAppContext } from "@/app/app-context";
import { PageHeader } from "@/components/common/PageHeader";
import { GhostBtn, PrimaryBtn } from "@/components/common/Buttons";
import { MetricCard } from "@/components/common/MetricCard";
import { TableCard, TableHead } from "@/components/common/Table";
import { StatusPill } from "@/components/common/StatusPill";
import { ActionBtn } from "@/components/common/ActionBtn";
import { ClipboardIcon, EyeIcon, EditIcon } from "@/components/icons";

const PLANS = [
  { id: 1, title: "90-Day Recovery Pathway", patient: "Marcus A.", counselor: "Dr. Chen", start: "Apr 1", duration: "90 days", progress: 68, status: "ACTIVE" as const },
  { id: 2, title: "Extended Care Program", patient: "Jordan T.", counselor: "Sarah K.", start: "Mar 15", duration: "6 months", progress: 42, status: "ACTIVE" as const },
  { id: 3, title: "Early Intervention Plan", patient: "Riley S.", counselor: "Maria L.", start: "Jun 10", duration: "30 days", progress: 15, status: "ACTIVE" as const },
  { id: 4, title: "Maintenance Phase Plan", patient: "Casey P.", counselor: "Dr. Chen", start: "Jan 1", duration: "1 year", progress: 89, status: "ACTIVE" as const },
  { id: 5, title: "Crisis Stabilization Plan", patient: "Morgan D.", counselor: "Unassigned", start: "Jun 15", duration: "30 days", progress: 5, status: "PENDING" as const },
];

export function TreatmentPlansPage() {
  const { setModal } = useAppContext();
  return (
    <div className="flex-1 min-w-0 overflow-y-auto">
      <div className="p-[24px] lg:p-[32px] flex flex-col gap-[20px]">
        <PageHeader eyebrow="48 ACTIVE PLANS · 5 PENDING REVIEW" title="Treatment Plans">
          <GhostBtn label="+ Add Counselor" onClick={() => setModal("add-counselor")} />
          <PrimaryBtn label="+ New Plan" onClick={() => setModal("new-plan")} />
        </PageHeader>

        <div className="flex gap-[10px] flex-wrap">
          <MetricCard label="ACTIVE PLANS" value="48" delta="↑ +5 this month" deltaColor="#4ade80" accentColor="#f37422" />
          <MetricCard label="AVG COMPLETION" value="61%" delta="↑ +3% vs last month" deltaColor="#4ade80" accentColor="#4ade80" />
          <MetricCard label="COMPLETED" value="124" delta="↑ +8 this month" deltaColor="#4ade80" accentColor="#6b8ab0" />
          <MetricCard label="PENDING REVIEW" value="5" delta="↓ 2 resolved today" deltaColor="#4ade80" accentColor="#facc15" />
        </div>

        <TableCard>
          <div className="overflow-x-auto">
            <div className="min-w-[840px]">
              <TableHead cols={[
                { label: "PLAN", w: "flex-1 min-w-[200px]" },
                { label: "PATIENT", w: "w-[130px]" },
                { label: "COUNSELOR", w: "w-[130px]" },
                { label: "STARTED", w: "w-[90px]" },
                { label: "DURATION", w: "w-[90px]" },
                { label: "PROGRESS", w: "w-[160px]" },
                { label: "STATUS", w: "w-[100px]" },
                { label: "ACTIONS", w: "w-[60px] text-right" },
              ]} />
              {PLANS.map((plan) => (
                <div key={plan.id} className="flex items-center px-[18px] h-[60px] border-b border-[var(--app-border-soft)] last:border-b-0 hover:bg-[var(--app-hover)] transition-colors">
                  <div className="flex items-center gap-[10px] flex-1 min-w-[200px]">
                    <div className="w-[32px] h-[32px] rounded-full bg-[rgba(107,138,176,0.2)] flex items-center justify-center flex-shrink-0">
                      <ClipboardIcon color="#6b8ab0" />
                    </div>
                    <p className="font-['Figtree'] font-semibold text-[var(--app-text)] text-[13px]">{plan.title}</p>
                  </div>
                  <div className="w-[130px] font-['Figtree'] font-normal text-[var(--app-text)] text-[12px]">{plan.patient}</div>
                  <div className="w-[130px] font-['Figtree'] font-normal text-[var(--app-text)] text-[12px]">{plan.counselor}</div>
                  <div className="w-[90px] font-['JetBrains_Mono'] font-normal text-[var(--app-muted)] text-[11px]">{plan.start}</div>
                  <div className="w-[90px] font-['JetBrains_Mono'] font-normal text-[var(--app-muted)] text-[11px]">{plan.duration}</div>
                  <div className="w-[160px]">
                    <div className="flex items-center gap-[8px]">
                      <div className="flex-1 h-[4px] bg-[var(--app-border)] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${plan.progress}%`, background: plan.progress > 75 ? "#4ade80" : plan.progress > 40 ? "#f37422" : "#facc15" }} />
                      </div>
                      <span className="font-['JetBrains_Mono'] font-bold text-[var(--app-text)] text-[10px] w-[30px]">{plan.progress}%</span>
                    </div>
                  </div>
                  <div className="w-[100px]"><StatusPill status={plan.status} /></div>
                  <div className="w-[60px] flex items-center justify-end gap-[10px]">
                    <ActionBtn onClick={() => {}} title="View" icon={<EyeIcon />} />
                    <ActionBtn onClick={() => {}} title="Edit" icon={<EditIcon />} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TableCard>
      </div>
    </div>
  );
}
