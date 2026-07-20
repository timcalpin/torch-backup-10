import { useState } from "react";
import { useAppContext } from "@/app/app-context";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchBox } from "@/components/common/SearchBox";
import { GhostBtn, PrimaryBtn } from "@/components/common/Buttons";
import { MetricCard } from "@/components/common/MetricCard";
import { TableCard, TableToolbar, TableHead, TableRow } from "@/components/common/Table";
import { StatusPill } from "@/components/common/StatusPill";
import { ActionBtn } from "@/components/common/ActionBtn";
import { FilterIcon, HashIcon, EyeIcon, EditIcon } from "@/components/icons";

const GROUP_COLORS: Record<string, { bg: string; text: string; iconColor: string }> = {
  RECOVERY: { bg: "rgba(243,116,34,0.2)", text: "#f37422", iconColor: "#f37422" },
  SPIRIT: { bg: "rgba(163,115,143,0.2)", text: "#a3738f", iconColor: "#a3738f" },
  WELLNESS: { bg: "rgba(183,163,110,0.2)", text: "#b7a36e", iconColor: "#b7a36e" },
  COMMUNITY: { bg: "rgba(107,138,176,0.2)", text: "#6b8ab0", iconColor: "#6b8ab0" },
};

const GROUPS = [
  { id: 1, name: "Men's Recovery Group", desc: "Weekly peer support session", category: "RECOVERY", members: 12, activity: "2h ago", moderator: "Sarah K.", status: "ACTIVE" as const },
  { id: 2, name: "Early Recovery Support", desc: "Focus on 0-6 month sobriety", category: "RECOVERY", members: 24, activity: "1h ago", moderator: "Dr. Chen", status: "ACTIVE" as const },
  { id: 3, name: "Sober Parents Circle", desc: "Balancing family and sobriety", category: "SPIRIT", members: 8, activity: "5h ago", moderator: "Maria L.", status: "ACTIVE" as const },
  { id: 4, name: "Newly Sober (0-90)", desc: "High intensity daily check-ins", category: "RECOVERY", members: 18, activity: "30m ago", moderator: "James T.", status: "ACTIVE" as const },
  { id: 5, name: "Women's Wellness Circle", desc: "Holistic recovery for women", category: "WELLNESS", members: 15, activity: "3h ago", moderator: "Sarah K.", status: "ACTIVE" as const },
  { id: 6, name: "Faith & Recovery", desc: "Spiritual pathway to sobriety", category: "SPIRIT", members: 10, activity: "Yesterday", moderator: "Unassigned", status: "PENDING" as const },
];

export function SupportGroupsPage() {
  const { setModal } = useAppContext();
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = GROUPS.filter((g) => {
    if (tab === "Active" && g.status !== "ACTIVE") return false;
    if (tab === "Pending" && g.status !== "PENDING") return false;
    if (tab === "Archived") return false;
    if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex-1 min-w-0 overflow-y-auto">
      <div className="p-[24px] lg:p-[32px] flex flex-col gap-[20px]">
        <PageHeader eyebrow="84 ACTIVE GROUPS · 1,840 TOTAL MEMBERS" title="Support Groups">
          <SearchBox placeholder="Search groups..." value={search} onChange={setSearch} />
          <GhostBtn label="Filter" icon={<FilterIcon />} />
          <GhostBtn label="Export" />
          <PrimaryBtn label="+ Create Group" onClick={() => setModal("create-group")} />
        </PageHeader>

        {/* Metric cards */}
        <div className="flex gap-[10px] flex-wrap">
          <MetricCard label="ACTIVE GROUPS" value="84" delta="↑ +2 vs last week" deltaColor="#4ade80" accentColor="#f37422" />
          <MetricCard label="TOTAL MEMBERS" value="1,840" delta="↑ +12% vs last week" deltaColor="#4ade80" accentColor="#4ade80" />
          <MetricCard label="AVG GROUP SIZE" value="22" delta="↑ +1.4 vs last week" deltaColor="#4ade80" accentColor="#6b8ab0" />
          <MetricCard label="PENDING APPROVAL" value="6" delta="↓ -3 vs last week" deltaColor="#ef4444" accentColor="#facc15" />
        </div>

        {/* Table */}
        <TableCard>
          <TableToolbar
            title="All Groups"
            tabs={["All", "Active", "Pending", "Archived"]}
            activeTab={tab}
            onTab={setTab}
            sortLabel="Members ↓"
          />
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              <TableHead cols={[
                { label: "GROUP", w: "flex-1 min-w-[260px]" },
                { label: "CATEGORY", w: "w-[120px]" },
                { label: "MEMBERS", w: "w-[90px]" },
                { label: "ACTIVITY", w: "w-[140px]" },
                { label: "MODERATOR", w: "w-[130px]" },
                { label: "STATUS", w: "w-[110px]" },
                { label: "ACTIONS", w: "w-[70px] text-right" },
              ]} />
              {filtered.map((group) => {
                const clr = GROUP_COLORS[group.category] ?? GROUP_COLORS.RECOVERY;
                return (
                  <TableRow key={group.id}>
                    <div className="flex items-center gap-[10px] flex-1 min-w-[260px]">
                      <div className="w-[32px] h-[32px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: clr.bg }}>
                        <HashIcon color={clr.iconColor} />
                      </div>
                      <div>
                        <p className="font-['Figtree'] font-semibold text-[var(--app-text)] text-[13px] leading-tight">{group.name}</p>
                        <p className="font-['JetBrains_Mono'] font-normal text-[var(--app-muted)] text-[9px] leading-tight">{group.desc}</p>
                      </div>
                    </div>
                    <div className="w-[120px]">
                      <span className="inline-flex items-center px-[8px] py-[3px] rounded-[4px] font-['JetBrains_Mono'] font-bold text-[10px]" style={{ background: clr.bg, color: clr.text }}>
                        {group.category}
                      </span>
                    </div>
                    <div className="w-[90px] font-['JetBrains_Mono'] font-bold text-[var(--app-text)] text-[12px]">{group.members}</div>
                    <div className="w-[140px] flex items-center gap-[8px]">
                      <svg width="36" height="14" viewBox="0 0 36 14" fill="none">
                        <line x1="0" y1="11" x2="9" y2="8" stroke={clr.text} opacity="0.5" strokeWidth="1.2" />
                        <line x1="9" y1="8" x2="18" y2="9" stroke={clr.text} opacity="0.5" strokeWidth="1.2" />
                        <line x1="18" y1="9" x2="27" y2="7" stroke={clr.text} opacity="0.5" strokeWidth="1.2" />
                        <line x1="27" y1="7" x2="36" y2="4" stroke={clr.text} opacity="0.5" strokeWidth="1.2" />
                      </svg>
                      <span className="font-['JetBrains_Mono'] font-normal text-[var(--app-muted)] text-[10px]">{group.activity}</span>
                    </div>
                    <div className="w-[130px] font-['Figtree'] font-normal text-[var(--app-text)] text-[12px]">{group.moderator}</div>
                    <div className="w-[110px]"><StatusPill status={group.status} /></div>
                    <div className="w-[70px] flex items-center justify-end gap-[10px]">
                      <ActionBtn onClick={() => {}} title="View" icon={<EyeIcon />} />
                      <ActionBtn onClick={() => {}} title="Edit" icon={<EditIcon />} />
                    </div>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <div className="py-[48px] text-center">
                  <p className="font-['Figtree'] text-[var(--app-muted)] text-[14px]">No groups match your search.</p>
                </div>
              )}
            </div>
          </div>
        </TableCard>
      </div>
    </div>
  );
}
