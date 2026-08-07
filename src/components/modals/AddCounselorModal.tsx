import { useState } from "react";
import { ModalOverlay, ModalCard, ModalHeader, ModalFooter } from "@/components/common/Modal";
import { FormField, TextInput, TextArea, SelectInput } from "@/components/common/FormFields";
import { ApiError } from "@/lib/api";
import {
  createCounselor,
  COUNSELOR_STATUSES,
  COUNSELOR_STATUS_LABELS,
  COUNSELOR_SPECIALIZATIONS,
  COUNSELOR_SPECIALIZATION_LABELS,
  type CounselorStatus,
  type CounselorSpecialization,
} from "@/lib/counselors";
import { useAppContext } from "@/app/app-context";

export function AddCounselorModal({ onClose }: { onClose: () => void }) {
  const { bumpCounselorsVersion } = useAppContext();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState<CounselorSpecialization>("addiction_trauma");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [status, setStatus] = useState<CounselorStatus>("active");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError("First and last name are required.");
      return;
    }
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createCounselor({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        specialization,
        license_number: licenseNumber.trim(),
        status,
        notes_credentials: notes.trim(),
      });
      bumpCounselorsVersion();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to add counselor. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalCard>
        <ModalHeader title="Add Counselor" onClose={onClose} />
        <div className="flex items-center gap-[16px] mb-[24px]">
          <div className="relative w-[48px] h-[48px] rounded-[24px] bg-[var(--app-surface)] flex items-center justify-center flex-shrink-0 border border-[var(--app-border)]">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M13 3H17V7M17 3L11 9M4 13V17H8M4 17L10 11" stroke="#8A8073" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </div>
          <div>
            <p className="font-['Figtree'] font-semibold text-[var(--app-text)] text-[15px]">New Professional Profile</p>
            <p className="font-['Figtree'] font-normal text-[var(--app-muted)] text-[13px]">Create a record for an accredited therapist or counselor.</p>
          </div>
        </div>
        <div className="flex flex-col gap-[16px]">
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <FormField label="First Name" required>
                <TextInput placeholder="Marcus" value={firstName} onChange={setFirstName} />
              </FormField>
            </div>
            <div className="flex-1 min-w-[180px]">
              <FormField label="Last Name" required>
                <TextInput placeholder="Kerr" value={lastName} onChange={setLastName} />
              </FormField>
            </div>
          </div>

          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <FormField label="Email" required>
                <TextInput type="email" placeholder="m.kerr@torchrecovery.com" value={email} onChange={setEmail} />
              </FormField>
            </div>
            <div className="flex-1 min-w-[180px]">
              <FormField label="Phone">
                <TextInput type="tel" placeholder="+1 (555) 382-9014" value={phone} onChange={setPhone} />
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
                <TextInput placeholder="LCSW-9810442" value={licenseNumber} onChange={setLicenseNumber} />
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
            <TextArea
              placeholder="Specializes in CBT and DBT pathways for substance recovery. Primary point of contact for outpatient crisis assessments."
              value={notes}
              onChange={setNotes}
            />
          </FormField>

          {error && <p className="font-['Figtree'] text-[13px] text-red-500">{error}</p>}
        </div>
        <ModalFooter
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmLabel={submitting ? "Adding..." : "Add Counselor"}
          confirmDisabled={submitting}
        />
      </ModalCard>
    </ModalOverlay>
  );
}