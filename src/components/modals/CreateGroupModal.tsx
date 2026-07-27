import { useState } from "react";
import { ModalOverlay, ModalCard, ModalHeader, ModalFooter } from "@/components/common/Modal";
import { FormField, TextInput, TextArea, SelectInput } from "@/components/common/FormFields";
import { ApiError } from "@/lib/api";
import { createSupportGroup } from "@/lib/supportGroups";
import { useAppContext } from "@/app/app-context";

const CATEGORY_OPTIONS = ["Recovery", "Wellness", "Spiritual", "Community", "Clinical"];
const DAY_OPTIONS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function CreateGroupModal({ onClose }: { onClose: () => void }) {
  const { bumpGroupsVersion } = useAppContext();
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [description, setDescription] = useState("");
  const [meetingDay, setMeetingDay] = useState(DAY_OPTIONS[0]);
  const [meetingTime, setMeetingTime] = useState("09:00");
  const [format, setFormat] = useState<"In-Person" | "Online">("In-Person");
  const [maxCapacity, setMaxCapacity] = useState("15");
  const [tagsInput, setTagsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const capacity = Number(maxCapacity);
    if (!name.trim()) {
      setError("Group name is required.");
      return;
    }
    if (!Number.isInteger(capacity) || capacity <= 0) {
      setError("Max capacity must be a positive whole number.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createSupportGroup({
        name: name.trim(),
        description: description.trim(),
        category: category.toLowerCase(),
        meeting_day: meetingDay.toLowerCase(),
        meeting_time: `${meetingTime}:00`,
        format: format === "Online" ? "online" : "in_person",
        max_capacity: capacity,
        tags: tagsInput.split(",").map((tag) => tag.trim()).filter(Boolean),
      });
      bumpGroupsVersion();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to create group. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalCard>
        <ModalHeader title="Create Group" onClose={onClose} />
        <div className="flex flex-col gap-[16px]">
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <FormField label="Group Name" required>
                <TextInput placeholder="e.g. Wednesday Morning Recovery" value={name} onChange={setName} />
              </FormField>
            </div>
            <div className="w-full sm:w-[220px]">
              <FormField label="Category">
                <SelectInput options={CATEGORY_OPTIONS} value={category} onChange={setCategory} />
              </FormField>
            </div>
          </div>
          <FormField label="Description">
            <TextArea placeholder="Describe the purpose and goals of this group..." value={description} onChange={setDescription} />
          </FormField>
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[160px]">
              <FormField label="Meeting Day">
                <SelectInput options={DAY_OPTIONS} value={meetingDay} onChange={setMeetingDay} />
              </FormField>
            </div>
            <div className="flex-1 min-w-[160px]">
              <FormField label="Meeting Time">
                <TextInput type="time" value={meetingTime} onChange={setMeetingTime} />
              </FormField>
            </div>
          </div>
          <div className="flex gap-[16px] flex-wrap">
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
            <div className="flex-1 min-w-[160px]">
              <FormField label="Max Capacity" required>
                <TextInput type="number" placeholder="15" value={maxCapacity} onChange={setMaxCapacity} />
              </FormField>
            </div>
          </div>
          <FormField label="Tags">
            <TextInput placeholder="recovery, morning" value={tagsInput} onChange={setTagsInput} />
          </FormField>
          {error && <p className="font-['Figtree'] text-[13px] text-red-500">{error}</p>}
        </div>
        <ModalFooter
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmLabel={submitting ? "Creating..." : "Create Group"}
          confirmDisabled={submitting}
        />
      </ModalCard>
    </ModalOverlay>
  );
}
