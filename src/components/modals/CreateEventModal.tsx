import { useState } from "react";
import { ModalOverlay, ModalCard, ModalHeader, ModalFooter } from "@/components/common/Modal";
import { FormField, TextInput, TextArea, SelectInput } from "@/components/common/FormFields";
import { ApiError } from "@/lib/api";
import { EVENT_STATUSES, EVENT_TYPES, createEvent, type EventStatus, type EventType } from "@/lib/events";
import { useAppContext } from "@/app/app-context";

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  recovery: "Recovery",
  wellness: "Wellness",
  community: "Community",
};

const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  scheduled: "Scheduled",
  active: "Active",
  pending: "Pending",
  cancelled: "Cancelled",
};

export function CreateEventModal({ onClose }: { onClose: () => void }) {
  const { bumpEventsVersion } = useAppContext();

  const [name, setName] = useState("");
  const [eventType, setEventType] = useState<EventType>("recovery");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [status, setStatus] = useState<EventStatus>("scheduled");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim() || !date) {
      setError("Event name and date are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const startDatetime = new Date(`${date}T${time || "00:00"}`).toISOString();
      await createEvent({
        title: name.trim(),
        description: description.trim(),
        event_type: eventType,
        start_datetime: startDatetime,
        location: location.trim(),
        max_attendees: maxAttendees ? Number(maxAttendees) : null,
        status,
      });
      bumpEventsVersion();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to create event. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalCard>
        <ModalHeader title="Create Event" onClose={onClose} />
        <div className="flex flex-col gap-[16px]">
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <FormField label="Event Name" required>
                <TextInput placeholder="e.g. Tuesday Night Recovery Meeting" value={name} onChange={setName} />
              </FormField>
            </div>
            <div className="w-full sm:w-[180px]">
              <FormField label="Type">
                <SelectInput
                  options={EVENT_TYPES.map((t) => EVENT_TYPE_LABELS[t])}
                  value={EVENT_TYPE_LABELS[eventType]}
                  onChange={(label) => setEventType(EVENT_TYPES.find((t) => EVENT_TYPE_LABELS[t] === label) ?? "recovery")}
                />
              </FormField>
            </div>
          </div>
          <FormField label="Description">
            <TextArea placeholder="Describe what this event entails..." value={description} onChange={setDescription} />
          </FormField>
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[160px]">
              <FormField label="Date" required><TextInput type="date" value={date} onChange={setDate} /></FormField>
            </div>
            <div className="flex-1 min-w-[160px]">
              <FormField label="Time"><TextInput type="time" value={time} onChange={setTime} /></FormField>
            </div>
          </div>
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[160px]">
              <FormField label="Location"><TextInput placeholder="e.g. Community Center Room 2" value={location} onChange={setLocation} /></FormField>
            </div>
            <div className="flex-1 min-w-[160px]">
              <FormField label="Max Attendees"><TextInput type="number" placeholder="25" value={maxAttendees} onChange={setMaxAttendees} /></FormField>
            </div>
          </div>
          <FormField label="Status">
            <SelectInput
              options={EVENT_STATUSES.map((s) => EVENT_STATUS_LABELS[s])}
              value={EVENT_STATUS_LABELS[status]}
              onChange={(label) => setStatus(EVENT_STATUSES.find((s) => EVENT_STATUS_LABELS[s] === label) ?? "scheduled")}
            />
          </FormField>
          {error && <p className="font-['Figtree'] text-[13px] text-red-500">{error}</p>}
        </div>
        <ModalFooter
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmLabel={submitting ? "Creating..." : "Create Event"}
          confirmDisabled={submitting}
        />
      </ModalCard>
    </ModalOverlay>
  );
}
