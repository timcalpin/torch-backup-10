import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useAppContext } from "@/app/app-context";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchBox } from "@/components/common/SearchBox";
import { PrimaryBtn } from "@/components/common/Buttons";
import { MetricCard } from "@/components/common/MetricCard";
import { TableCard, TableHead, TableRow } from "@/components/common/Table";
import { ActionBtn } from "@/components/common/ActionBtn";
import { ModalOverlay, ModalCard, ModalHeader, ModalFooter } from "@/components/common/Modal";
import { FormField, TextInput } from "@/components/common/FormFields";
import { EyeIcon, EditIcon } from "@/components/icons";
import { ApiError } from "@/lib/api";
import {
  listCounselors,
  getCounselor,
  getCounselorStats,
  updateCounselor,
  deleteCounselor,
  counselorDisplayName,
  type ApiCounselor,
  type CounselorStats,
} from "@/lib/counselors";

interface DisplayCounselor {
  id: string;
  name: string;
  initials: string;
  role: string;
  avatarUrl: string;
  patients: number;
}

function toDisplayCounselor(counselor: ApiCounselor): DisplayCounselor {
  return {
    id: counselor.id,
    name: counselorDisplayName(counselor),
    initials: counselor.initials || "—",
    role: counselor.role,
    avatarUrl: counselor.avatar_url,
    patients: counselor.patients_count,
  };
}

