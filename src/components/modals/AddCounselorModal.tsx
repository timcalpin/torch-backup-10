import { useState } from "react";
import { ModalOverlay, ModalCard, ModalHeader, ModalFooter } from "@/components/common/Modal";
import { FormField, TextInput } from "@/components/common/FormFields";
import { ApiError } from "@/lib/api";
import { createCounselor } from "@/lib/counselors";
import { useAppContext } from "@/app/app-context";

function deriveInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AddCounselorModal({ onClose }: { onClose: () => void }) {
  const { bumpCounselorsVersion } = useAppContext();
  const [name, setName] = useState("");
  const [initials, setInitials] = useState("");
  const [role, setRole] = useState("Licensed Counselor");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createCounselor({
        name: name.trim(),
        initials: (initials.trim() || deriveInitials(name)).toUpperCase(),
        role: role.trim(),
        avatar_url: avatarUrl.trim(),
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
          <FormField label="Full Name" required>
            <TextInput placeholder="e.g. Dr. Chen" value={name} onChange={setName} />
          </FormField>
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <FormField label="Initials">
                <TextInput placeholder={name ? deriveInitials(name) : "DC"} value={initials} onChange={setInitials} />
              </FormField>
            </div>
            <div className="flex-1 min-w-[180px]">
              <FormField label="Role">
                <TextInput placeholder="e.g. Licensed Counselor" value={role} onChange={setRole} />
              </FormField>
            </div>
          </div>
          <FormField label="Avatar URL">
            <TextInput placeholder="https://..." value={avatarUrl} onChange={setAvatarUrl} />
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
