import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { useAppContext } from "@/app/app-context";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchBox } from "@/components/common/SearchBox";
import { GhostBtn, PrimaryBtn } from "@/components/common/Buttons";
import { MetricCard } from "@/components/common/MetricCard";
import { TableCard, TableToolbar, TableHead, TableRow } from "@/components/common/Table";
import { ActionBtn } from "@/components/common/ActionBtn";
import { ModalOverlay, ModalCard, ModalHeader, ModalFooter } from "@/components/common/Modal";
import { FormField, TextInput } from "@/components/common/FormFields";
import { FilterIcon, HashIcon, EyeIcon, EditIcon } from "@/components/icons";
import { ApiError } from "@/lib/api";
import {
  listSupportGroups,
  getSupportGroup,
  getSupportGroupStats,
  updateSupportGroup,
  deleteSupportGroup,
  type ApiSupportGroup,
  type SupportGroupStats,
} from "@/lib/supportGroups";

const GROUP_COLORS: Record<string, { bg: string; text: string; iconColor: string }> = {
  RECOVERY: { bg: "rgba(243,116,34,0.2)", text: "#f37422", iconColor: "#f37422" },
  SPIRIT: { bg: "rgba(163,115,143,0.2)", text: "#a3738f", iconColor: "#a3738f" },
  WELLNESS: { bg: "rgba(183,163,110,0.2)", text: "#b7a36e", iconColor: "#b7a36e" },
  COMMUNITY: { bg: "rgba(107,138,176,0.2)", text: "#6b8ab0", iconColor: "#6b8ab0" },
};

const FORMAT_COLORS: Record<string, { bg: string; text: string }> = {
  ONLINE: { bg: "rgba(74,222,128,0.15)", text: "#4ade80" },
  IN_PERSON: { bg: "rgba(107,138,176,0.15)", text: "#6b8ab0" },
  HYBRID: { bg: "rgba(250,204,21,0.15)", text: "#facc15" },
};

interface DisplayGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  members: number;
  capacity: number;
  schedule: string;
  moderator: string;
  format: string;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function toDisplayGroup(group: ApiSupportGroup): DisplayGroup {
  return {
    id: group.id,
    name: group.name,
    description: group.description,
    category: group.category.toUpperCase(),
    members: group.member_count,
    capacity: group.max_capacity,
    schedule: `${capitalize(group.meeting_day)} · ${group.meeting_time.slice(0, 5)}`,
    moderator: group.moderator_name ?? "Unassigned",
    format: group.format.toUpperCase().replace(/[\s-]/g, "_"),
  };
}

