import { useState } from "react";
import { ModalOverlay, ModalCard, ModalHeader, ModalFooter, SectionLabel } from "@/components/common/Modal";
import { FormField, TextInput, TextArea, SelectInput } from "@/components/common/FormFields";
import { Toggle } from "@/components/common/Toggle";
import { ApiError } from "@/lib/api";
import {
  RECOVERY_CATEGORIES,
  WELLNESS_CATEGORIES,
  DELIVERY_FORMATS,
  DAYS_OF_WEEK,
  createResource,
  type DayOfWeek,
} from "@/lib/resources";
import { useAppContext } from "@/app/app-context";

const RECOVERY_CATEGORY_LABELS: Record<(typeof RECOVERY_CATEGORIES)[number], string> = {
  aa: "AA Meetings",
  na: "NA Meetings",
  smart: "SMART Recovery",
  celebrate_recovery: "Celebrate Recovery",
  recovery_dharma: "Recovery Dharma",
};

const WELLNESS_CATEGORY_LABELS: Record<(typeof WELLNESS_CATEGORIES)[number], string> = {
  therapy: "Therapy",
  yoga: "Yoga",
  fitness: "Gym & Fitness",
  volunteering: "Volunteering",
  massage_bodywork: "Massage & Bodywork",
  art_creative: "Art & Creative",
  parks_nature: "Parks & Nature",
  animal_therapy: "Animal Therapy",
  job_placement: "Job Placement",
  county_benefits: "County Benefits",
  legal_aid: "Legal Aid",
  crisis_support: "Crisis & Immediate Support",
  other: "Other",
};

