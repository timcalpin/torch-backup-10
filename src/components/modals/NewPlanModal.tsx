import { ModalOverlay, ModalCard, ModalHeader, ModalFooter } from "@/components/common/Modal";
import { FormField, TextInput, TextArea, SelectInput } from "@/components/common/FormFields";

export function NewPlanModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalOverlay onClose={onClose}>
      <ModalCard>
        <ModalHeader title="New Treatment Plan" onClose={onClose} />
        <div className="flex flex-col gap-[16px]">
          <FormField label="Plan Title" required><TextInput placeholder="e.g. 90-Day Recovery Pathway" /></FormField>
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[180px]"><FormField label="Patient"><SelectInput options={["Select patient", "Marcus A.", "Jordan T.", "Riley S."]} /></FormField></div>
            <div className="flex-1 min-w-[180px]"><FormField label="Counselor"><SelectInput options={["Dr. Chen", "Sarah K.", "Maria L."]} /></FormField></div>
          </div>
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[180px]"><FormField label="Start Date"><TextInput placeholder="MM/DD/YYYY" /></FormField></div>
            <div className="flex-1 min-w-[180px]"><FormField label="Duration"><SelectInput options={["30 days", "60 days", "90 days", "6 months", "1 year"]} /></FormField></div>
          </div>
          <FormField label="Goals & Milestones"><TextArea placeholder="Define recovery goals and measurable milestones..." /></FormField>
          <FormField label="Status"><SelectInput options={["Draft", "Active", "On Hold", "Completed"]} /></FormField>
        </div>
        <ModalFooter onCancel={onClose} onConfirm={onClose} confirmLabel="Create Plan" />
      </ModalCard>
    </ModalOverlay>
  );
}
