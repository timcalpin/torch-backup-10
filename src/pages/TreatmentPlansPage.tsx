import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useAppContext } from "@/app/app-context";
import { PageHeader } from "@/components/common/PageHeader";
import { GhostBtn, PrimaryBtn } from "@/components/common/Buttons";
import { MetricCard } from "@/components/common/MetricCard";
import { TableCard, TableHead, TableRow } from "@/components/common/Table";
import { StatusPill } from "@/components/common/StatusPill";
import { ActionBtn } from "@/components/common/ActionBtn";
import { ModalOverlay, ModalCard, ModalHeader, ModalFooter } from "@/components/common/Modal";
import { FormField, TextInput, TextArea, SelectInput } from "@/components/common/FormFields";
import { ClipboardIcon, EyeIcon, EditIcon } from "@/components/icons";
import { ApiError } from "@/lib/api";
import {
  listTreatmentPlans,
  getTreatmentPlan,
  getTreatmentPlanStats,
  updateTreatmentPlan,
  deleteTreatmentPlan,
  TREATMENT_PLAN_STATUSES,
  type ApiTreatmentPlan,
  type TreatmentPlanStats,
  type TreatmentPlanStatus,
} from "@/lib/treatmentPlans";
import { listUsers, type ApiUser } from "@/lib/users";
import {
  listCounselors,
  getCounselor,
  getCounselorStats,
  updateCounselor,
  deleteCounselor,
  counselorDisplayName,
  COUNSELOR_STATUSES,
  COUNSELOR_STATUS_LABELS,
  COUNSELOR_SPECIALIZATIONS,
  COUNSELOR_SPECIALIZATION_LABELS,
  type ApiCounselor,
  type CounselorStats,
  type CounselorStatus,
  type CounselorSpecialization,
} from "@/lib/counselors";
import { buildUniqueOptions } from "@/lib/selectOptions";

const DURATION_OPTIONS = ["30 days", "60 days", "90 days", "6 months", "1 year"];
type TreatmentPlansView = "plans" | "counselors";

const STATUS_LABELS: Record<TreatmentPlanStatus, string> = {
  draft: "Draft",
  active: "Active",
  on_hold: "On Hold",
  completed: "Completed",
};

function toDisplayStatus(status: ApiTreatmentPlan["status"]): "ACTIVE" | "PENDING" | "ARCHIVED" {
  if (status === "active") return "ACTIVE";
  if (status === "completed") return "ARCHIVED";
  return "PENDING";
}

function toDisplayCounselorStatus(status: CounselorStatus | null | undefined): "ACTIVE" | "PENDING" | "ARCHIVED" {
  if (status === "active") return "ACTIVE";
  if (status === "inactive") return "ARCHIVED";
  return "PENDING"; // pending
}

