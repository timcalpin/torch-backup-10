import { ModalOverlay, ModalCard, ModalHeader, ModalFooter, SectionLabel } from "@/components/common/Modal";
import { FormField, TextInput, SelectInput } from "@/components/common/FormFields";

export function AddUserModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalOverlay onClose={onClose}>
      <ModalCard>
        <ModalHeader title="Add User" onClose={onClose} />
        <div className="flex flex-col gap-[24px]">
          <div className="flex flex-col gap-[16px]">
            <SectionLabel label="Personal Info" />
            <FormField label="Full Name" required><TextInput placeholder="e.g. Marcus Aurelius" /></FormField>
            <div className="flex gap-[16px] flex-wrap">
              <div className="flex-1 min-w-[180px]"><FormField label="Email Address" required><TextInput placeholder="name@email.com" /></FormField></div>
              <div className="flex-1 min-w-[180px]"><FormField label="Phone Number"><TextInput placeholder="+1 (555) 000-0000" /></FormField></div>
            </div>
          </div>
          <div className="flex flex-col gap-[16px]">
            <SectionLabel label="Account" />
            <div className="flex gap-[16px] flex-wrap">
              <div className="flex-1 min-w-[180px]"><FormField label="Role"><SelectInput options={["Patient", "Counselor", "Admin", "Super Admin"]} /></FormField></div>
              <div className="flex-1 min-w-[180px]"><FormField label="Assigned Counselor"><SelectInput options={["Unassigned", "Dr. Chen", "Sarah K.", "Maria L."]} /></FormField></div>
            </div>
            <div className="w-full sm:w-[48%]"><FormField label="Status"><SelectInput options={["Active", "Inactive", "Pending"]} /></FormField></div>
          </div>
          <div className="flex flex-col gap-[16px]">
            <SectionLabel label="Recovery" />
            <div className="flex gap-[16px] flex-wrap">
              <div className="flex-1 min-w-[180px]"><FormField label="Sobriety Date"><TextInput placeholder="MM/DD/YYYY" /></FormField></div>
              <div className="flex-1 min-w-[180px]"><FormField label="Primary Substance"><TextInput placeholder="e.g. Alcohol" /></FormField></div>
            </div>
          </div>
        </div>
        <ModalFooter onCancel={onClose} onConfirm={onClose} confirmLabel="Add User" />
      </ModalCard>
    </ModalOverlay>
  );
}