const DELIVERY_FORMAT_LABELS: Record<(typeof DELIVERY_FORMATS)[number], string> = {
  in_person: "In Person",
  online: "Online",
  hybrid: "Hybrid",
  phone: "Phone",
};

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export function AddResourceModal({ onClose }: { onClose: () => void }) {
  const { bumpResourcesVersion } = useAppContext();
  const [tab, setTab] = useState<"Recovery Meeting" | "Wellness & Support">("Recovery Meeting");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [organization, setOrganization] = useState("");
  const [url, setUrl] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [featured, setFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recovery Meeting only
  const [recoveryCategory, setRecoveryCategory] = useState<(typeof RECOVERY_CATEGORIES)[number]>("aa");
  const [day, setDay] = useState<DayOfWeek>("monday");
  const [startTime, setStartTime] = useState("");
  const [deliveryFormat, setDeliveryFormat] = useState<(typeof DELIVERY_FORMATS)[number]>("in_person");

  // Wellness & Support only
  const [wellnessCategory, setWellnessCategory] = useState<(typeof WELLNESS_CATEGORIES)[number]>("therapy");

  const isRecovery = tab === "Recovery Meeting";

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (isRecovery && !startTime) {
      setError("Start time is required for a Recovery Meeting.");
      return;
    }
    if (isRecovery && (deliveryFormat === "online" || deliveryFormat === "hybrid") && !url.trim()) {
      setError("An online or hybrid meeting requires a URL.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    try {
      if (isRecovery) {
        await createResource({
          resource_type: "recovery_meeting",
          title: title.trim(),
          category: recoveryCategory,
          description: description.trim(),
          organization: organization.trim(),
          url: url.trim(),
          phone: "",
          venue: venue.trim(),
          street_address: "",
          city: city.trim(),
          state: "",
          zip_code: "",
          day,
          start_time: startTime,
          end_time: null,
          delivery_format: deliveryFormat,
          tags,
          is_featured: featured,
          status: "published",
        });
      } else {
        await createResource({
          resource_type: "wellness_support",
          title: title.trim(),
          category: wellnessCategory,
          description: description.trim(),
          organization: organization.trim(),
          url: url.trim(),
          phone: "",
          venue: venue.trim(),
          street_address: "",
          city: city.trim(),
          state: "",
          zip_code: "",
          tags,
          is_featured: featured,
          status: "published",
        });
      }
      bumpResourcesVersion();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to add resource. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalCard wide>
        <ModalHeader title="Add Resource" onClose={onClose} />
        <div className="relative border-b border-[var(--app-border)] mb-[24px]">
          <div className="flex">
            {(["Recovery Meeting", "Wellness & Support"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-[20px] py-[12px] font-['Figtree'] text-[14px] cursor-pointer transition-colors relative ${
                  tab === t ? "font-semibold text-[#f37422]" : "font-medium text-[var(--app-muted)] hover:text-[var(--app-text)]"
                }`}
              >
                {t}
                {tab === t && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#f37422]" />}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-[16px]">
          <SectionLabel label="Basic Info" />
          <FormField label="Title" required><TextInput placeholder="e.g. Tuesday Night AA Meeting" value={title} onChange={setTitle} /></FormField>
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <FormField label="Category">
                {isRecovery ? (
                  <SelectInput
                    options={RECOVERY_CATEGORIES.map((c) => RECOVERY_CATEGORY_LABELS[c])}
                    value={RECOVERY_CATEGORY_LABELS[recoveryCategory]}
                    onChange={(label) => setRecoveryCategory(RECOVERY_CATEGORIES.find((c) => RECOVERY_CATEGORY_LABELS[c] === label) ?? "aa")}
                  />
                ) : (
                  <SelectInput
                    options={WELLNESS_CATEGORIES.map((c) => WELLNESS_CATEGORY_LABELS[c])}
                    value={WELLNESS_CATEGORY_LABELS[wellnessCategory]}
                    onChange={(label) => setWellnessCategory(WELLNESS_CATEGORIES.find((c) => WELLNESS_CATEGORY_LABELS[c] === label) ?? "therapy")}
                  />
                )}
              </FormField>
            </div>
            <div className="flex-1 min-w-[180px]">
              <FormField label="Organization"><TextInput placeholder="e.g. Alcoholics Anonymous" value={organization} onChange={setOrganization} /></FormField>
            </div>
          </div>
          <FormField label="Description (Optional)"><TextArea placeholder="Brief summary..." rows={3} value={description} onChange={setDescription} /></FormField>

          <SectionLabel label="Location & Contact" />
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <FormField label="Venue"><TextInput placeholder="e.g. Community Center" value={venue} onChange={setVenue} /></FormField>
            </div>
            <div className="flex-1 min-w-[180px]">
              <FormField label="City"><TextInput value={city} onChange={setCity} /></FormField>
            </div>
          </div>
          <FormField label={isRecovery ? "URL (required for online/hybrid)" : "URL"}>
            <TextInput placeholder="https://..." value={url} onChange={setUrl} />
          </FormField>

          {isRecovery && (
            <>
              <SectionLabel label="Meeting Schedule" />
              <div className="flex gap-[16px] flex-wrap">
                <div className="flex-1 min-w-[160px]">
                  <FormField label="Day" required>
                    <SelectInput
                      options={DAYS_OF_WEEK.map((d) => DAY_LABELS[d])}
                      value={DAY_LABELS[day]}
                      onChange={(label) => setDay(DAYS_OF_WEEK.find((d) => DAY_LABELS[d] === label) ?? "monday")}
                    />
                  </FormField>
                </div>
                <div className="flex-1 min-w-[160px]">
                  <FormField label="Start Time" required>
                    <TextInput type="time" value={startTime} onChange={setStartTime} />
                  </FormField>
                </div>
                <div className="flex-1 min-w-[160px]">
                  <FormField label="Format" required>
                    <SelectInput
                      options={DELIVERY_FORMATS.map((f) => DELIVERY_FORMAT_LABELS[f])}
                      value={DELIVERY_FORMAT_LABELS[deliveryFormat]}
                      onChange={(label) => setDeliveryFormat(DELIVERY_FORMATS.find((f) => DELIVERY_FORMAT_LABELS[f] === label) ?? "in_person")}
                    />
                  </FormField>
                </div>
              </div>
            </>
          )}

          <SectionLabel label="Details" />
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <FormField label="Tags (comma separated)"><TextInput placeholder="e.g. free, 24/7, national" value={tagsInput} onChange={setTagsInput} /></FormField>
            </div>
            <div className="flex-1 min-w-[180px]">
              <FormField label="Featured Status">
                <div className="relative bg-[var(--app-surface)] h-[44px] rounded-[10px]">
                  <div className="absolute inset-0 rounded-[10px] border border-[var(--app-border)] pointer-events-none" />
                  <button type="button" onClick={() => setFeatured((v) => !v)} className="flex items-center justify-between px-[14px] h-full w-full cursor-pointer">
                    <span className="font-['Figtree'] font-normal text-[var(--app-text)] text-[14px]">Feature this</span>
                    <Toggle on={featured} />
                  </button>
                </div>
              </FormField>
            </div>
          </div>
          {error && <p className="font-['Figtree'] text-[13px] text-red-500">{error}</p>}
        </div>
        <ModalFooter
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmLabel={submitting ? "Adding..." : "Add Resource"}
          confirmDisabled={submitting}
        />
      </ModalCard>
    </ModalOverlay>
  );
}
