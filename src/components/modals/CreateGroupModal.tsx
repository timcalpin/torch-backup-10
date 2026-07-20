import { useState } from "react";
import { ModalOverlay, ModalCard, ModalHeader, ModalFooter } from "@/components/common/Modal";
import { FormField, TextInput, TextArea, SelectInput } from "@/components/common/FormFields";

export function CreateGroupModal({ onClose }: { onClose: () => void }) {
  const [format, setFormat] = useState<"In-Person" | "Online">("In-Person");
  return (
    <ModalOverlay onClose={onClose}>
      <ModalCard>
        <ModalHeader title="Create Group" onClose={onClose} />
        <div className="flex flex-col gap-[16px]">
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[200px]"><FormField label="Group Name"><TextInput placeholder="e.g. Wednesday Morning Recovery" /></FormField></div>
            <div className="w-full sm:w-[220px]"><FormField label="Category"><SelectInput options={["Recovery", "Wellness", "Spiritual", "Community", "Clinical"]} /></FormField></div>
          </div>
          <FormField label="Description"><TextArea placeholder="Describe the purpose and goals of this group..." /></FormField>
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[160px]"><FormField label="Moderator"><SelectInput options={["Unassigned", "Dr. Chen", "Sarah K.", "Maria L.", "James T."]} /></FormField></div>
            <div className="flex-1 min-w-[160px]"><FormField label="Meeting Day"><SelectInput options={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]} /></FormField></div>
          </div>
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[160px]"><FormField label="Meeting Time"><TextInput placeholder="09:00 AM" /></FormField></div>
            <div className="flex-1 min-w-[160px]">
              <FormField label="Format">
                <div className="flex items-center gap-[12px] py-[12px]">
                  {(["In-Person", "Online"] as const).map((f) => (
                    <button key={f} onClick={() => setFormat(f)} className="flex items-center gap-[8px] cursor-pointer">
                      <div className="w-[16px] h-[16px] rounded-full flex items-center justify-center" style={{ border: `2px solid ${format === f ? "#f37422" : "rgba(244,237,227,0.2)"}`, background: format === f ? "#f37422" : "transparent" }}>
                        {format === f && <div className="w-[6px] h-[6px] rounded-full bg-white" />}
                      </div>
                      <span className={`font-['Figtree'] text-[14px] ${format === f ? "text-[var(--app-text)]" : "text-[var(--app-muted)]"}`}>{f}</span>
                    </button>
                  ))}
                </div>
              </FormField>
            </div>
          </div>
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[160px]"><FormField label="Max Capacity"><TextInput placeholder="15" /></FormField></div>
            <div className="flex-1 min-w-[160px]"><FormField label="Tags"><TextInput placeholder="Add tag..." /></FormField></div>
          </div>
        </div>
        <ModalFooter onCancel={onClose} onConfirm={onClose} confirmLabel="Create Group" />
      </ModalCard>
    </ModalOverlay>
  );
}
