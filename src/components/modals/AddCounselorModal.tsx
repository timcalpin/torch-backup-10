import { ModalOverlay, ModalCard, ModalHeader, ModalFooter } from "@/components/common/Modal";
import { FormField, TextInput, TextArea, SelectInput } from "@/components/common/FormFields";

export function AddCounselorModal({ onClose }: { onClose: () => void }) {
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
            <div className="flex-1 min-w-[180px]"><FormField label="First Name"><TextInput placeholder="First name" /></FormField></div>
            <div className="flex-1 min-w-[180px]"><FormField label="Last Name"><TextInput placeholder="Last name" /></FormField></div>
          </div>
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[180px]"><FormField label="Email"><TextInput placeholder="name@torchrecovery.com" /></FormField></div>
            <div className="flex-1 min-w-[180px]"><FormField label="Phone"><TextInput placeholder="+1 (555) 000-0000" /></FormField></div>
          </div>
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[180px]"><FormField label="Specialization"><SelectInput options={["Addiction, Trauma", "CBT / DBT", "Family Therapy", "Grief Counseling"]} /></FormField></div>
            <div className="flex-1 min-w-[180px]"><FormField label="License Number"><TextInput placeholder="e.g. LCSW-9810442" /></FormField></div>
          </div>
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[180px]"><FormField label="Status"><SelectInput options={["Active", "Inactive", "Pending License"]} /></FormField></div>
            <div className="flex-1 min-w-[180px]" />
          </div>
          <FormField label="Notes / Credentials"><TextArea placeholder="Specializations, credentials, or notes..." rows={3} /></FormField>
        </div>
        <ModalFooter onCancel={onClose} onConfirm={onClose} confirmLabel="Add Counselor" />
      </ModalCard>
    </ModalOverlay>
  );
}