function PlanViewToggle({ value, onChange }: { value: TreatmentPlansView; onChange: (view: TreatmentPlansView) => void }) {
  const options: { value: TreatmentPlansView; label: string }[] = [
    { value: "plans", label: "Treatment plans" },
    { value: "counselors", label: "Counselors" },
  ];

  return (
    <div className="inline-flex w-fit items-center gap-[4px] rounded-[10px] border border-[var(--app-border)] bg-[var(--app-surface)] p-[4px]">
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`h-[40px] rounded-[8px] px-[18px] font-['Figtree'] text-[13px] font-bold transition-all cursor-pointer ${
              active
                ? "border border-[rgba(243,116,34,0.45)] bg-[rgba(243,116,34,0.12)] text-[#f37422] shadow-[0_0_0_2px_var(--app-border-strong)]"
                : "border border-transparent text-[var(--app-muted)] hover:bg-[var(--app-hover)] hover:text-[var(--app-text)]"
            }`}
            aria-pressed={active}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function ViewPlanModal({ planId, onClose }: { planId: string; onClose: () => void }) {
  const [plan, setPlan] = useState<ApiTreatmentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getTreatmentPlan(planId)
      .then((response) => {
        if (!cancelled) setPlan(response);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Unable to load plan details.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [planId]);

  return (
    <ModalOverlay onClose={onClose}>
      <ModalCard>
        <ModalHeader title="Treatment plan details" onClose={onClose} />
        {loading && <p className="font-['Figtree'] text-[13px] text-[var(--app-muted)]">Loading plan details...</p>}
        {!loading && error && <p className="font-['Figtree'] text-[13px] text-red-500">{error}</p>}
        {!loading && !error && plan && (
          <div className="flex flex-col gap-[20px]">
            <div className="flex items-center gap-[14px]">
              <div className="w-[48px] h-[48px] rounded-full bg-[rgba(107,138,176,0.18)] flex items-center justify-center flex-shrink-0">
                <ClipboardIcon color="#6b8ab0" />
              </div>
              <div>
                <p className="font-['Figtree'] font-bold text-[17px] text-[var(--app-text)]">{plan.title || "Untitled plan"}</p>
                <p className="font-['Figtree'] text-[13px] text-[var(--app-muted)]">{plan.patient_name || "Unassigned"} · {plan.counselor_name || "Unassigned counselor"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-[12px]">
              {[
                ["Started", plan.start_date ? new Date(plan.start_date).toLocaleDateString() : "—"],
                ["Duration", plan.duration || "—"],
                ["Status", STATUS_LABELS[plan.status ?? "draft"]],
                ["Progress", `${plan.progress ?? 0}%`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[9px] bg-[var(--app-surface)] border border-[var(--app-border)] p-[12px]">
                  <p className="font-['JetBrains_Mono'] text-[9px] text-[var(--app-muted)]">{label}</p>
                  <p className="mt-[4px] font-['Figtree'] font-semibold text-[13px] text-[var(--app-text)]">{value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="font-['JetBrains_Mono'] text-[9px] text-[var(--app-muted)] mb-[6px]">GOALS &amp; MILESTONES</p>
              <p className="font-['Figtree'] text-[13px] text-[var(--app-text)] whitespace-pre-wrap">{plan.goals_and_milestones || "No goals recorded yet."}</p>
            </div>
          </div>
        )}
        <ModalFooter onCancel={onClose} onConfirm={onClose} confirmLabel="Close" />
      </ModalCard>
    </ModalOverlay>
  );
}

function CounselorDetailModal({ counselorId, onClose }: { counselorId: string; onClose: () => void }) {
  const [counselor, setCounselor] = useState<ApiCounselor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getCounselor(counselorId)
      .then((response) => {
        if (!cancelled) setCounselor(response);
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

  return (
    <ModalOverlay onClose={onClose}>
      <ModalCard>
        <ModalHeader title="Counselor profile" onClose={onClose} />
        {loading && <p className="font-['Figtree'] text-[13px] text-[var(--app-muted)]">Loading counselor details...</p>}
        {!loading && error && <p className="font-['Figtree'] text-[13px] text-red-500">{error}</p>}
        {!loading && !error && counselor && (
          <div className="flex flex-col gap-[20px]">
            <div className="flex items-center gap-[14px]">
              {counselor.avatar_url ? (
                <img
                  src={counselor.avatar_url}
                  alt={counselorDisplayName(counselor)}
                  className="w-[48px] h-[48px] rounded-full flex-shrink-0 object-cover"
                />
              ) : (
                <div className="w-[48px] h-[48px] rounded-full bg-[rgba(243,116,34,0.18)] text-[#f37422] font-['Figtree'] font-bold text-[16px] flex items-center justify-center">
                  {counselor.initials || "--"}
                </div>
              )}
              <div>
                <p className="font-['Figtree'] font-bold text-[17px] text-[var(--app-text)]">{counselorDisplayName(counselor)}</p>
                <p className="font-['Figtree'] text-[13px] text-[var(--app-muted)]">{counselor.specialization_label || counselor.role}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-[12px]">
              {[
                ["Email", counselor.email || "—"],
                ["Phone", counselor.phone || "—"],
                ["License Number", counselor.license_number || "—"],
                ["Status", counselor.status_label || COUNSELOR_STATUS_LABELS[counselor.status ?? "active"]],
                ["Specialization", counselor.specialization_label || "—"],
                ["Patients assigned", String(counselor.patient_count)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[9px] bg-[var(--app-surface)] border border-[var(--app-border)] p-[12px]">
                  <p className="font-['JetBrains_Mono'] text-[9px] text-[var(--app-muted)]">{label}</p>
                  <p className="mt-[4px] font-['Figtree'] font-semibold text-[13px] text-[var(--app-text)]">{value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="font-['JetBrains_Mono'] text-[9px] text-[var(--app-muted)] mb-[6px]">NOTES / CREDENTIALS</p>
              <p className="font-['Figtree'] text-[13px] text-[var(--app-text)] whitespace-pre-wrap">{counselor.notes_credentials || "No notes recorded yet."}</p>
            </div>
          </div>
        )}
        <ModalFooter onCancel={onClose} onConfirm={onClose} confirmLabel="Close" />
      </ModalCard>
    </ModalOverlay>
  );
}

function EditCounselorModal({
  counselor,
  onClose,
  onSaved,
}: {
  counselor: ApiCounselor;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [firstName, setFirstName] = useState(counselor.first_name ?? "");
  const [lastName, setLastName] = useState(counselor.last_name ?? "");
  const [phone, setPhone] = useState(counselor.phone ?? "");
  const [specialization, setSpecialization] = useState<CounselorSpecialization>(
    counselor.specialization ?? "addiction_trauma"
  );
  const [licenseNumber, setLicenseNumber] = useState(counselor.license_number ?? "");
  const [status, setStatus] = useState<CounselorStatus>(counselor.status ?? "active");
  const [notes, setNotes] = useState(counselor.notes_credentials ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError("First and last name are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await updateCounselor(counselor.id, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        specialization,
        license_number: licenseNumber.trim(),
        status,
        notes_credentials: notes.trim(),
      });
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
        <ModalHeader title={`Edit ${counselorDisplayName(counselor)}`} onClose={onClose} />
        <div className="flex flex-col gap-[16px]">
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <FormField label="First Name" required>
                <TextInput value={firstName} onChange={setFirstName} />
              </FormField>
            </div>
            <div className="flex-1 min-w-[180px]">
              <FormField label="Last Name" required>
                <TextInput value={lastName} onChange={setLastName} />
              </FormField>
            </div>
          </div>

          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <FormField label="Email">
                {/* Email is locked after creation — it's the counselor's identity/login. */}
                <TextInput value={counselor.email ?? ""} onChange={() => {}} disabled />
              </FormField>
            </div>
            <div className="flex-1 min-w-[180px]">
              <FormField label="Phone">
                <TextInput type="tel" value={phone} onChange={setPhone} />
              </FormField>
            </div>
          </div>

          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <FormField label="Specialization">
                <SelectInput
                  options={COUNSELOR_SPECIALIZATIONS.map((s) => COUNSELOR_SPECIALIZATION_LABELS[s])}
                  value={COUNSELOR_SPECIALIZATION_LABELS[specialization]}
                  onChange={(label) =>
                    setSpecialization(
                      COUNSELOR_SPECIALIZATIONS.find((s) => COUNSELOR_SPECIALIZATION_LABELS[s] === label) ??
                        "addiction_trauma"
                    )
                  }
                />
              </FormField>
            </div>
            <div className="flex-1 min-w-[180px]">
              <FormField label="License Number">
                <TextInput value={licenseNumber} onChange={setLicenseNumber} />
              </FormField>
            </div>
          </div>

          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <FormField label="Status">
                <SelectInput
                  options={COUNSELOR_STATUSES.map((s) => COUNSELOR_STATUS_LABELS[s])}
                  value={COUNSELOR_STATUS_LABELS[status]}
                  onChange={(label) =>
                    setStatus(COUNSELOR_STATUSES.find((s) => COUNSELOR_STATUS_LABELS[s] === label) ?? "active")
                  }
                />
              </FormField>
            </div>
            <div className="flex-1 min-w-[180px]" />
          </div>

          <FormField label="Notes / Credentials">
            <TextArea value={notes} onChange={setNotes} />
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

function EditPlanModal({ plan, onClose, onSaved }: { plan: ApiTreatmentPlan; onClose: () => void; onSaved: () => void }) {
  const [patients, setPatients] = useState<ApiUser[]>([]);
  const [counselors, setCounselors] = useState<ApiCounselor[]>([]);

  const [title, setTitle] = useState(plan.title ?? "");
  const [patientLabel, setPatientLabel] = useState("");
  const [counselorLabel, setCounselorLabel] = useState("");
  const [startDate, setStartDate] = useState(plan.start_date ?? "");
  const [duration, setDuration] = useState(plan.duration || DURATION_OPTIONS[2]);
  const [goals, setGoals] = useState(plan.goals_and_milestones ?? "");
  const [status, setStatus] = useState<TreatmentPlanStatus>(plan.status ?? "draft");
  const [progress, setProgress] = useState(String(plan.progress ?? 0));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listUsers()
      .then((response) => {
        if (cancelled) return;
        setPatients(response.results);
        const current = response.results.find((p) => p.id === plan.patient);
        if (current) setPatientLabel(current.full_name.trim() || current.email);
      })
      .catch(() => {});
    listCounselors()
      .then((response) => {
        if (cancelled) return;
        setCounselors(response.results);
        const current = response.results.find((c) => c.id === plan.counselor);
        if (current) setCounselorLabel(counselorDisplayName(current));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [plan.patient, plan.counselor]);

  const patientChoices = buildUniqueOptions(patients, (p) => p.full_name.trim() || p.email, (p) => p.id);
  const counselorChoices = buildUniqueOptions(counselors, counselorDisplayName, (c) => c.id);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Plan title is required.");
      return;
    }
    const progressValue = Math.max(0, Math.min(100, Number(progress) || 0));
    setSubmitting(true);
    setError(null);
    try {
      const patient = patientChoices.find((o) => o.label === patientLabel)?.id ?? null;
      const counselor = counselorChoices.find((o) => o.label === counselorLabel)?.id ?? null;
      await updateTreatmentPlan(plan.id, {
        title: title.trim(),
        patient,
        counselor,
        start_date: startDate || null,
        duration,
        goals_and_milestones: goals.trim(),
        status,
        progress: progressValue,
      });
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
        <ModalHeader title={`Edit ${plan.title || "plan"}`} onClose={onClose} />
        <div className="flex flex-col gap-[16px]">
          <FormField label="Plan Title" required><TextInput value={title} onChange={setTitle} /></FormField>
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <FormField label="Patient">
                <SelectInput
                  options={["Select patient", ...patientChoices.map((o) => o.label)]}
                  value={patientLabel || "Select patient"}
                  onChange={setPatientLabel}
                />
              </FormField>
            </div>
            <div className="flex-1 min-w-[180px]">
              <FormField label="Counselor">
                <SelectInput
                  options={["Unassigned", ...counselorChoices.map((o) => o.label)]}
                  value={counselorLabel || "Unassigned"}
                  onChange={setCounselorLabel}
                />
              </FormField>
            </div>
          </div>
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <FormField label="Start Date"><TextInput type="date" value={startDate ?? ""} onChange={setStartDate} /></FormField>
            </div>
            <div className="flex-1 min-w-[180px]">
              <FormField label="Duration">
                <SelectInput options={DURATION_OPTIONS} value={duration} onChange={setDuration} />
              </FormField>
            </div>
          </div>
          <FormField label="Goals & Milestones">
            <TextArea value={goals ?? ""} onChange={setGoals} />
          </FormField>
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <FormField label="Status">
                <SelectInput
                  options={TREATMENT_PLAN_STATUSES.map((s) => STATUS_LABELS[s])}
                  value={STATUS_LABELS[status]}
                  onChange={(label) => setStatus(TREATMENT_PLAN_STATUSES.find((s) => STATUS_LABELS[s] === label) ?? "draft")}
                />
              </FormField>
            </div>
            <div className="flex-1 min-w-[180px]">
              <FormField label="Progress %">
                <TextInput type="number" value={progress} onChange={setProgress} />
              </FormField>
            </div>
          </div>
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

function CounselorsPanel({
  counselorsVersion,
  bumpCounselorsVersion,
}: {
  counselorsVersion: number;
  bumpCounselorsVersion: () => void;
}) {
  const [counselors, setCounselors] = useState<ApiCounselor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<CounselorStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [viewCounselorId, setViewCounselorId] = useState<string | null>(null);
  const [editCounselor, setEditCounselor] = useState<ApiCounselor | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listCounselors()
      .then((response) => {
        if (!cancelled) setCounselors(response.results);
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

  const avgPatients = stats && stats.total_counselors > 0 ? Math.round((stats.total_patients_assigned / stats.total_counselors) * 10) / 10 : 0;

  const handleDelete = async (counselor: ApiCounselor) => {
    if (!window.confirm(`Delete ${counselorDisplayName(counselor)}? This cannot be undone.`)) return;
    setDeletingId(counselor.id);
    setDeleteError(null);
    try {
      await deleteCounselor(counselor.id);
      bumpCounselorsVersion();
    } catch (err) {
      // The backend blocks deletion while patient assignments/appointments
      // still reference this counselor and asks you to mark them inactive
      // instead — surface that message as-is rather than a generic one.
      setDeleteError(err instanceof ApiError ? err.message : "Unable to delete counselor. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {error && <p className="font-['Figtree'] text-[13px] text-red-500">{error}</p>}
      {statsError && <p className="font-['Figtree'] text-[13px] text-red-500">{statsError}</p>}
      {deleteError && <p className="font-['Figtree'] text-[13px] text-red-500">{deleteError}</p>}

      <div className="flex gap-[10px] flex-wrap">
        <MetricCard label="TOTAL COUNSELORS" value={stats ? String(stats.total_counselors) : "--"} delta="Live from server" deltaColor="#8a8073" accentColor="#f37422" />
        <MetricCard label="TOTAL PATIENTS ASSIGNED" value={stats ? String(stats.total_patients_assigned) : "--"} delta="Live from server" deltaColor="#8a8073" accentColor="#4ade80" />
        <MetricCard label="AVG PATIENTS / COUNSELOR" value={stats ? String(avgPatients) : "--"} delta="Live from server" deltaColor="#8a8073" accentColor="#6b8ab0" />
      </div>

      <TableCard>
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <TableHead cols={[
              { label: "COUNSELOR", w: "flex-1 min-w-[220px]" },
              { label: "SPECIALIZATION", w: "w-[220px]" },
              { label: "PATIENTS", w: "w-[110px]" },
              { label: "STATUS", w: "w-[120px]" },
              { label: "ACTIONS", w: "w-[100px] text-right" },
            ]} />
            {loading && (
              <div className="py-[48px] text-center">
                <p className="font-['Figtree'] text-[var(--app-muted)] text-[14px]">Loading counselors...</p>
              </div>
            )}
            {!loading && !error && counselors.map((c) => (
              <TableRow key={c.id}>
                <div className="flex items-center gap-[10px] flex-1 min-w-[220px]">
                  {c.avatar_url ? (
                    <img src={c.avatar_url} alt={counselorDisplayName(c)} className="w-[32px] h-[32px] rounded-full flex-shrink-0 object-cover" />
                  ) : (
                    <div className="w-[32px] h-[32px] rounded-full bg-[rgba(243,116,34,0.2)] flex items-center justify-center flex-shrink-0">
                      <span className="font-['Figtree'] font-bold text-[#f37422] text-[11px]">{c.initials || "--"}</span>
                    </div>
                  )}
                  <p className="font-['Figtree'] font-semibold text-[var(--app-text)] text-[13px] leading-tight">{counselorDisplayName(c)}</p>
                </div>
                <div className="w-[220px] font-['Figtree'] font-normal text-[var(--app-text)] text-[12px]">{c.specialization_label || "—"}</div>
                <div className="w-[110px] font-['JetBrains_Mono'] font-bold text-[var(--app-text)] text-[12px]">{c.patient_count}</div>
                <div className="w-[120px]"><StatusPill status={toDisplayCounselorStatus(c.status)} /></div>
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
            {!loading && !error && counselors.length === 0 && (
              <div className="py-[48px] text-center">
                <p className="font-['Figtree'] text-[var(--app-muted)] text-[14px]">No counselors yet.</p>
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
    </>
  );
}

export function TreatmentPlansPage() {
  const { setModal, treatmentPlansVersion, bumpTreatmentPlansVersion, counselorsVersion, bumpCounselorsVersion } = useAppContext();
  const [view, setView] = useState<TreatmentPlansView>("plans");
  const [plans, setPlans] = useState<ApiTreatmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<TreatmentPlanStats | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [viewPlanId, setViewPlanId] = useState<string | null>(null);
  const [editPlan, setEditPlan] = useState<ApiTreatmentPlan | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listTreatmentPlans()
      .then((response) => {
        if (!cancelled) setPlans(response.results);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Unable to load treatment plans.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    getTreatmentPlanStats()
      .then((response) => {
        if (!cancelled) setStats(response);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [treatmentPlansVersion]);

  const handleDelete = async (plan: ApiTreatmentPlan) => {
    if (!window.confirm(`Delete "${plan.title || "this plan"}"? This cannot be undone.`)) return;
    setActionError(null);
    try {
      await deleteTreatmentPlan(plan.id);
      bumpTreatmentPlansVersion();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Unable to delete plan.");
    }
  };

  return (
    <div className="flex-1 min-w-0 overflow-y-auto">
      <div className="p-[24px] lg:p-[32px] flex flex-col gap-[20px]">
        <PageHeader
          eyebrow={view === "plans" ? (stats ? `${stats.active_count} ACTIVE PLANS - ${stats.pending_count} PENDING REVIEW` : "LOADING PLANS...") : "COUNSELOR DIRECTORY"}
          title={view === "plans" ? "Treatment Plans" : "Treatment Counselors"}
        >
          <GhostBtn label="+ Add Counselor" onClick={() => setModal("add-counselor")} />
          {view === "plans" && <PrimaryBtn label="+ New Plan" onClick={() => setModal("new-plan")} />}
        </PageHeader>

        <PlanViewToggle value={view} onChange={setView} />

        {view === "counselors" ? (
          <CounselorsPanel counselorsVersion={counselorsVersion} bumpCounselorsVersion={bumpCounselorsVersion} />
        ) : (
          <>
        {error && <p className="font-['Figtree'] text-[13px] text-red-500">{error}</p>}
        {actionError && <p className="font-['Figtree'] text-[13px] text-red-500">{actionError}</p>}

        <div className="flex gap-[10px] flex-wrap">
          <MetricCard label="ACTIVE PLANS" value={stats ? String(stats.active_count) : "—"} delta="Live from server" deltaColor="#8a8073" accentColor="#f37422" />
          <MetricCard label="AVG COMPLETION" value={stats ? `${stats.avg_progress}%` : "—"} delta="Live from server" deltaColor="#8a8073" accentColor="#4ade80" />
          <MetricCard label="COMPLETED" value={stats ? String(stats.completed_count) : "—"} delta="Live from server" deltaColor="#8a8073" accentColor="#6b8ab0" />
          <MetricCard label="PENDING REVIEW" value={stats ? String(stats.pending_count) : "—"} delta="Live from server" deltaColor="#8a8073" accentColor="#facc15" />
        </div>

        <TableCard>
          <div className="overflow-x-auto">
            <div className="min-w-[880px]">
              <TableHead cols={[
                { label: "PLAN", w: "flex-1 min-w-[200px]" },
                { label: "PATIENT", w: "w-[130px]" },
                { label: "COUNSELOR", w: "w-[130px]" },
                { label: "STARTED", w: "w-[90px]" },
                { label: "DURATION", w: "w-[90px]" },
                { label: "PROGRESS", w: "w-[160px]" },
                { label: "STATUS", w: "w-[100px]" },
                { label: "ACTIONS", w: "w-[100px] text-right" },
              ]} />
              {loading && (
                <div className="py-[48px] text-center">
                  <p className="font-['Figtree'] text-[var(--app-muted)] text-[14px]">Loading treatment plans...</p>
                </div>
              )}
              {!loading && plans.map((plan) => {
                const progress = plan.progress ?? 0;
                return (
                  <div key={plan.id} className="flex items-center px-[18px] h-[60px] border-b border-[var(--app-border-soft)] last:border-b-0 hover:bg-[var(--app-hover)] transition-colors">
                    <div className="flex items-center gap-[10px] flex-1 min-w-[200px]">
                      <div className="w-[32px] h-[32px] rounded-full bg-[rgba(107,138,176,0.2)] flex items-center justify-center flex-shrink-0">
                        <ClipboardIcon color="#6b8ab0" />
                      </div>
                      <p className="font-['Figtree'] font-semibold text-[var(--app-text)] text-[13px]">{plan.title || "Untitled plan"}</p>
                    </div>
                    <div className="w-[130px] font-['Figtree'] font-normal text-[var(--app-text)] text-[12px]">{plan.patient_name || "—"}</div>
                    <div className="w-[130px] font-['Figtree'] font-normal text-[var(--app-text)] text-[12px]">{plan.counselor_name || "Unassigned"}</div>
                    <div className="w-[90px] font-['JetBrains_Mono'] font-normal text-[var(--app-muted)] text-[11px]">
                      {plan.start_date ? new Date(plan.start_date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—"}
                    </div>
                    <div className="w-[90px] font-['JetBrains_Mono'] font-normal text-[var(--app-muted)] text-[11px]">{plan.duration || "—"}</div>
                    <div className="w-[160px]">
                      <div className="flex items-center gap-[8px]">
                        <div className="flex-1 h-[4px] bg-[var(--app-border)] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${progress}%`, background: progress > 75 ? "#4ade80" : progress > 40 ? "#f37422" : "#facc15" }} />
                        </div>
                        <span className="font-['JetBrains_Mono'] font-bold text-[var(--app-text)] text-[10px] w-[30px]">{progress}%</span>
                      </div>
                    </div>
                    <div className="w-[100px]"><StatusPill status={toDisplayStatus(plan.status)} /></div>
                    <div className="w-[100px] flex items-center justify-end gap-[10px]">
                      <ActionBtn onClick={() => setViewPlanId(plan.id)} title="View" icon={<EyeIcon />} />
                      <ActionBtn onClick={() => setEditPlan(plan)} title="Edit" icon={<EditIcon />} />
                      <ActionBtn onClick={() => handleDelete(plan)} title="Delete" icon={<Trash2 size={15} strokeWidth={1.8} />} />
                    </div>
                  </div>
                );
              })}
              {!loading && plans.length === 0 && (
                <div className="py-[48px] text-center">
                  <p className="font-['Figtree'] text-[var(--app-muted)] text-[14px]">No treatment plans yet.</p>
                </div>
              )}
            </div>
          </div>
        </TableCard>
        {viewPlanId && <ViewPlanModal planId={viewPlanId} onClose={() => setViewPlanId(null)} />}
        {editPlan && (
          <EditPlanModal plan={editPlan} onClose={() => setEditPlan(null)} onSaved={bumpTreatmentPlansVersion} />
        )}
          </>
        )}
      </div>
    </div>
  );
}