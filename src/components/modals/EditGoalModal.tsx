import { useState } from "react";
import { ModalOverlay, ModalCard, ModalHeader, ModalFooter } from "@/components/common/Modal";
import { FormField, TextInput } from "@/components/common/FormFields";
import { ApiError } from "@/lib/api";

interface EditGoalModalProps {
  pillarName: "Body" | "Mind" | "Spirit" | "Life";
  initialObjective: string;
  onClose: () => void;
  onSave: (newObjective: string) => Promise<void>;
}

export function EditGoalModal({
  pillarName,
  initialObjective,
  onClose,
  onSave,
}: EditGoalModalProps) {
  const [objective, setObjective] = useState(initialObjective);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!objective.trim()) {
      setError("Goal objective cannot be empty.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSave(objective.trim());
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update goal.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalCard>
        <ModalHeader title={`Edit ${pillarName} Goal`} onClose={onClose} />
        
        <div className="flex flex-col gap-[16px] py-[8px]">
          <FormField label="Goal Objective" required>
            <TextInput
              value={objective}
              onChange={setObjective}
              placeholder={`Enter ${pillarName.toLowerCase()} goal objective...`}
            />
          </FormField>

          {error && (
            <p className="font-['Figtree'] text-[13px] text-red-500">{error}</p>
          )}
        </div>

        <ModalFooter
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmLabel={submitting ? "Saving..." : "Save Goal"}
          confirmDisabled={submitting}
        />
      </ModalCard>
    </ModalOverlay>
  );
}