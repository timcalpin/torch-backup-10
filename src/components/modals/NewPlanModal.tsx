import { useEffect, useState } from "react";
import { ModalOverlay, ModalCard, ModalHeader, ModalFooter } from "@/components/common/Modal";
import { FormField, TextInput, TextArea, SelectInput } from "@/components/common/FormFields";
import { ApiError } from "@/lib/api";
import { TREATMENT_PLAN_STATUSES, createTreatmentPlan,  EMPTY_TREATMENT_PLAN_STRUCTURE, type TreatmentPlanStatus } from "@/lib/treatmentPlans";
import { listUsers, type ApiUser } from "@/lib/users";
import { listCounselors, counselorDisplayName, type ApiCounselor } from "@/lib/counselors";
import { buildUniqueOptions } from "@/lib/selectOptions";
import { useAppContext } from "@/app/app-context";

const DURATION_OPTIONS = ["30 days", "60 days", "90 days", "6 months", "1 year"];

const STATUS_LABELS: Record<TreatmentPlanStatus, string> = {
  draft: "Draft",
  active: "Active",
  on_hold: "On Hold",
  completed: "Completed",
};

export function NewPlanModal({ onClose }: { onClose: () => void }) {
  const { bumpTreatmentPlansVersion } = useAppContext();
  const [patients, setPatients] = useState<ApiUser[]>([]);
  const [counselors, setCounselors] = useState<ApiCounselor[]>([]);

  const [title, setTitle] = useState("");
  const [patientLabel, setPatientLabel] = useState("");
  const [counselorLabel, setCounselorLabel] = useState("");
  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState(DURATION_OPTIONS[2]);
  const [goals, setGoals] = useState("");
  const [status, setStatus] = useState<TreatmentPlanStatus>("draft");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listUsers()
      .then((response) => {
        if (!cancelled) setPatients(response.results);
      })
      .catch(() => {});
    listCounselors()
      .then((response) => {
        if (!cancelled) setCounselors(response.results);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const patientChoices = buildUniqueOptions(patients, (p) => p.full_name.trim() || p.email, (p) => p.id);
  const counselorChoices = buildUniqueOptions(counselors, counselorDisplayName, (c) => c.id);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Plan title is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const patient = patientChoices.find((o) => o.label === patientLabel)?.id ?? null;
      const counselor = counselorChoices.find((o) => o.label === counselorLabel)?.id ?? null;
      const initialStructure = {
  ...EMPTY_TREATMENT_PLAN_STRUCTURE,
  clientOverview: goals.trim(),
};

      const createdPlan = await createTreatmentPlan({
        title: title.trim(),
        patient,
        counselor,
        start_date: startDate || null,
        duration,
        goals_and_milestones: JSON.stringify(initialStructure),
        status,
      });
      
      bumpTreatmentPlansVersion();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to create plan. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalCard>
        <ModalHeader title="New Treatment Plan" onClose={onClose} />
        <div className="flex flex-col gap-[16px]">
          <FormField label="Plan Title" required><TextInput placeholder="e.g. 90-Day Recovery Pathway" value={title} onChange={setTitle} /></FormField>
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
              <FormField label="Start Date"><TextInput type="date" value={startDate} onChange={setStartDate} /></FormField>
            </div>
            <div className="flex-1 min-w-[180px]">
              <FormField label="Duration">
                <SelectInput options={DURATION_OPTIONS} value={duration} onChange={setDuration} />
              </FormField>
            </div>
          </div>
          <FormField label="Goals & Milestones">
            <TextArea placeholder="Define recovery goals and measurable milestones..." value={goals} onChange={setGoals} />
          </FormField>
          <FormField label="Status">
            <SelectInput
              options={TREATMENT_PLAN_STATUSES.map((s) => STATUS_LABELS[s])}
              value={STATUS_LABELS[status]}
              onChange={(label) => setStatus(TREATMENT_PLAN_STATUSES.find((s) => STATUS_LABELS[s] === label) ?? "draft")}
            />
          </FormField>
          {error && <p className="font-['Figtree'] text-[13px] text-red-500">{error}</p>}
        </div>
        <ModalFooter
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmLabel={submitting ? "Creating..." : "Create Plan"}
          confirmDisabled={submitting}
        />
      </ModalCard>
    </ModalOverlay>
  );
}
