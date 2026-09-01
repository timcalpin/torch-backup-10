import { useMemo, useState } from "react";
import { ModalOverlay, ModalCard, ModalHeader, ModalFooter } from "@/components/common/Modal";
import { FormField, TextInput, TextArea, SelectInput } from "@/components/common/FormFields";
import { ApiError } from "@/lib/api";
import { createSupportGroup, updateSupportGroup, type ApiSupportGroup } from "@/lib/supportGroups";
import { useAppContext } from "@/app/app-context";

export const CATEGORY_OPTIONS = ["Recovery", "Wellness", "Spiritual", "Community", "Clinical"];
export const DAY_OPTIONS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const FORMAT_OPTIONS = ["In-Person", "Online"] as const;

function toTitleOption(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("-");
}

function toTimeInputValue(value: string | null) {
  return value ? value.slice(0, 5) : "09:00";
}

function toApiValue(value: string) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

interface CreateGroupModalProps {
  onClose: () => void;
  group?: ApiSupportGroup;
  onSaved?: () => void;
}

export function CreateGroupModal({ onClose, group, onSaved }: CreateGroupModalProps) {
  const { bumpGroupsVersion } = useAppContext();
  const isEditing = Boolean(group);
  const initialCategory = group ? toTitleOption(group.category) : CATEGORY_OPTIONS[0];
  const initialDay = group ? toTitleOption(group.meeting_day) : DAY_OPTIONS[0];
  const initialFormat = group?.format === "online" ? "Online" : "In-Person";
  const categoryOptions = useMemo(
    () => Array.from(new Set([...CATEGORY_OPTIONS, initialCategory])),
    [initialCategory],
  );
  const dayOptions = useMemo(
    () => Array.from(new Set([...DAY_OPTIONS, initialDay])),
    [initialDay],
  );

  const [name, setName] = useState(group?.name ?? "");
  const [category, setCategory] = useState(initialCategory);
  const [description, setDescription] = useState(group?.description ?? "");
  const [meetingDay, setMeetingDay] = useState(initialDay);
  const [meetingTime, setMeetingTime] = useState(toTimeInputValue(group?.meeting_time ?? null));
  const [format, setFormat] = useState<(typeof FORMAT_OPTIONS)[number]>(initialFormat);
  const [maxCapacity, setMaxCapacity] = useState(String(group?.max_capacity ?? 15));
  const [tagsInput, setTagsInput] = useState(group?.tags.join(", ") ?? "");
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
      const payload = {
        name: name.trim(),
        description: description.trim(),
        category: toApiValue(category),
        meeting_day: toApiValue(meetingDay),
        meeting_time: `${meetingTime}:00`,
        format: format === "Online" ? "online" : "in_person",
        max_capacity: capacity,
        tags: tagsInput.split(",").map((tag) => tag.trim()).filter(Boolean),
      };
      if (group) {
        await updateSupportGroup(group.id, payload);
      } else {
        await createSupportGroup(payload);
      }
      onSaved?.();
      bumpGroupsVersion();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `Unable to ${isEditing ? "save changes" : "create group"}. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalCard>
        <ModalHeader title={isEditing ? "Edit Group" : "Create Group"} onClose={onClose} />
        <div className="flex flex-col gap-[16px]">
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <FormField label="Group Name" required>
                <TextInput placeholder="e.g. Wednesday Morning Recovery" value={name} onChange={setName} />
              </FormField>
            </div>
            <div className="w-full sm:w-[220px]">
              <FormField label="Category">
                <SelectInput options={categoryOptions} value={category} onChange={setCategory} />
              </FormField>
            </div>
          </div>
          <FormField label="Description">
            <TextArea placeholder="Describe the purpose and goals of this group..." value={description} onChange={setDescription} />
          </FormField>
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[160px]">
              <FormField label="Meeting Day">
                <SelectInput options={dayOptions} value={meetingDay} onChange={setMeetingDay} />
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
                  {FORMAT_OPTIONS.map((f) => (
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
          confirmLabel={submitting ? (isEditing ? "Saving..." : "Creating...") : (isEditing ? "Save Changes" : "Create Group")}
          confirmDisabled={submitting}
        />
      </ModalCard>
    </ModalOverlay>
  );
}
