import { useEffect, useMemo, useState } from "react";

import {
  ModalOverlay,
  ModalCard,
  ModalHeader,
  ModalFooter,
} from "@/components/common/Modal";

import {
  FormField,
  TextInput,
  TextArea,
  SelectInput,
} from "@/components/common/FormFields";

import { ApiError } from "@/lib/api";
import { FileDropzone } from "@/components/common/FileDropzone";
import {
  createResource,
  updateResource,
  type CreateResourcePayload,
  type DeliveryFormat,
  type ResourceCategory,
  type ResourceStatus,
} from "@/lib/resources";

import { useAppContext } from "@/app/app-context";
import { ApiResource } from "../../lib/resources";

/* ============================================================================
   CATEGORY TAXONOMY
============================================================================ */

const CATEGORY_OPTIONS: {
  value: ResourceCategory;
  label: string;
  subCategories: {
    value: string;
    label: string;
  }[];
}[] = [
  {
    value: "recovery_meetings",
    label: "Recovery Meetings",
    subCategories: [
      {
        value: "aa",
        label: "AA",
      },
      {
        value: "na",
        label: "NA",
      },
      {
        value: "smart",
        label: "SMART",
      },
      {
        value: "recovery_dharma",
        label: "Recovery Dharma",
      },
      {
        value: "celebrate_recovery",
        label: "Celebrate Recovery",
      },
    ],
  },

  {
    value: "mental_health",
    label: "Mental Health",
    subCategories: [
      {
        value: "therapy",
        label: "Therapy",
      },
      {
        value: "emdr",
        label: "EMDR",
      },
      {
        value: "ocd",
        label: "OCD",
      },
      {
        value: "trauma_ptsd",
        label: "Trauma + PTSD",
      },
      {
        value: "couples_therapy",
        label: "Couples Therapy",
      },
      {
        value: "anxiety",
        label: "Anxiety",
      },
      {
        value: "depression",
        label: "Depression",
      },
    ],
  },

  {
    value: "physical_health",
    label: "Physical Health",
    subCategories: [
      {
        value: "yoga",
        label: "Yoga",
      },
      {
        value: "gym",
        label: "Gym",
      },
      {
        value: "doctors",
        label: "Doctors",
      },
      {
        value: "mat",
        label: "M.A.T. (Medically Assisted Treatment)",
      },
    ],
  },

  {
    value: "additional_support",
    label: "Additional Support",
    subCategories: [
      {
        value: "job_training",
        label: "Job Training",
      },
      {
        value: "education",
        label: "Education",
      },
      {
        value: "treatment",
        label: "Treatment",
      },
      {
        value: "state_county_benefits",
        label: "State + County Benefits",
      },
      {
        value: "legal_aid",
        label: "Legal Aid",
      },
      {
        value: "crisis_support",
        label: "Crisis Support",
      },
    ],
  },

  {
    value: "recreation",
    label: "Recreation",
    subCategories: [
      {
        value: "art",
        label: "Art",
      },
      {
        value: "music",
        label: "Music",
      },
      {
        value: "creative_writing",
        label: "Creative Writing",
      },
      {
        value: "live_events",
        label: "Live Events",
      },
      {
        value: "parks_nature",
        label: "Parks + Nature",
      },
      {
        value: "animal_assisted",
        label: "Animal-Assisted",
      },
    ],
  },
];

/* ============================================================================
   DELIVERY FORMAT
============================================================================ */

const FORMAT_OPTIONS: {
  value: DeliveryFormat;
  label: string;
}[] = [
  {
    value: "in_person",
    label: "In Person",
  },
  {
    value: "online",
    label: "Online",
  },
  {
    value: "hybrid",
    label: "Hybrid",
  },
  {
    value: "phone",
    label: "Phone",
  },
  {
    value: "not_applicable",
    label: "Not Applicable",
  },
];

/* ============================================================================
   STATUS
============================================================================ */

const STATUS_OPTIONS: {
  value: ResourceStatus;
  label: string;
}[] = [
  {
    value: "published",
    label: "Published",
  },
  {
    value: "draft",
    label: "Draft",
  },
  {
    value: "archived",
    label: "Archived",
  },
];

function normalizeDeliveryFormat(value: unknown): DeliveryFormat | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase().replace(/[ -]+/g, "_");
  return FORMAT_OPTIONS.some((item) => item.value === normalized)
    ? (normalized as DeliveryFormat)
    : null;
}

/* ============================================================================
   COMPONENT
============================================================================ */
interface AddResourceModalProps {
  open: boolean;
  resource?: ApiResource | null;
  onClose: () => void;
  onCreated: () => void;
}

