import { useState } from "react";
import { ModalOverlay, ModalCard, ModalHeader, ModalFooter, SectionLabel } from "@/components/common/Modal";
import { FormField, TextInput, SelectInput } from "@/components/common/FormFields";
import { ApiError } from "@/lib/api";
import { createUser } from "@/lib/users";
import { useAppContext } from "@/app/app-context";

const ROLE_OPTIONS = ["Patient", "Counselor", "Admin", "Super Admin"];
const COUNSELOR_OPTIONS = ["Unassigned", "Dr. Chen", "Dr. Smith", "Dr. Adams"];
const STATUS_OPTIONS = ["Active", "Inactive"];

export function AddUserModal({ onClose }: { onClose: () => void }) {
  const { bumpUsersVersion } = useAppContext();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState(ROLE_OPTIONS[0]);
  const [counselor, setCounselor] = useState(COUNSELOR_OPTIONS[1]);
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [sobrietyDate, setSobrietyDate] = useState("");
  const [primarySubstance, setPrimarySubstance] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!fullName.trim() || !email.trim()) {
      setError("Full name and email are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createUser({
        email: email.trim(),
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        role,
        counselor: counselor === "Unassigned" ? null : counselor,
        is_active: status === "Active",
        sobriety_start_date: sobrietyDate || null,
        primary_substance: primarySubstance.trim() || null,
      });
      bumpUsersVersion();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to add user. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalCard className="max-w-[560px] w-full">
        <ModalHeader title="Add User" onClose={onClose} />
        <div className="flex flex-col gap-[20px] max-h-[70vh] overflow-y-auto pr-1">
          {/* Personal Info */}
          <div className="flex flex-col gap-[12px]">
            <SectionLabel label="Personal Info" />
            <FormField label="Full Name" required>
              <TextInput placeholder="e.g. Marcus Aurelius" value={fullName} onChange={setFullName} />
            </FormField>
            <div className="flex gap-[16px] flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <FormField label="Email Address" required>
                  <TextInput type="email" placeholder="name@email.com" value={email} onChange={setEmail} />
                </FormField>
              </div>
              <div className="flex-1 min-w-[180px]">
                <FormField label="Phone Number">
                  <TextInput placeholder="+1 (555) 000-0000" value={phone} onChange={setPhone} />
                </FormField>
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="flex flex-col gap-[12px]">
            <SectionLabel label="Account" />
            <div className="flex gap-[16px] flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <FormField label="Role">
                  <SelectInput options={ROLE_OPTIONS} value={role} onChange={setRole} />
                </FormField>
              </div>
              <div className="flex-1 min-w-[180px]">
                <FormField label="Assigned Counselor">
                  <SelectInput options={COUNSELOR_OPTIONS} value={counselor} onChange={setCounselor} />
                </FormField>
              </div>
            </div>
            <div className="flex gap-[16px] flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <FormField label="Status">
                  <SelectInput options={STATUS_OPTIONS} value={status} onChange={setStatus} />
                </FormField>
              </div>
            </div>
          </div>

          {/* Recovery */}
          <div className="flex flex-col gap-[12px]">
            <SectionLabel label="Recovery" />
            <div className="flex gap-[16px] flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <FormField label="Sobriety Date">
                  <TextInput type="date" value={sobrietyDate} onChange={setSobrietyDate} />
                </FormField>
              </div>
              <div className="flex-1 min-w-[180px]">
                <FormField label="Primary Substance">
                  <TextInput placeholder="e.g. Alcohol" value={primarySubstance} onChange={setPrimarySubstance} />
                </FormField>
              </div>
            </div>
          </div>

          {error && <p className="font-['Figtree'] text-[13px] text-red-500">{error}</p>}
        </div>
        <ModalFooter
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmLabel={submitting ? "Adding..." : "Add User"}
          confirmDisabled={submitting}
        />
      </ModalCard>
    </ModalOverlay>
  );
}