function CounselorDetailModal({ counselorId, onClose }: { counselorId: string; onClose: () => void }) {
  const [detail, setDetail] = useState<ApiCounselor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getCounselor(counselorId)
      .then((response) => {
        if (!cancelled) setDetail(response);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Unable to load counselor details.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [counselorId]);

  const counselor = detail ? toDisplayCounselor(detail) : null;

  return (
    <ModalOverlay onClose={onClose}>
      <ModalCard>
        <ModalHeader title="Counselor profile" onClose={onClose} />
        {loading && <p className="font-['Figtree'] text-[13px] text-[var(--app-muted)]">Loading counselor details...</p>}
        {!loading && error && <p className="font-['Figtree'] text-[13px] text-red-500">{error}</p>}
        {!loading && !error && counselor && (
          <div className="flex flex-col gap-[20px]">
            <div className="flex items-center gap-[14px]">
              {counselor.avatarUrl ? (
                <img src={counselor.avatarUrl} alt={counselor.name} className="w-[48px] h-[48px] rounded-full flex-shrink-0 object-cover" />
              ) : (
                <div className="w-[48px] h-[48px] rounded-full bg-[rgba(243,116,34,0.18)] text-[#f37422] font-['Figtree'] font-bold text-[16px] flex items-center justify-center">
                  {counselor.initials}
                </div>
              )}
              <div>
                <p className="font-['Figtree'] font-bold text-[17px] text-[var(--app-text)]">{counselor.name}</p>
                <p className="font-['Figtree'] text-[13px] text-[var(--app-muted)]">{counselor.role}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-[12px]">
              {[
                ["Role", counselor.role],
                ["Patients assigned", String(counselor.patients)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[9px] bg-[var(--app-surface)] border border-[var(--app-border)] p-[12px]">
                  <p className="font-['JetBrains_Mono'] text-[9px] text-[var(--app-muted)]">{label}</p>
                  <p className="mt-[4px] font-['Figtree'] font-semibold text-[13px] text-[var(--app-text)]">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <ModalFooter onCancel={onClose} onConfirm={onClose} confirmLabel="Close" />
      </ModalCard>
    </ModalOverlay>
  );
}

function EditCounselorModal({ counselor, onClose, onSaved }: { counselor: DisplayCounselor; onClose: () => void; onSaved: () => void }) {
  const [role, setRole] = useState(counselor.role);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!role.trim()) {
      setError("Role is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await updateCounselor(counselor.id, { role: role.trim() });
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
        <ModalHeader title={`Edit ${counselor.name}`} onClose={onClose} />
        <div className="flex flex-col gap-[16px]">
          <FormField label="Role" required>
            <TextInput value={role} onChange={setRole} />
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

export function CounselorsPage() {
  const { setModal, counselorsVersion, bumpCounselorsVersion } = useAppContext();
  const [search, setSearch] = useState("");
  const [counselors, setCounselors] = useState<DisplayCounselor[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<CounselorStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [viewCounselorId, setViewCounselorId] = useState<string | null>(null);
  const [editCounselor, setEditCounselor] = useState<DisplayCounselor | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listCounselors()
      .then((response) => {
        if (cancelled) return;
        setCounselors(response.results.map(toDisplayCounselor));
        setTotalCount(response.count);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Unable to load counselors.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [counselorsVersion]);

  useEffect(() => {
    let cancelled = false;
    setStatsError(null);
    getCounselorStats()
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
  }, [counselorsVersion]);

  const filtered = counselors.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase()));

  const avgPatients = stats && stats.total_counselors > 0 ? Math.round((stats.total_patients_assigned / stats.total_counselors) * 10) / 10 : 0;

  const handleDelete = async (counselor: DisplayCounselor) => {
    if (!window.confirm(`Delete ${counselor.name}? This cannot be undone.`)) return;
    setDeletingId(counselor.id);
    setDeleteError(null);
    try {
      await deleteCounselor(counselor.id);
      bumpCounselorsVersion();
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Unable to delete counselor. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex-1 min-w-0 overflow-y-auto">
      <div className="p-[24px] lg:p-[32px] flex flex-col gap-[20px]">
        <PageHeader eyebrow={totalCount !== null ? `${totalCount} TOTAL COUNSELORS` : "LOADING COUNSELORS…"} title="Counselor Management">
          <SearchBox placeholder="Search counselors..." value={search} onChange={setSearch} />
          <PrimaryBtn label="+ Add Counselor" onClick={() => setModal("add-counselor")} />
        </PageHeader>

        {error && <p className="font-['Figtree'] text-[13px] text-red-500">{error}</p>}
        {statsError && <p className="font-['Figtree'] text-[13px] text-red-500">{statsError}</p>}
        {deleteError && <p className="font-['Figtree'] text-[13px] text-red-500">{deleteError}</p>}

        <div className="flex gap-[10px] flex-wrap">
          <MetricCard label="TOTAL COUNSELORS" value={stats ? String(stats.total_counselors) : "—"} delta="Live from server" deltaColor="#8a8073" accentColor="#f37422" />
          <MetricCard label="TOTAL PATIENTS ASSIGNED" value={stats ? String(stats.total_patients_assigned) : "—"} delta="Live from server" deltaColor="#8a8073" accentColor="#4ade80" />
          <MetricCard label="AVG PATIENTS / COUNSELOR" value={stats ? String(avgPatients) : "—"} delta="Live from server" deltaColor="#8a8073" accentColor="#6b8ab0" />
        </div>

        <TableCard>
          <div className="overflow-x-auto">
            <div className="min-w-[560px]">
              <TableHead cols={[
                { label: "COUNSELOR", w: "flex-1 min-w-[220px]" },
                { label: "ROLE", w: "w-[180px]" },
                { label: "PATIENTS", w: "w-[90px]" },
                { label: "ACTIONS", w: "w-[100px] text-right" },
              ]} />
              {loading && (
                <div className="py-[48px] text-center">
                  <p className="font-['Figtree'] text-[var(--app-muted)] text-[14px]">Loading counselors...</p>
                </div>
              )}
              {!loading && !error && filtered.map((c) => (
                <TableRow key={c.id}>
                  <div className="flex items-center gap-[10px] flex-1 min-w-[220px]">
                    {c.avatarUrl ? (
                      <img src={c.avatarUrl} alt={c.name} className="w-[32px] h-[32px] rounded-full flex-shrink-0 object-cover" />
                    ) : (
                      <div className="w-[32px] h-[32px] rounded-full bg-[rgba(243,116,34,0.2)] flex items-center justify-center flex-shrink-0">
                        <span className="font-['Figtree'] font-bold text-[#f37422] text-[11px]">{c.initials}</span>
                      </div>
                    )}
                    <p className="font-['Figtree'] font-semibold text-[var(--app-text)] text-[13px] leading-tight">{c.name}</p>
                  </div>
                  <div className="w-[180px] font-['Figtree'] font-normal text-[var(--app-text)] text-[12px]">{c.role}</div>
                  <div className="w-[90px] font-['JetBrains_Mono'] font-bold text-[var(--app-text)] text-[12px]">{c.patients}</div>
                  <div className="w-[100px] flex items-center justify-end gap-[10px]">
                    <ActionBtn onClick={() => setViewCounselorId(c.id)} title="View" icon={<EyeIcon />} />
                    <ActionBtn onClick={() => setEditCounselor(c)} title="Edit" icon={<EditIcon />} />
                    <ActionBtn
                      onClick={() => handleDelete(c)}
                      title="Delete counselor"
                      disabled={deletingId === c.id}
                      icon={<Trash2 size={15} strokeWidth={1.8} />}
                    />
                  </div>
                </TableRow>
              ))}
              {!loading && !error && filtered.length === 0 && (
                <div className="py-[48px] text-center">
                  <p className="font-['Figtree'] text-[var(--app-muted)] text-[14px]">
                    {counselors.length === 0 ? "No counselors yet." : "No counselors match your search."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </TableCard>
        {viewCounselorId && <CounselorDetailModal counselorId={viewCounselorId} onClose={() => setViewCounselorId(null)} />}
        {editCounselor && (
          <EditCounselorModal
            counselor={editCounselor}
            onClose={() => setEditCounselor(null)}
            onSaved={bumpCounselorsVersion}
          />
        )}
      </div>
    </div>
  );
}
