import { useState,useEffect } from "react";
import { ModalOverlay, ModalCard, ModalHeader, ModalFooter, SectionLabel } from "@/components/common/Modal";
import { FormField, TextInput, SelectInput } from "@/components/common/FormFields";
import { ApiError } from "@/lib/api";
import { createUser } from "@/lib/users";
import { useAppContext } from "@/app/app-context";

const ROLE_OPTIONS = ["Patient", "Counselor", "Admin", "Super Admin"];
const STATUS_OPTIONS = ["Active", "Inactive"];

export function AddUserModal({ onClose }: { onClose: () => void }) {
  const { bumpUsersVersion } = useAppContext();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(ROLE_OPTIONS[0]);
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [sobrietyDate, setSobrietyDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!fullName.trim() || !email.trim()) {
      setError("Full name and email are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const response = await createUser({
      email: email.trim(),
      full_name: fullName.trim(),
      is_active: status === "Active",
      sobriety_start_date: sobrietyDate || null,
      role,
        });

      console.log(response);

      setTemporaryPassword(response.temporary_password);

      bumpUsersVersion();

      setShowSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to add user. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(
        temporaryPassword
    );

    setCopied(true);

    setTimeout(() => {
        setCopied(false);
    }, 2000);
  };
return (
  <>
    {!showSuccess && (
      <ModalOverlay onClose={onClose}>
        <ModalCard>
          <ModalHeader title="Add User" onClose={onClose} />

          <div className="flex flex-col gap-[24px]">

            <div className="flex flex-col gap-[16px]">
              <SectionLabel label="Personal Info" />

              <FormField label="Full Name" required>
                <TextInput
                  placeholder="e.g. Marcus Aurelius"
                  value={fullName}
                  onChange={setFullName}
                />
              </FormField>

              <FormField label="Email Address" required>
                <TextInput
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={setEmail}
                />
              </FormField>
            </div>

            <div className="flex flex-col gap-[16px]">
              <SectionLabel label="Account" />

              <div className="flex gap-[16px] flex-wrap">

                <div className="flex-1 min-w-[180px]">
                  <FormField label="Role">
                    <SelectInput
                      options={ROLE_OPTIONS}
                      value={role}
                      onChange={setRole}
                    />
                  </FormField>
                </div>

                <div className="flex-1 min-w-[180px]">
                  <FormField label="Status">
                    <SelectInput
                      options={STATUS_OPTIONS}
                      value={status}
                      onChange={setStatus}
                    />
                  </FormField>
                </div>

              </div>
            </div>

            <div className="flex flex-col gap-[16px]">
              <SectionLabel label="Recovery" />

              <FormField label="Sobriety Start Date">
                <TextInput
                  type="date"
                  value={sobrietyDate}
                  onChange={setSobrietyDate}
                />
              </FormField>
            </div>

            {error && (
              <p className="text-red-500 text-sm">
                {error}
              </p>
            )}

          </div>

          <ModalFooter
            onCancel={onClose}
            onConfirm={handleSubmit}
            confirmLabel={
              submitting
                ? "Adding..."
                : "Add User"
            }
            confirmDisabled={submitting}
          />
        </ModalCard>
      </ModalOverlay>
    )}

    {showSuccess && (
      <ModalOverlay
        onClose={() => {
          setShowSuccess(false);
          onClose();
        }}
      >
        <ModalCard>

          <ModalHeader
            title="User Created Successfully"
            onClose={() => {
              setShowSuccess(false);
              onClose();
            }}
          />

          <div className="flex flex-col gap-6">

            <div>
              <p className="text-sm font-medium mb-2">
                Temporary Password
              </p>

              <div className="flex gap-2">

                <TextInput
                  value={temporaryPassword}
                  onChange={() => {}}
                  className="flex-1 rounded-lg border px-3 py-2 bg-gray-100"
                />

                <button
                  onClick={handleCopy}
                  className="rounded-lg bg-blue-600 text-white px-4"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>

              </div>

              <p className="text-xs text-gray-500 mt-3">
                Share this temporary password securely with the patient.
                They will be required to change it during their first login.
              </p>

            </div>

          </div>

          <ModalFooter
            onCancel={() => {
              setShowSuccess(false);
              onClose();
            }}
            onConfirm={() => {
              setShowSuccess(false);
              onClose();
            }}
            confirmLabel="Done"
          />

        </ModalCard>
      </ModalOverlay>
    )}
  </>
);
}
