import { useState } from "react";
import { ModalOverlay, ModalCard, ModalHeader, ModalFooter, SectionLabel } from "@/components/common/Modal";
import { FormField, TextInput, TextArea, SelectInput } from "@/components/common/FormFields";
import { Toggle } from "@/components/common/Toggle";
import { FileDropzone } from "@/components/common/FileDropzone";
import { ApiError } from "@/lib/api";
import {
  CONTENT_CATEGORIES,
  CONTENT_CATEGORY_LABELS,
  CONTENT_DIFFICULTIES,
  CONTENT_DIFFICULTY_LABELS,
  CONTENT_TYPES,
  CONTENT_TYPE_LABELS,
  createContentItem,
  type ContentCategory,
  type ContentDifficulty,
  type ContentType,
} from "@/lib/content";
import { useAppContext } from "@/app/app-context";

const MEDIA_CATEGORIES = CONTENT_CATEGORIES.filter((c) => c !== "literature" && c !== "books");
const LITERATURE_CATEGORIES: ContentCategory[] = ["literature", "books"];

export function AddContentModal({ onClose }: { onClose: () => void }) {
  const { bumpContentVersion } = useAppContext();
  const [tab, setTab] = useState<"Media" | "Literature">("Media");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Media fields
  const [title, setTitle] = useState("");
  const [creator, setCreator] = useState("");
  const [contentType, setContentType] = useState<ContentType>("meditation");
  const [category, setCategory] = useState<ContentCategory>("self_care");
  const [difficulty, setDifficulty] = useState<ContentDifficulty>("beginner");
  const [topic, setTopic] = useState("");
  const [emotion, setEmotion] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "archived">("published");
  const [featured, setFeatured] = useState(false);

  // Literature fields
  const [litTitle, setLitTitle] = useState("");
  const [litCreator, setLitCreator] = useState("");
  const [litCategory, setLitCategory] = useState<ContentCategory>("literature");
  const [litDifficulty, setLitDifficulty] = useState<ContentDifficulty>("beginner");
  const [litDescription, setLitDescription] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [litThumbnail, setLitThumbnail] = useState<File | null>(null);
  const [litStatus, setLitStatus] = useState<"draft" | "published" | "archived">("published");
  const [litFeatured, setLitFeatured] = useState(false);

  const handleSubmitMedia = async () => {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const durationSeconds = (Number(minutes) || 0) * 60 + (Number(seconds) || 0);
      await createContentItem({
        title: title.trim(),
        creator: creator.trim(),
        description: description.trim(),
        content_type: contentType,
        category,
        topic: topic.trim(),
        emotion: emotion.trim(),
        difficulty_level: difficulty,
        media_url: mediaUrl.trim(),
        thumbnail,
        duration_seconds: durationSeconds,
        is_featured: featured,
        status,
      });
      bumpContentVersion();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to add media content. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitLiterature = async () => {
    if (!litTitle.trim()) {
      setError("Title is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createContentItem({
        title: litTitle.trim(),
        creator: litCreator.trim(),
        description: litDescription.trim(),
        category: litCategory,
        content_type: "text",
        difficulty_level: litDifficulty,
        content_file: documentFile,
        thumbnail_upload: litThumbnail,
        is_featured: litFeatured,
        status: litStatus,
      });
      bumpContentVersion();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to add literature. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalCard wide>
        <ModalHeader title="Add Content" onClose={onClose} />

        <div className="relative border-b border-[var(--app-border)] mb-[24px]">
          <div className="flex">
            {(["Media", "Literature"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setError(null); }}
                className={`px-[20px] py-[12px] font-['Figtree'] text-[14px] cursor-pointer transition-colors relative ${
                  tab === t ? "font-semibold text-[#f37422]" : "font-medium text-[var(--app-muted)] hover:text-[var(--app-text)]"
                }`}
              >
                {t === "Media" ? "Media Content" : "Literature & Books"}
                {tab === t && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#f37422]" />}
              </button>
            ))}
          </div>
        </div>

        {tab === "Media" ? (
          <div className="flex flex-col gap-[24px]">
            <div className="flex flex-col gap-[16px]">
              <SectionLabel label="Basic Info" />
              <FormField label="Title" required>
                <TextInput placeholder="e.g. Healing Trauma Through Meditation" value={title} onChange={setTitle} />
              </FormField>
              <div className="flex gap-[16px] flex-wrap">
                <div className="flex-1 min-w-[180px]">
                  <FormField label="Creator">
                    <TextInput placeholder="e.g. Dr. Sarah Chen" value={creator} onChange={setCreator} />
                  </FormField>
                </div>
                <div className="flex-1 min-w-[180px]">
                  <FormField label="Content Type">
                    <SelectInput
                      options={CONTENT_TYPES.map((t) => CONTENT_TYPE_LABELS[t])}
                      value={CONTENT_TYPE_LABELS[contentType]}
                      onChange={(label) => setContentType(CONTENT_TYPES.find((t) => CONTENT_TYPE_LABELS[t] === label) ?? "meditation")}
                    />
                  </FormField>
                </div>
              </div>
              <div className="flex gap-[16px] flex-wrap">
                <div className="flex-1 min-w-[180px]">
                  <FormField label="Category">
                    <SelectInput
                      options={MEDIA_CATEGORIES.map((c) => CONTENT_CATEGORY_LABELS[c])}
                      value={CONTENT_CATEGORY_LABELS[category]}
                      onChange={(label) => setCategory(MEDIA_CATEGORIES.find((c) => CONTENT_CATEGORY_LABELS[c] === label) ?? "self_care")}
                    />
                  </FormField>
                </div>
                <div className="flex-1 min-w-[180px]">
                  <FormField label="Difficulty Level">
                    <SelectInput
                      options={CONTENT_DIFFICULTIES.map((d) => CONTENT_DIFFICULTY_LABELS[d])}
                      value={CONTENT_DIFFICULTY_LABELS[difficulty]}
                      onChange={(label) => setDifficulty(CONTENT_DIFFICULTIES.find((d) => CONTENT_DIFFICULTY_LABELS[d] === label) ?? "beginner")}
                    />
                  </FormField>
                </div>
              </div>
              <div className="flex gap-[16px] flex-wrap">
                <div className="flex-1 min-w-[180px]">
                  <FormField label="Topic (Optional)">
                    <TextInput placeholder="e.g. Breathwork" value={topic} onChange={setTopic} />
                  </FormField>
                </div>
                <div className="flex-1 min-w-[180px]">
                  <FormField label="Emotion (Optional)">
                    <TextInput placeholder="e.g. Anxiety, Calm" value={emotion} onChange={setEmotion} />
                  </FormField>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-[16px]">
              <SectionLabel label="Media" />
              <FormField label="Media URL (Optional)">
                <TextInput placeholder="https://..." value={mediaUrl} onChange={setMediaUrl} />
              </FormField>
              <div className="flex gap-[16px] flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <FormField label="Thumbnail / Cover">
                    <FileDropzone label="Upload Thumbnail" file={thumbnail} onChange={setThumbnail} accept="image/*" compact />
                  </FormField>
                </div>
                <div className="w-[160px]">
                  <FormField label="Duration">
                    <div className="flex gap-[8px] items-center">
                      <TextInput placeholder="15" value={minutes} onChange={setMinutes} type="number" />
                      <span className="font-['JetBrains_Mono'] text-[var(--app-muted)] text-[12px]">:</span>
                      <TextInput placeholder="00" value={seconds} onChange={setSeconds} type="number" />
                    </div>
                  </FormField>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-[16px]">
              <SectionLabel label="Details" />
              <FormField label="Description">
                <TextArea placeholder="Provide a brief overview..." rows={3} value={description} onChange={setDescription} />
              </FormField>
              <div className="flex gap-[16px] flex-wrap">
                <div className="flex-1 min-w-[180px]">
                  <FormField label="Status">
                    <SelectInput
                      options={["Published", "Draft", "Archived"]}
                      value={status === "draft" ? "Draft" : status === "published" ? "Published" : "Archived"}
                      onChange={(label) => setStatus(label === "Draft" ? "draft" : label === "Published" ? "published" : "archived")}
                    />
                  </FormField>
                </div>
                <div className="flex-1 min-w-[180px]">
                  <FormField label="Featured Status">
                    <div className="relative bg-[var(--app-surface)] h-[44px] rounded-[10px]">
                      <div className="absolute inset-0 rounded-[10px] border border-[var(--app-border)] pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setFeatured((v) => !v)}
                        className="flex items-center justify-between px-[14px] h-full w-full cursor-pointer"
                      >
                        <span className="font-['Figtree'] font-normal text-[var(--app-text)] text-[14px]">Feature this content</span>
                        <Toggle on={featured} />
                      </button>
                    </div>
                  </FormField>
                </div>
              </div>
            </div>
            {error && <p className="font-['Figtree'] text-[13px] text-red-500">{error}</p>}
          </div>
        ) : (
          <div className="flex flex-col gap-[24px]">
            <div className="flex flex-col gap-[16px]">
              <SectionLabel label="Literature / Book Details" />
              <FormField label="Title" required>
                <TextInput placeholder="e.g. The Science of Relapse Prevention" value={litTitle} onChange={setLitTitle} />
              </FormField>
              <div className="flex gap-[16px] flex-wrap">
                <div className="flex-1 min-w-[180px]">
                  <FormField label="Author / Creator (Optional)">
                    <TextInput placeholder="e.g. Dr. Gabor Maté" value={litCreator} onChange={setLitCreator} />
                  </FormField>
                </div>
                <div className="flex-1 min-w-[180px]">
                  <FormField label="Category">
                    <SelectInput
                      options={LITERATURE_CATEGORIES.map((c) => CONTENT_CATEGORY_LABELS[c])}
                      value={CONTENT_CATEGORY_LABELS[litCategory]}
                      onChange={(label) => setLitCategory(LITERATURE_CATEGORIES.find((c) => CONTENT_CATEGORY_LABELS[c] === label) ?? "literature")}
                    />
                  </FormField>
                </div>
              </div>
              <div className="flex gap-[16px] flex-wrap">
                <div className="flex-1 min-w-[180px]">
                  <FormField label="Difficulty Level">
                    <SelectInput
                      options={CONTENT_DIFFICULTIES.map((d) => CONTENT_DIFFICULTY_LABELS[d])}
                      value={CONTENT_DIFFICULTY_LABELS[litDifficulty]}
                      onChange={(label) => setLitDifficulty(CONTENT_DIFFICULTIES.find((d) => CONTENT_DIFFICULTY_LABELS[d] === label) ?? "beginner")}
                    />
                  </FormField>
                </div>
                <div className="flex-1 min-w-[180px]">
                  <FormField label="Status">
                    <SelectInput
                      options={["Published", "Draft", "Archived"]}
                      value={litStatus === "draft" ? "Draft" : litStatus === "published" ? "Published" : "Archived"}
                      onChange={(label) => setLitStatus(label === "Draft" ? "draft" : label === "Published" ? "published" : "archived")}
                    />
                  </FormField>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-[16px]">
              <SectionLabel label="Document & Cover Files" />
              <div className="flex gap-[16px] flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <FormField label="PDF / DOCX File">
                    <FileDropzone
                      label="Upload Document File"
                      hint="PDF, DOCX, DOC · Max 50MB"
                      file={documentFile}
                      onChange={setDocumentFile}
                      accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      compact
                    />
                  </FormField>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <FormField label="Cover / Thumbnail Image (Optional)">
                    <FileDropzone label="Upload Cover Image" file={litThumbnail} onChange={setLitThumbnail} accept="image/*" compact />
                  </FormField>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-[16px]">
              <SectionLabel label="Details" />
              <FormField label="Description (Optional)">
                <TextArea placeholder="Provide a brief summary for the literature library..." rows={3} value={litDescription} onChange={setLitDescription} />
              </FormField>
              <div className="flex gap-[16px] flex-wrap">
                <div className="flex-1 min-w-[180px]">
                  <FormField label="Featured Status">
                    <div className="relative bg-[var(--app-surface)] h-[44px] rounded-[10px]">
                      <div className="absolute inset-0 rounded-[10px] border border-[var(--app-border)] pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setLitFeatured((v) => !v)}
                        className="flex items-center justify-between px-[14px] h-full w-full cursor-pointer"
                      >
                        <span className="font-['Figtree'] font-normal text-[var(--app-text)] text-[14px]">Feature this item</span>
                        <Toggle on={litFeatured} />
                      </button>
                    </div>
                  </FormField>
                </div>
              </div>
            </div>
            {error && <p className="font-['Figtree'] text-[13px] text-red-500">{error}</p>}
          </div>
        )}

        <ModalFooter
          onCancel={onClose}
          onConfirm={tab === "Media" ? handleSubmitMedia : handleSubmitLiterature}
          confirmLabel={submitting ? "Saving..." : tab === "Media" ? "Add Media Content" : "Add Literature / Book"}
          confirmDisabled={submitting}
        />
      </ModalCard>
    </ModalOverlay>
  );
}
