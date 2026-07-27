import { useState } from "react";
import { ModalOverlay, ModalCard, ModalHeader, ModalFooter, SectionLabel } from "@/components/common/Modal";
import { FormField, TextInput, SelectInput } from "@/components/common/FormFields";
import { ApiError } from "@/lib/api";
import { createUser } from "@/lib/users";
import { useAppContext } from "@/app/app-context";

const ROLE_OPTIONS = ["Patient", "Counselor", "Admin", "Super Admin"];
const STATUS_OPTIONS = ["Active", "Inactive"];

export function AddUserModal({ onClose }: { onClose: () => void }) {
  const { bumpUsersVersion } = useAppContext();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(ROLE_OPTIONS[0]);
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [sobrietyDate, setSobrietyDate] = useState("");
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
        is_active: status === "Active",
        sobriety_start_date: sobrietyDate || null,
        role,
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
      <ModalCard>
        <ModalHeader title="Add User" onClose={onClose} />
        <div className="flex flex-col gap-[24px]">
          <div className="flex flex-col gap-[16px]">
            <SectionLabel label="Personal Info" />
            <FormField label="Full Name" required>
              <TextInput placeholder="e.g. Marcus Aurelius" value={fullName} onChange={setFullName} />
            </FormField>
            <FormField label="Email Address" required>
              <TextInput type="email" placeholder="name@email.com" value={email} onChange={setEmail} />
            </FormField>
          </div>
          <div className="flex flex-col gap-[16px]">
            <SectionLabel label="Account" />
            <div className="flex gap-[16px] flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <FormField label="Role">
                  <SelectInput options={ROLE_OPTIONS} value={role} onChange={setRole} />
                </FormField>
              </div>
              <div className="flex-1 min-w-[180px]">
                <FormField label="Status">
                  <SelectInput options={STATUS_OPTIONS} value={status} onChange={setStatus} />
                </FormField>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-[16px]">
            <SectionLabel label="Recovery" />
            <FormField label="Sobriety Start Date">
              <TextInput type="date" value={sobrietyDate} onChange={setSobrietyDate} />
            </FormField>
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
