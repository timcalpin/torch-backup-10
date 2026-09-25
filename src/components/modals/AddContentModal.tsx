import { useState } from "react";
import { ModalOverlay, ModalCard, ModalHeader, ModalFooter, SectionLabel } from "@/components/common/Modal";
import { FormField, TextInput, TextArea, SelectInput } from "@/components/common/FormFields";
import { Toggle } from "@/components/common/Toggle";
import { FileDropzone } from "@/components/common/FileDropzone";
import { ApiError } from "@/lib/api";
import {
  CONTENT_DIFFICULTIES,
  CONTENT_DIFFICULTY_LABELS,
  CONTENT_TYPES,
  CONTENT_TYPE_LABELS,
  createContentItem,
  type ContentCategory,
  type ContentDifficulty,
  type ContentType,
  type ContentStatus,
} from "@/lib/content";
import { useAppContext } from "@/app/app-context";

const LIBRARY_CATEGORY_OPTIONS = [
  "Meditation", "Mental Health", "Emotional Regulation", "Sleep", "Spirituality", "Unassigned", "Yoga", "Trauma",
  "Family & Relationships", "Books", "In-App Literature",
] as const;
type LibraryCategory = (typeof LIBRARY_CATEGORY_OPTIONS)[number];

const LIBRARY_CATEGORY_MAP: Record<LibraryCategory, ContentCategory> = {
  Meditation: "meditation", "Mental Health": "mental_health", "Emotional Regulation": "stress_relief", Sleep: "self_care",
  Spirituality: "spirituality", Unassigned: "self_care", Yoga: "yoga", Trauma: "trauma", "Family & Relationships": "self_care",
  Books: "books", "In-App Literature": "literature",
};

