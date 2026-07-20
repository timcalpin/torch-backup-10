import { ModalOverlay, ModalCard, ModalHeader, ModalFooter } from "@/components/common/Modal";
import { FormField, TextInput, TextArea, SelectInput } from "@/components/common/FormFields";

export function CreateEventModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalOverlay onClose={onClose}>
      <ModalCard>
        <ModalHeader title="Create Event" onClose={onClose} />
        <div className="flex flex-col gap-[16px]">
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[200px]"><FormField label="Event Name" required><TextInput placeholder="e.g. Tuesday Night Recovery Meeting" /></FormField></div>
            <div className="w-full sm:w-[180px]"><FormField label="Type"><SelectInput options={["Recovery", "Wellness", "Community", "Clinical", "Family"]} /></FormField></div>
          </div>
          <FormField label="Description"><TextArea placeholder="Describe what this event entails..." /></FormField>
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[160px]"><FormField label="Date" required><TextInput placeholder="MM/DD/YYYY" /></FormField></div>
            <div className="flex-1 min-w-[160px]"><FormField label="Time"><TextInput placeholder="07:00 PM" /></FormField></div>
          </div>
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[160px]"><FormField label="Location"><TextInput placeholder="e.g. Community Center Room 2" /></FormField></div>
            <div className="flex-1 min-w-[160px]"><FormField label="Organizer"><SelectInput options={["Unassigned", "James T.", "Dr. Chen", "Sarah K."]} /></FormField></div>
          </div>
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[160px]"><FormField label="Max Attendees"><TextInput placeholder="25" /></FormField></div>
            <div className="flex-1 min-w-[160px]"><FormField label="Status"><SelectInput options={["Scheduled", "Active", "Completed", "Cancelled"]} /></FormField></div>
          </div>
        </div>
        <ModalFooter onCancel={onClose} onConfirm={onClose} confirmLabel="Create Event" />
      </ModalCard>
    </ModalOverlay>
  );
}