export function AddResourceModal({
  open,
  resource,
  onClose,
  onCreated,
}: AddResourceModalProps) {
  const { bumpResourcesVersion } = useAppContext();

  /* --------------------------------------------------------------------------
     Form state
  -------------------------------------------------------------------------- */

  const [title, setTitle] = useState("");
  const [category, setCategory] =
    useState<ResourceCategory>("recovery_meetings");
  const [subCategory, setSubCategory] = useState("aa");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [venue, setVenue] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [deliveryFormat, setDeliveryFormat] =
    useState<DeliveryFormat>("in_person");
  const [status, setStatus] =
    useState<ResourceStatus>("published");
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(resource);

  /* --------------------------------------------------------------------------
     Load/reset form whenever the modal opens or the selected resource changes.
     This is what makes Edit open the same card with all values pre-filled.
  -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!open) return;

    if (resource) {
      const resourceCategory = CATEGORY_OPTIONS.some(
        (item) => item.value === resource.category
      )
        ? (resource.category as ResourceCategory)
        : "recovery_meetings";

      const categoryOption =
        CATEGORY_OPTIONS.find(
          (item) => item.value === resourceCategory
        ) ?? CATEGORY_OPTIONS[0];

      const validSubCategory =
        resource.sub_category &&
        categoryOption.subCategories.some(
          (item) => item.value === resource.sub_category
        )
          ? resource.sub_category
          : categoryOption.subCategories[0]?.value ?? "";

      // UAT writes delivery_format, while some responses expose the display
      // alias as format. Accept either shape when opening an existing item.
      const resourceFormat = normalizeDeliveryFormat(
        resource.delivery_format || resource.format
      );
      const validFormat = resourceFormat ?? "not_applicable";

      const validStatus = STATUS_OPTIONS.some(
        (item) => item.value === resource.status
      )
        ? (resource.status as ResourceStatus)
        : "published";

      setTitle(resource.title ?? "");
      setCategory(resourceCategory);
      setSubCategory(validSubCategory);
      setDescription(resource.description ?? "");
      setUrl(resource.url ?? "");
      setPhone(resource.phone ?? "");
      setVenue(resource.venue ?? "");
      setStreetAddress(resource.street_address ?? "");
      setCity(resource.city ?? "");
      setDeliveryFormat(validFormat);
      setStatus(validStatus);
      setThumbnail(null);
      setError(null);
      return;
    }

    // New resource: reset to clean defaults.
    setTitle("");
    setCategory("recovery_meetings");
    setSubCategory("aa");
    setDescription("");
    setUrl("");
    setPhone("");
    setVenue("");
    setStreetAddress("");
    setCity("");
    setDeliveryFormat("in_person");
    setStatus("published");
    setThumbnail(null);
    setError(null);
  }, [open, resource]);

  /* --------------------------------------------------------------------------
     Selected category
  -------------------------------------------------------------------------- */

  const selectedCategory = useMemo(() => {
    return (
      CATEGORY_OPTIONS.find(
        (item) => item.value === category
      ) ?? CATEGORY_OPTIONS[0]
    );
  }, [category]);

  /* --------------------------------------------------------------------------
     Category change
     When the category changes manually, select its first sub-category.
  -------------------------------------------------------------------------- */

  const handleCategoryChange = (label: string) => {
    const selected = CATEGORY_OPTIONS.find(
      (item) => item.label === label
    );

    if (!selected) return;

    setCategory(selected.value);
    setSubCategory(
      selected.subCategories[0]?.value ?? ""
    );
  };

  /* --------------------------------------------------------------------------
     Submit
  -------------------------------------------------------------------------- */

  const handleSubmit = async () => {
    setError(null);

    if (!title.trim()) {
      setError("Resource name is required.");
      return;
    }

    if (!category) {
      setError("Category is required.");
      return;
    }

    if (!subCategory) {
      setError("Sub-category is required.");
      return;
    }

    if (!description.trim()) {
      setError("Description is required.");
      return;
    }

    if (!url.trim()) {
      setError("URL is required.");
      return;
    }

    if (!deliveryFormat) {
      setError("Format is required.");
      return;
    }

    try {
      setSubmitting(true);

      if (resource) {
        // Edit existing resource.
        await updateResource(resource.id, {
          title: title.trim(),
          category,
          sub_category: subCategory,
          description: description.trim(),
          organization: resource.organization ?? "",
          url: url.trim(),
          phone: phone.trim(),
          venue: venue.trim(),
          street_address: streetAddress.trim(),
          city: city.trim(),
          delivery_format: deliveryFormat,
          status,
          is_featured: resource.is_featured ?? false,
          tags: resource.tags ?? [],
          ...(thumbnail ? { thumbnail } : {}),
        });
      } else {
        // Create new resource.
        const payload: CreateResourcePayload = {
          title: title.trim(),
          category,
          sub_category: subCategory,
          description: description.trim(),
          organization: "",
          url: url.trim(),
          phone: phone.trim(),
          venue: venue.trim(),
          street_address: streetAddress.trim(),
          city: city.trim(),
          delivery_format: deliveryFormat,
          status,
          is_featured: false,
          tags: [],
          thumbnail,
        };

        await createResource(payload);
      }

      bumpResourcesVersion();
      onCreated();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          isEditing
            ? "Unable to update resource. Please try again."
            : "Unable to add resource. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <ModalOverlay onClose={onClose}>
      <ModalCard wide>
        <ModalHeader
          title={isEditing ? "Edit Resource" : "Add Resource"}
          onClose={onClose}
        />

        <div className="flex flex-col gap-[18px]">
          <FormField
            label="Resource Name"
            required
          >
            <TextInput
              placeholder="e.g. Tuesday Night Recovery Meeting"
              value={title}
              onChange={setTitle}
            />
          </FormField>

          <div className="flex flex-wrap gap-[14px]">
            <div className="min-w-[180px] flex-1">
              <FormField
                label="Category"
                required
              >
                <SelectInput
                  options={CATEGORY_OPTIONS.map(
                    (item) => item.label
                  )}
                  value={selectedCategory.label}
                  onChange={handleCategoryChange}
                />
              </FormField>
            </div>

            <div className="min-w-[180px] flex-1">
              <FormField
                label="Sub-category"
                required
              >
                <SelectInput
                  options={selectedCategory.subCategories.map(
                    (item) => item.label
                  )}
                  value={
                    selectedCategory.subCategories.find(
                      (item) =>
                        item.value === subCategory
                    )?.label ??
                    selectedCategory.subCategories[0]
                      ?.label ??
                    ""
                  }
                  onChange={(label) => {
                    const selected =
                      selectedCategory.subCategories.find(
                        (item) =>
                          item.label === label
                      );

                    if (selected) {
                      setSubCategory(selected.value);
                    }
                  }}
                />
              </FormField>
            </div>
          </div>

          <FormField
            label="Description"
            required
          >
            <TextArea
              placeholder="Brief description of the resource (1-2 sentences)"
              rows={4}
              value={description}
              onChange={setDescription}
            />
          </FormField>

          <FormField label="Thumbnail / Cover Image">
            {resource?.thumbnail && !thumbnail && (
              <img
                src={resource.thumbnail}
                alt="Current resource thumbnail"
                className="mb-[8px] h-[64px] w-[64px] rounded-[8px] object-cover"
              />
            )}
            <FileDropzone
              label={resource?.thumbnail ? "Replace Thumbnail" : "Upload Thumbnail"}
              file={thumbnail}
              onChange={setThumbnail}
              accept="image/*"
              compact
            />
          </FormField>

          <FormField
            label="Link (URL)"
            required
          >
            <TextInput
              placeholder="https://..."
              value={url}
              onChange={setUrl}
            />
          </FormField>

          <div className="flex flex-wrap gap-[14px]">
            <div className="min-w-[180px] flex-1">
              <FormField label="Phone">
                <TextInput
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={setPhone}
                />
              </FormField>
            </div>

            <div className="min-w-[180px] flex-1">
              <FormField label="Venue">
                <TextInput
                  placeholder="Community Center"
                  value={venue}
                  onChange={setVenue}
                />
              </FormField>
            </div>
          </div>

          <FormField label="Address">
            <TextInput
              placeholder="123 Main St, City, PA"
              value={streetAddress}
              onChange={setStreetAddress}
            />
          </FormField>

          <FormField label="City">
            <TextInput
              placeholder="Philadelphia"
              value={city}
              onChange={setCity}
            />
          </FormField>

          <div className="flex flex-wrap gap-[14px]">
            <div className="min-w-[180px] flex-1">
              <FormField
                label="Format"
                required
              >
                <SelectInput
                  options={FORMAT_OPTIONS.map(
                    (item) => item.label
                  )}
                  value={
                    FORMAT_OPTIONS.find(
                      (item) =>
                        item.value === deliveryFormat
                    )?.label ?? "In Person"
                  }
                  onChange={(label) => {
                    const selected =
                      FORMAT_OPTIONS.find(
                        (item) =>
                          item.label === label
                      );

                    if (selected) {
                      setDeliveryFormat(
                        selected.value
                      );
                    }
                  }}
                />
              </FormField>
            </div>

            <div className="min-w-[180px] flex-1">
              <FormField
                label="Status"
                required
              >
                <SelectInput
                  options={STATUS_OPTIONS.map(
                    (item) => item.label
                  )}
                  value={
                    STATUS_OPTIONS.find(
                      (item) =>
                        item.value === status
                    )?.label ?? "Published"
                  }
                  onChange={(label) => {
                    const selected =
                      STATUS_OPTIONS.find(
                        (item) =>
                          item.label === label
                      );

                    if (selected) {
                      setStatus(selected.value);
                    }
                  }}
                />
              </FormField>
            </div>
          </div>

          {error && (
            <p className="font-['Figtree'] text-[13px] text-red-500">
              {error}
            </p>
          )}
        </div>

        <ModalFooter
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmLabel={
            submitting
              ? isEditing
                ? "Updating..."
                : "Adding..."
              : isEditing
                ? "Update Resource"
                : "Add Resource"
          }
          confirmDisabled={submitting}
        />
      </ModalCard>
    </ModalOverlay>
  );
}
