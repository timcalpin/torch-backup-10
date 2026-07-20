import { useState } from "react";
import { useAppContext } from "@/app/app-context";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchBox } from "@/components/common/SearchBox";
import { PrimaryBtn } from "@/components/common/Buttons";
import { MetricCard } from "@/components/common/MetricCard";
import { TableCard, TableHead, TableRow } from "@/components/common/Table";
import { StatusPill } from "@/components/common/StatusPill";
import { ActionBtn } from "@/components/common/ActionBtn";
import { EyeIcon, EditIcon } from "@/components/icons";

const COUNSELORS = [
  { id: 1, name: "Dr. Marcus Chen", email: "m.chen@torchrecovery.com", specialization: "Addiction, Trauma", license: "LCSW-9810442", patients: 12, status: "ACTIVE" as const },
  { id: 2, name: "Sarah Kerr", email: "s.kerr@torchrecovery.com", specialization: "CBT / DBT", license: "LMFT-2241008", patients: 8, status: "ACTIVE" as const },
  { id: 3, name: "Maria Lopez", email: "m.lopez@torchrecovery.com", specialization: "Family Therapy", license: "LPC-3819204", patients: 10, status: "ACTIVE" as const },
  { id: 4, name: "James Thompson", email: "j.thompson@torchrecovery.com", specialization: "Grief Counseling", license: "LCPC-7712083", patients: 6, status: "ACTIVE" as const },
  { id: 5, name: "Anna Rivera", email: "a.rivera@torchrecovery.com", specialization: "Addiction, Trauma", license: "LCSW-4491027", patients: 0, status: "PENDING" as const },
];

export function CounselorsPage() {
  const { setModal } = useAppContext();
  const [search, setSearch] = useState("");
  const filtered = COUNSELORS.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 min-w-0 overflow-y-auto">
      <div className="p-[24px] lg:p-[32px] flex flex-col gap-[20px]">
        <PageHeader eyebrow="COUNSELOR DIRECTORY · 18 TOTAL" title="Counselor Management">
          <SearchBox placeholder="Search counselors..." value={search} onChange={setSearch} />
          <PrimaryBtn label="+ Add Counselor" onClick={() => setModal("add-counselor")} />
        </PageHeader>

        <div className="flex gap-[10px] flex-wrap">
          <MetricCard label="ACTIVE THERAPISTS" value="15" delta="↑ +2 this month" deltaColor="#4ade80" accentColor="#f37422" />
          <MetricCard label="PENDING LICENSES" value="3" delta="↓ 1 resolved today" deltaColor="#4ade80" accentColor="#facc15" />
          <MetricCard label="AVG CHECK-IN RESPONSE" value="12m" delta="↑ -3m vs last week" deltaColor="#4ade80" accentColor="#4ade80" />
        </div>

        <TableCard>
          <div className="overflow-x-auto">
            <div className="min-w-[680px]">
              <TableHead cols={[
                { label: "COUNSELOR", w: "flex-1 min-w-[200px]" },
                { label: "SPECIALIZATION", w: "w-[180px]" },
                { label: "LICENSE", w: "w-[150px]" },
                { label: "PATIENTS", w: "w-[90px]" },
                { label: "STATUS", w: "w-[110px]" },
                { label: "ACTIONS", w: "w-[70px] text-right" },
              ]} />
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <div className="flex items-center gap-[10px] flex-1 min-w-[200px]">
                    <div className="w-[32px] h-[32px] rounded-full bg-[rgba(243,116,34,0.2)] flex items-center justify-center flex-shrink-0">
                      <span className="font-['Figtree'] font-bold text-[#f37422] text-[11px]">
                        {c.name.replace("Dr. ", "").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-['Figtree'] font-semibold text-[var(--app-text)] text-[13px] leading-tight">{c.name}</p>
                      <p className="font-['JetBrains_Mono'] font-normal text-[var(--app-muted)] text-[9px] leading-tight">{c.email}</p>
                    </div>
                  </div>
                  <div className="w-[180px] font-['Figtree'] font-normal text-[var(--app-text)] text-[12px]">{c.specialization}</div>
                  <div className="w-[150px] font-['JetBrains_Mono'] font-normal text-[var(--app-muted)] text-[11px]">{c.license}</div>
                  <div className="w-[90px] font-['JetBrains_Mono'] font-bold text-[var(--app-text)] text-[12px]">{c.patients}</div>
                  <div className="w-[110px]"><StatusPill status={c.status} /></div>
                  <div className="w-[70px] flex items-center justify-end gap-[10px]">
                    <ActionBtn onClick={() => {}} title="View" icon={<EyeIcon />} />
                    <ActionBtn onClick={() => {}} title="Edit" icon={<EditIcon />} />
                  </div>
                </TableRow>
              ))}
            </div>
          </div>
        </TableCard>
      </div>
    </div>
  );
}