const STATUS_OPTIONS: { value: ContentStatus; label: string }[] = [
  { value: "published", label: "Published" },
  { value: "review", label: "Review / Pending" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

export function AddContentModal({ onClose }: { onClose: () => void }) {
  const { bumpContentVersion } = useAppContext();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [creator, setCreator] = useState("");
  const [contentType, setContentType] = useState<ContentType>("meditation");
  const [category, setCategory] = useState<LibraryCategory>("Meditation");
  const [difficulty, setDifficulty] = useState<ContentDifficulty>("beginner");
  const [topic, setTopic] = useState("");
  const [emotion, setEmotion] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ContentStatus>("published");
  const [featured, setFeatured] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createContentItem({
        title: title.trim(),
        creator: creator.trim(),
        description: description.trim(),
        content_type: contentType,
        category: LIBRARY_CATEGORY_MAP[category],
        topic: topic.trim(),
        emotion: emotion.trim(),
        difficulty_level: difficulty,
        media_url: mediaUrl.trim(),
        thumbnail,
        duration_seconds: (Number(minutes) || 0) * 60 + (Number(seconds) || 0),
        is_featured: featured,
        status,
      });
      bumpContentVersion();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to add content. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalCard wide>
        <ModalHeader title="Add Content" onClose={onClose} />
        <div className="flex flex-col gap-[24px]">
          <div className="flex flex-col gap-[16px]">
            <SectionLabel label="Basic Info" />
            <FormField label="Title" required><TextInput placeholder="e.g. Healing Trauma Through Meditation" value={title} onChange={setTitle} /></FormField>
            <div className="flex gap-[16px] flex-wrap">
              <div className="flex-1 min-w-[180px]"><FormField label="Creator"><TextInput placeholder="e.g. Dr. Sarah Chen" value={creator} onChange={setCreator} /></FormField></div>
              <div className="flex-1 min-w-[180px]"><FormField label="Content Type"><SelectInput options={CONTENT_TYPES.map((t) => CONTENT_TYPE_LABELS[t])} value={CONTENT_TYPE_LABELS[contentType]} onChange={(label) => setContentType(CONTENT_TYPES.find((t) => CONTENT_TYPE_LABELS[t] === label) ?? "meditation")} /></FormField></div>
            </div>
            <div className="flex gap-[16px] flex-wrap">
              <div className="flex-1 min-w-[180px]"><FormField label="Category"><SelectInput options={[...LIBRARY_CATEGORY_OPTIONS]} value={category} onChange={(label) => setCategory(LIBRARY_CATEGORY_OPTIONS.find((option) => option === label) ?? "Meditation")} /></FormField></div>
              <div className="flex-1 min-w-[180px]"><FormField label="Difficulty Level"><SelectInput options={CONTENT_DIFFICULTIES.map((d) => CONTENT_DIFFICULTY_LABELS[d])} value={CONTENT_DIFFICULTY_LABELS[difficulty]} onChange={(label) => setDifficulty(CONTENT_DIFFICULTIES.find((d) => CONTENT_DIFFICULTY_LABELS[d] === label) ?? "beginner")} /></FormField></div>
            </div>
            <div className="flex gap-[16px] flex-wrap">
              <div className="flex-1 min-w-[180px]"><FormField label="Topic (Optional)"><TextInput placeholder="e.g. Breathwork" value={topic} onChange={setTopic} /></FormField></div>
              <div className="flex-1 min-w-[180px]"><FormField label="Emotion (Optional)"><TextInput placeholder="e.g. Anxiety, Calm" value={emotion} onChange={setEmotion} /></FormField></div>
            </div>
          </div>
          <div className="flex flex-col gap-[16px]">
            <SectionLabel label="Media" />
            <FormField label="Media URL (Optional)"><TextInput placeholder="https://..." value={mediaUrl} onChange={setMediaUrl} /></FormField>
            <div className="flex gap-[16px] flex-wrap">
              <div className="flex-1 min-w-[200px]"><FormField label="Thumbnail / Cover"><FileDropzone label="Upload Thumbnail" file={thumbnail} onChange={setThumbnail} accept="image/*" compact /></FormField></div>
              <div className="w-[160px]"><FormField label="Duration"><div className="flex gap-[8px] items-center"><TextInput placeholder="15" value={minutes} onChange={setMinutes} type="number" /><span className="font-['JetBrains_Mono'] text-[var(--app-muted)] text-[12px]">:</span><TextInput placeholder="00" value={seconds} onChange={setSeconds} type="number" /></div></FormField></div>
            </div>
          </div>
          <div className="flex flex-col gap-[16px]">
            <SectionLabel label="Details" />
            <FormField label="Description"><TextArea placeholder="Provide a brief overview..." rows={3} value={description} onChange={setDescription} /></FormField>
            <div className="flex gap-[16px] flex-wrap">
              <div className="flex-1 min-w-[180px]"><FormField label="Status"><SelectInput options={STATUS_OPTIONS.map((option) => option.label)} value={STATUS_OPTIONS.find((option) => option.value === status)?.label ?? "Published"} onChange={(label) => setStatus(STATUS_OPTIONS.find((option) => option.label === label)?.value ?? "draft")} /></FormField></div>
              <div className="flex-1 min-w-[180px]"><FormField label="Featured Status"><div className="relative bg-[var(--app-surface)] h-[44px] rounded-[10px]"><div className="absolute inset-0 rounded-[10px] border border-[var(--app-border)] pointer-events-none" /><button type="button" onClick={() => setFeatured((value) => !value)} className="flex items-center justify-between px-[14px] h-full w-full cursor-pointer"><span className="font-['Figtree'] font-normal text-[var(--app-text)] text-[14px]">Feature this content</span><Toggle on={featured} /></button></div></FormField></div>
            </div>
          </div>
          {error && <p className="font-['Figtree'] text-[13px] text-red-500">{error}</p>}
        </div>
        <ModalFooter onCancel={onClose} onConfirm={handleSubmit} confirmLabel={submitting ? "Saving..." : "Add Content"} confirmDisabled={submitting} />
      </ModalCard>
    </ModalOverlay>
  );
}