function GroupDetailModal({ groupId, onClose }: { groupId: string; onClose: () => void }) {
  const [detail, setDetail] = useState<ApiSupportGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getSupportGroup(groupId)
      .then((response) => {
        if (!cancelled) setDetail(response);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Unable to load group details.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [groupId]);

  const group = detail ? toDisplayGroup(detail) : null;

  return (
    <ModalOverlay onClose={onClose}>
      <ModalCard>
        <ModalHeader title="Group details" onClose={onClose} />
        {loading && <p className="font-['Figtree'] text-[13px] text-[var(--app-muted)]">Loading group details...</p>}
        {!loading && error && <p className="font-['Figtree'] text-[13px] text-red-500">{error}</p>}
        {!loading && !error && group && detail && (
          <div className="flex flex-col gap-[20px]">
            <div className="flex items-center gap-[14px]">
              <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: (GROUP_COLORS[group.category] ?? GROUP_COLORS.RECOVERY).bg }}>
                <HashIcon color={(GROUP_COLORS[group.category] ?? GROUP_COLORS.RECOVERY).iconColor} />
              </div>
              <div>
                <p className="font-['Figtree'] font-bold text-[17px] text-[var(--app-text)]">{group.name}</p>
                <p className="font-['Figtree'] text-[13px] text-[var(--app-muted)]">{group.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-[12px]">
              {[
                ["Category", group.category],
                ["Format", group.format.replace(/_/g, " ")],
                ["Members", `${group.members}/${group.capacity}`],
                ["Schedule", group.schedule],
                ["Moderator", group.moderator],
                ["Created", new Date(detail.created_at).toLocaleDateString()],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[9px] bg-[var(--app-surface)] border border-[var(--app-border)] p-[12px]">
                  <p className="font-['JetBrains_Mono'] text-[9px] text-[var(--app-muted)]">{label}</p>
                  <p className="mt-[4px] font-['Figtree'] font-semibold text-[13px] text-[var(--app-text)]">{value}</p>
                </div>
              ))}
            </div>
            {detail.tags.length > 0 && (
              <div className="rounded-[9px] bg-[var(--app-surface)] border border-[var(--app-border)] p-[12px]">
                <p className="font-['JetBrains_Mono'] text-[9px] text-[var(--app-muted)]">Tags</p>
                <div className="mt-[8px] flex flex-wrap gap-[6px]">
                  {detail.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center px-[8px] py-[3px] rounded-full font-['JetBrains_Mono'] font-bold text-[10px] bg-[rgba(107,138,176,0.15)] text-[#6b8ab0]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <ModalFooter onCancel={onClose} onConfirm={onClose} confirmLabel="Close" />
      </ModalCard>
    </ModalOverlay>
  );
}

function EditGroupModal({ group, onClose, onSaved }: { group: DisplayGroup; onClose: () => void; onSaved: () => void }) {
  const [maxCapacity, setMaxCapacity] = useState(String(group.capacity));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const parsed = Number(maxCapacity);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      setError("Max capacity must be a positive whole number.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await updateSupportGroup(group.id, { max_capacity: parsed });
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
        <ModalHeader title={`Edit ${group.name}`} onClose={onClose} />
        <div className="flex flex-col gap-[16px]">
          <FormField label="Max capacity" required>
            <TextInput type="number" value={maxCapacity} onChange={setMaxCapacity} />
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

export function SupportGroupsPage() {
  const { setModal, groupsVersion, bumpGroupsVersion } = useAppContext();
  const [formatTab, setFormatTab] = useState("All");
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState<DisplayGroup[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<SupportGroupStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [viewGroupId, setViewGroupId] = useState<string | null>(null);
  const [editGroup, setEditGroup] = useState<DisplayGroup | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listSupportGroups()
      .then((response) => {
        if (cancelled) return;
        setGroups(response.results.map(toDisplayGroup));
        setTotalCount(response.count);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Unable to load support groups.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [groupsVersion]);

  useEffect(() => {
    let cancelled = false;
    setStatsError(null);
    getSupportGroupStats()
      .then((response) => {
        if (!cancelled) setStats(response);
      })
      .catch((err) => {
        if (cancelled) return;
        setStatsError(err instanceof ApiError ? err.message : "Unable to load stats.");
      });
    return () => {
      cancelled = true;
    };
  }, [groupsVersion]);

  const formatTabs = useMemo(() => ["All", ...Array.from(new Set(groups.map((g) => g.format)))], [groups]);

  const filtered = groups.filter((g) => {
    if (formatTab !== "All" && g.format !== formatTab) return false;
    if (search && !g.name.toLowerCase().includes(search.toLowerCase()) && !g.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleDelete = async (group: DisplayGroup) => {
    if (!window.confirm(`Delete ${group.name}? This cannot be undone.`)) return;
    setDeletingId(group.id);
    setDeleteError(null);
    try {
      await deleteSupportGroup(group.id);
      bumpGroupsVersion();
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Unable to delete group. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex-1 min-w-0 overflow-y-auto">
      <div className="p-[24px] lg:p-[32px] flex flex-col gap-[20px]">
        <PageHeader eyebrow={totalCount !== null ? `${totalCount} TOTAL GROUPS` : "LOADING GROUPS…"} title="Support Groups">
          <SearchBox placeholder="Search groups..." value={search} onChange={setSearch} />
          <GhostBtn label="Filter" icon={<FilterIcon />} />
          <GhostBtn label="Export" />
          <PrimaryBtn label="+ Create Group" onClick={() => setModal("create-group")} />
        </PageHeader>

        {error && <p className="font-['Figtree'] text-[13px] text-red-500">{error}</p>}
        {statsError && <p className="font-['Figtree'] text-[13px] text-red-500">{statsError}</p>}
        {deleteError && <p className="font-['Figtree'] text-[13px] text-red-500">{deleteError}</p>}

        {/* Metric cards */}
        <div className="flex gap-[10px] flex-wrap">
          <MetricCard label="TOTAL GROUPS" value={stats ? String(stats.total_groups) : "—"} delta="Live from server" deltaColor="#8a8073" accentColor="#f37422" />
          <MetricCard label="TOTAL MEMBERS" value={stats ? String(stats.total_members) : "—"} delta="Live from server" deltaColor="#8a8073" accentColor="#4ade80" />
          <MetricCard label="AVG GROUP SIZE" value={stats ? stats.avg_group_size.toFixed(1) : "—"} delta="Live from server" deltaColor="#8a8073" accentColor="#6b8ab0" />
        </div>

        {/* Table */}
        <TableCard>
          <TableToolbar
            title="All Groups"
            tabs={formatTabs}
            activeTab={formatTab}
            onTab={setFormatTab}
            sortLabel="Members ↓"
          />
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              <TableHead cols={[
                { label: "GROUP", w: "flex-1 min-w-[260px]" },
                { label: "CATEGORY", w: "w-[120px]" },
                { label: "MEMBERS", w: "w-[90px]" },
                { label: "SCHEDULE", w: "w-[140px]" },
                { label: "MODERATOR", w: "w-[130px]" },
                { label: "FORMAT", w: "w-[110px]" },
                { label: "ACTIONS", w: "w-[100px] text-right" },
              ]} />
              {loading && (
                <div className="py-[48px] text-center">
                  <p className="font-['Figtree'] text-[var(--app-muted)] text-[14px]">Loading support groups...</p>
                </div>
              )}
              {!loading && !error && filtered.map((group) => {
                const clr = GROUP_COLORS[group.category] ?? GROUP_COLORS.RECOVERY;
                const fmt = FORMAT_COLORS[group.format] ?? FORMAT_COLORS.ONLINE;
                return (
                  <TableRow key={group.id}>
                    <div className="flex items-center gap-[10px] flex-1 min-w-[260px]">
                      <div className="w-[32px] h-[32px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: clr.bg }}>
                        <HashIcon color={clr.iconColor} />
                      </div>
                      <div>
                        <p className="font-['Figtree'] font-semibold text-[var(--app-text)] text-[13px] leading-tight">{group.name}</p>
                        <p className="font-['JetBrains_Mono'] font-normal text-[var(--app-muted)] text-[9px] leading-tight">{group.description}</p>
                      </div>
                    </div>
                    <div className="w-[120px]">
                      <span className="inline-flex items-center px-[8px] py-[3px] rounded-[4px] font-['JetBrains_Mono'] font-bold text-[10px]" style={{ background: clr.bg, color: clr.text }}>
                        {group.category}
                      </span>
                    </div>
                    <div className="w-[90px] font-['JetBrains_Mono'] font-bold text-[var(--app-text)] text-[12px]">{group.members}/{group.capacity}</div>
                    <div className="w-[140px] font-['JetBrains_Mono'] font-normal text-[var(--app-muted)] text-[10px]">{group.schedule}</div>
                    <div className="w-[130px] font-['Figtree'] font-normal text-[var(--app-text)] text-[12px]">{group.moderator}</div>
                    <div className="w-[110px]">
                      <span className="inline-flex items-center px-[8px] py-[3px] rounded-[4px] font-['JetBrains_Mono'] font-bold text-[10px]" style={{ background: fmt.bg, color: fmt.text }}>
                        {group.format.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="w-[100px] flex items-center justify-end gap-[10px]">
                      <ActionBtn onClick={() => setViewGroupId(group.id)} title="View" icon={<EyeIcon />} />
                      <ActionBtn onClick={() => setEditGroup(group)} title="Edit" icon={<EditIcon />} />
                      <ActionBtn
                        onClick={() => handleDelete(group)}
                        title="Delete group"
                        disabled={deletingId === group.id}
                        icon={<Trash2 size={15} strokeWidth={1.8} />}
                      />
                    </div>
                  </TableRow>
                );
              })}
              {!loading && !error && filtered.length === 0 && (
                <div className="py-[48px] text-center">
                  <p className="font-['Figtree'] text-[var(--app-muted)] text-[14px]">
                    {groups.length === 0 ? "No support groups yet." : "No groups match your search."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </TableCard>
        {viewGroupId && <GroupDetailModal groupId={viewGroupId} onClose={() => setViewGroupId(null)} />}
        {editGroup && (
          <EditGroupModal
            group={editGroup}
            onClose={() => setEditGroup(null)}
            onSaved={bumpGroupsVersion}
          />
        )}
      </div>
    </div>
  );
}
