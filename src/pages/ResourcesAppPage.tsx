import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useAppContext } from "@/app/app-context";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchBox } from "@/components/common/SearchBox";
import { PrimaryBtn } from "@/components/common/Buttons";
import { MetricCard } from "@/components/common/MetricCard";
import { TableCard, TableHead, TableRow } from "@/components/common/Table";
import { StatusPill } from "@/components/common/StatusPill";
import { Toggle } from "@/components/common/Toggle";
import { ActionBtn } from "@/components/common/ActionBtn";
import { ModalOverlay, ModalCard, ModalHeader, ModalFooter, SectionLabel } from "@/components/common/Modal";
import { FormField, TextInput, TextArea, SelectInput } from "@/components/common/FormFields";
import { FileDropzone } from "@/components/common/FileDropzone";
import { ExcelImportModal } from "@/components/common/ExcelImportModal";
import { EditIcon, MicIcon, VideoIcon, BookIcon, SparklesIcon, FileIcon } from "@/components/icons";
import { ApiError } from "@/lib/api";
import {
  listContent,
  getContentStats,
  updateContentItem,
  deleteContentItem,
  CONTENT_CATEGORIES,
  CONTENT_CATEGORY_LABELS,
  CONTENT_DIFFICULTIES,
  CONTENT_DIFFICULTY_LABELS,
  CONTENT_STATUSES,
  CONTENT_TYPES,
  CONTENT_TYPE_LABELS,
  type ApiContentItem,
  type ContentStats,
  type ContentCategory,
  type ContentDifficulty,
  type ContentType,
  type ContentStatus,
  createContentItem,
} from "@/lib/content";
import { readExcelRows } from "@/lib/excel";
import {
  listLiterature,
  updateLiterature,
  deleteLiterature,
  LITERATURE_CATEGORIES,
  LITERATURE_CATEGORY_LABELS,
  type ApiLiterature,
  type LiteratureCategory,
} from "@/lib/literature";

const CONTENT_TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  Meditation: { bg: "rgba(243,116,34,0.15)", color: "#f37422" },
  Audio: { bg: "rgba(107,138,176,0.15)", color: "#6b8ab0" },
  Video: { bg: "rgba(74,222,128,0.15)", color: "#4ade80" },
  Podcast: { bg: "rgba(163,115,143,0.15)", color: "#a3738f" },
  Text: { bg: "rgba(183,163,110,0.15)", color: "#b7a36e" },
};

const CONTENT_TABS = ["All", "Audio", "Video", "Podcast", "Meditation", "Text", "Literature"];

const RESOURCE_IMPORT_HEADERS = [
  "title",
  "creator",
  "description",
  "content_type",
  "category",
  "topic",
  "emotion",
  "difficulty_level",
  "media_url",
  "duration_seconds",
  "tags",
  "is_featured",
  "status",
] as const;

function toTitleCase(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function toDisplayStatus(status: ApiContentItem["status"]): "ACTIVE" | "PENDING" | "ARCHIVED" {
  if (status === "published") return "ACTIVE";
  if (status === "archived") return "ARCHIVED";
  return "PENDING";
}

function csvValue(values: Record<string, string>, ...keys: string[]): string {
  return keys.map((key) => values[key]).find((value) => value?.trim())?.trim() ?? "";
}

function normalizeCsvValue(value: string, fallback: string): string {
  return value.trim().toLowerCase().replace(/[ -]+/g, "_") || fallback;
}

function csvBoolean(value: string): boolean {
  return ["true", "1", "yes", "y", "on", "featured"].includes(value.trim().toLowerCase());
}

function csvDuration(value: string): number {
  if (value.includes(":")) {
    const [minutes, seconds] = value.split(":").map(Number);
    return (Number.isFinite(minutes) ? minutes : 0) * 60 + (Number.isFinite(seconds) ? seconds : 0);
  }
  const seconds = Number(value);
  return Number.isFinite(seconds) ? seconds : 0;
}

function EditContentModal({ item, onClose, onSaved }: { item: ApiContentItem; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(item.title);
  const [creator, setCreator] = useState(item.creator);
  const [contentType, setContentType] = useState<ContentType>(item.content_type);
  const [category, setCategory] = useState<ContentCategory>(item.category);
  const [difficulty, setDifficulty] = useState<ContentDifficulty>((item.difficulty_level || "beginner") as ContentDifficulty);
  const [topic, setTopic] = useState(item.topic);
  const [emotion, setEmotion] = useState(item.emotion);
  const [mediaUrl, setMediaUrl] = useState(item.media_url);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [minutes, setMinutes] = useState(String(Math.floor(item.duration_seconds / 60)));
  const [seconds, setSeconds] = useState(String(item.duration_seconds % 60));
  const [description, setDescription] = useState(item.description);
  const [status, setStatus] = useState<ContentStatus>(item.status);
  const [featured, setFeatured] = useState(item.is_featured);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim() || !mediaUrl.trim()) {
      setError("Title and Media URL are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const durationSeconds = (Number(minutes) || 0) * 60 + (Number(seconds) || 0);
      await updateContentItem(item.id, {
        title: title.trim(),
        creator: creator.trim(),
        description: description.trim(),
        content_type: contentType,
        category,
        topic: topic.trim(),
        emotion: emotion.trim(),
        difficulty_level: difficulty,
        media_url: mediaUrl.trim(),
        duration_seconds: durationSeconds,
        is_featured: featured,
        status,
        thumbnail,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to save changes. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalCard wide>
        <ModalHeader title={`Edit ${item.title}`} onClose={onClose} />
        <div className="flex flex-col gap-[24px]">
          <div className="flex flex-col gap-[16px]">
            <SectionLabel label="Basic Info" />
            <FormField label="Title" required><TextInput value={title} onChange={setTitle} /></FormField>
            <div className="flex gap-[16px] flex-wrap">
              <div className="flex-1 min-w-[180px]"><FormField label="Creator"><TextInput value={creator} onChange={setCreator} /></FormField></div>
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
                    options={CONTENT_CATEGORIES.map((c) => CONTENT_CATEGORY_LABELS[c])}
                    value={CONTENT_CATEGORY_LABELS[category]}
                    onChange={(label) => setCategory(CONTENT_CATEGORIES.find((c) => CONTENT_CATEGORY_LABELS[c] === label) ?? "meditation")}
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
              <div className="flex-1 min-w-[180px]"><FormField label="Topic (Optional)"><TextInput value={topic} onChange={setTopic} /></FormField></div>
              <div className="flex-1 min-w-[180px]"><FormField label="Emotion (Optional)"><TextInput value={emotion} onChange={setEmotion} /></FormField></div>
            </div>
          </div>
          <div className="flex flex-col gap-[16px]">
            <SectionLabel label="Media" />
            <FormField label="Media URL" required><TextInput value={mediaUrl} onChange={setMediaUrl} /></FormField>
            <div className="flex gap-[16px] flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <FormField label="Thumbnail">
                  <FileDropzone label={item.thumbnail ? "Replace Thumbnail" : "Upload Thumbnail"} file={thumbnail} onChange={setThumbnail} accept="image/*" compact />
                </FormField>
              </div>
              <div className="w-[160px]">
                <FormField label="Duration">
                  <div className="flex gap-[8px] items-center">
                    <TextInput value={minutes} onChange={setMinutes} type="number" />
                    <span className="font-['JetBrains_Mono'] text-[var(--app-muted)] text-[12px]">:</span>
                    <TextInput value={seconds} onChange={setSeconds} type="number" />
                  </div>
                </FormField>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-[16px]">
            <SectionLabel label="Details" />
            <FormField label="Description"><TextArea rows={3} value={description} onChange={setDescription} /></FormField>
            <div className="flex gap-[16px] flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <FormField label="Status">
                  <SelectInput
                    options={["Draft", "Review", "Published", "Archived"]}
                    value={status === "draft" ? "Draft" : status === "review" ? "Review" : status === "published" ? "Published" : "Archived"}
                    onChange={(label) =>
                      setStatus(label === "Draft" ? "draft" : label === "Review" ? "review" : label === "Published" ? "published" : "archived")
                    }
                  />
                </FormField>
              </div>
              <div className="flex-1 min-w-[180px]">
                <FormField label="Featured Status">
                  <div className="relative bg-[var(--app-surface)] h-[44px] rounded-[10px]">
                    <div className="absolute inset-0 rounded-[10px] border border-[var(--app-border)] pointer-events-none" />
                    <button type="button" onClick={() => setFeatured((v) => !v)} className="flex items-center justify-between px-[14px] h-full w-full cursor-pointer">
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
        <ModalFooter
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmLabel={submitting ? "Saving..." : "Save changes"}
          confirmDisabled={submitting}
        />
      </ModalCard>
    </ModalOverlay>
  );
}

function EditLiteratureModal({ item, onClose, onSaved }: { item: ApiLiterature; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(item.title);
  const [category, setCategory] = useState<LiteratureCategory>(item.category);
  const [featured, setFeatured] = useState(item.is_featured);
  const [description, setDescription] = useState(item.description);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await updateLiterature(item.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        is_featured: featured,
        ...(pdfFile ? { pdf_file: pdfFile } : {}),
        ...(thumbnail ? { thumbnail } : {}),
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to save changes. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalCard>
        <ModalHeader title={`Edit ${item.title}`} onClose={onClose} />
        <div className="flex flex-col gap-[16px]">
          <FormField label="Title" required><TextInput value={title} onChange={setTitle} /></FormField>
          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <FormField label="Category">
                <SelectInput
                  options={LITERATURE_CATEGORIES.map((c) => LITERATURE_CATEGORY_LABELS[c])}
                  value={LITERATURE_CATEGORY_LABELS[category]}
                  onChange={(label) => setCategory(LITERATURE_CATEGORIES.find((c) => LITERATURE_CATEGORY_LABELS[c] === label) ?? "recovery")}
                />
              </FormField>
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
          <FormField label="Description (Optional)"><TextArea rows={3} value={description} onChange={setDescription} /></FormField>
          <FormField label="PDF File"><FileDropzone label={item.pdf_file ? "Replace PDF File" : "Upload PDF File"} hint="PDF only Â· Max 50MB" file={pdfFile} onChange={setPdfFile} accept="application/pdf" /></FormField>
          <FormField label="Thumbnail"><FileDropzone label={item.thumbnail ? "Replace Thumbnail" : "Upload Thumbnail"} file={thumbnail} onChange={setThumbnail} accept="image/*" compact /></FormField>
          {error && <p className="font-['Figtree'] text-[13px] text-red-500">{error}</p>}
        </div>
        <ModalFooter
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmLabel={submitting ? "Saving..." : "Save changes"}
          confirmDisabled={submitting}
        />
      </ModalCard>
    </ModalOverlay>
  );
}

export function ResourcesAppPage() {
  const {
    setModal,
    contentVersion,
    bumpContentVersion,
    literatureVersion,
    bumpLiteratureVersion,
  } = useAppContext();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");
  const [contentPage, setContentPage] = useState(1);
  const [literaturePage, setLiteraturePage] = useState(1);
  const [contentTotal, setContentTotal] = useState(0);
  const [literatureTotal, setLiteratureTotal] = useState(0);
  const [contentHasNext, setContentHasNext] = useState(false);
  const [contentHasPrev, setContentHasPrev] = useState(false);
  const [literatureHasNext, setLiteratureHasNext] = useState(false);
  const [literatureHasPrev, setLiteratureHasPrev] = useState(false);
  const [editContentItem, setEditContentItem] = useState<ApiContentItem | null>(null);
  const [editLiteratureItem, setEditLiteratureItem] = useState<ApiLiterature | null>(null);

  const [content, setContent] = useState<ApiContentItem[]>([]);
  const [contentLoading, setContentLoading] = useState(true);
  const [contentError, setContentError] = useState<string | null>(null);
  const [stats, setStats] = useState<ContentStats | null>(null);

  const [literature, setLiterature] = useState<ApiLiterature[]>([]);
  const [literatureLoading, setLiteratureLoading] = useState(true);
  const [literatureError, setLiteratureError] = useState<string | null>(null);

  const [actionError, setActionError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setContentLoading(true);
    setContentError(null);
    listContent({
      search,
      page: contentPage,
      page_size: 10,
      ...(activeCategory !== "All" && activeCategory !== "Literature" ? { content_type: activeCategory.toLowerCase() } : {}),
      ...(activeStatus !== "All" && activeStatus !== "Featured" && activeStatus !== "New" ? { status: activeStatus.toLowerCase() } : {}),
      ...(activeStatus === "Featured" ? { is_featured: true } : {}),
    })
      .then((response) => {
        if (!cancelled) {
          setContent(response.results);
          setContentTotal(response.count);
          setContentHasNext(Boolean(response.next));
          setContentHasPrev(Boolean(response.previous));
        }
      })
      .catch((err) => {
        if (!cancelled) setContentError(err instanceof ApiError ? err.message : "Unable to load content.");
      })
      .finally(() => {
        if (!cancelled) setContentLoading(false);
      });
    getContentStats()
      .then((response) => {
        if (!cancelled) setStats(response);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [contentVersion, search, contentPage, activeCategory, activeStatus]);

  useEffect(() => {
    let cancelled = false;
    setLiteratureLoading(true);
    setLiteratureError(null);
    listLiterature({ search, page: literaturePage, page_size: 10, ...(activeStatus === "Featured" ? { is_featured: true } : {}) })
      .then((response) => {
        if (!cancelled) {
          setLiterature(response.results);
          setLiteratureTotal(response.count);
          setLiteratureHasNext(Boolean(response.next));
          setLiteratureHasPrev(Boolean(response.previous));
        }
      })
      .catch((err) => {
        if (!cancelled) setLiteratureError(err instanceof ApiError ? err.message : "Unable to load literature.");
      })
      .finally(() => {
        if (!cancelled) setLiteratureLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [literatureVersion, search, literaturePage, activeCategory, activeStatus]);

  const isLiterature = activeCategory === "Literature";

  useEffect(() => {
    setContentPage(1);
    setLiteraturePage(1);
  }, [search, activeCategory, activeStatus]);

  const handleToggleContentFeatured = async (item: ApiContentItem) => {
    setActionError(null);
    try {
      await updateContentItem(item.id, { is_featured: !item.is_featured });
      bumpContentVersion();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Unable to update content.");
    }
  };

  const handleDeleteContent = async (item: ApiContentItem) => {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    setActionError(null);
    try {
      await deleteContentItem(item.id);
      bumpContentVersion();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Unable to delete content.");
    }
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    setImportMessage(null);
    setActionError(null);
    try {
      const rows = await readExcelRows(file);
      if (!rows.length) throw new Error("The Excel file does not contain any data rows.");
      let created = 0;
      const errors: string[] = [];
      for (const [index, row] of rows.entries()) {
        const rowNumber = index + 2;
        const title = csvValue(row, "title", "name");
        const mediaUrl = csvValue(row, "media_url", "url", "link");
        if (!title || !mediaUrl) {
          errors.push(`Row ${rowNumber}: title and media_url are required.`);
          continue;
        }
        try {
          const contentType = normalizeCsvValue(csvValue(row, "content_type", "type"), "text");
          const category = normalizeCsvValue(csvValue(row, "category"), "self_care");
          const difficulty = normalizeCsvValue(csvValue(row, "difficulty_level", "difficulty"), "");
          const status = normalizeCsvValue(csvValue(row, "status"), "draft");
          await createContentItem({
            title,
            creator: csvValue(row, "creator", "author", "provider"),
            description: csvValue(row, "description", "details"),
            content_type: (CONTENT_TYPES.includes(contentType as typeof CONTENT_TYPES[number]) ? contentType : "text") as ContentType,
            category: (CONTENT_CATEGORIES.includes(category as typeof CONTENT_CATEGORIES[number]) ? category : "self_care") as ContentCategory,
            topic: csvValue(row, "topic"),
            emotion: csvValue(row, "emotion"),
            difficulty_level: CONTENT_DIFFICULTIES.includes(difficulty as typeof CONTENT_DIFFICULTIES[number]) ? difficulty as ContentDifficulty : "",
            media_url: mediaUrl,
            duration_seconds: csvDuration(csvValue(row, "duration_seconds", "duration")),
            is_featured: csvBoolean(csvValue(row, "is_featured", "featured")),
            status: (CONTENT_STATUSES.includes(status as typeof CONTENT_STATUSES[number]) ? status : "draft") as ContentStatus,
          });
          created += 1;
        } catch (error) {
          errors.push(`Row ${rowNumber}: ${error instanceof ApiError ? error.message : "could not be created."}`);
        }
      }
      setImportMessage(`Imported ${created} of ${rows.length} rows${errors.length ? `; ${errors.length} failed.` : "."}`);
      if (errors.length) setActionError(errors.slice(0, 3).join(" Â· "));
      if (created) bumpContentVersion();
      setImportModalOpen(false);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to import content.");
      return false;
    } finally {
      setImporting(false);
    }
  };

  const handleToggleLiteratureFeatured = async (item: ApiLiterature) => {
    setActionError(null);
    try {
      await updateLiterature(item.id, { is_featured: !item.is_featured });
      bumpLiteratureVersion();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Unable to update literature.");
    }
  };

  const handleDeleteLiterature = async (item: ApiLiterature) => {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    setActionError(null);
    try {
      await deleteLiterature(item.id);
      bumpLiteratureVersion();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Unable to delete literature.");
    }
  };

  return (
    <div className="flex-1 min-w-0 overflow-y-auto">
      <div className="p-[24px] lg:p-[32px] flex flex-col gap-[20px]">
        <PageHeader
          eyebrow={stats ? `CONTENT Â· ${stats.total_content} ITEMS Â· ${stats.total_plays.toLocaleString()} TOTAL PLAYS` : "LOADING CONTENTâ€¦"}
          title="In-App Resources"
        >
          <SearchBox placeholder="Search resources..." value={search} onChange={setSearch} />
          <PrimaryBtn label={importing ? "Uploading..." : "Upload Excel"} onClick={() => !importing && setImportModalOpen(true)} />
          <PrimaryBtn label="+ Add Content" onClick={() => setModal("add-content")} />
        </PageHeader>

        {contentError && <p className="font-['Figtree'] text-[13px] text-red-500">{contentError}</p>}
        {literatureError && <p className="font-['Figtree'] text-[13px] text-red-500">{literatureError}</p>}
        {actionError && <p className="font-['Figtree'] text-[13px] text-red-500">{actionError}</p>}
        {importMessage && <p className="font-['Figtree'] text-[13px] text-[#35d47b]">{importMessage}</p>}

        <div className="flex gap-[10px] flex-wrap">
          <MetricCard label="TOTAL CONTENT" value={stats ? String(stats.total_content) : "â€”"} delta="Live from server" deltaColor="#8a8073" accentColor="#f37422" />
          <MetricCard label="TOTAL PLAYS" value={stats ? stats.total_plays.toLocaleString() : "â€”"} delta="Live from server" deltaColor="#8a8073" accentColor="#4ade80" />
          <MetricCard label="AVG COMPLETION" value={stats ? `${stats.avg_completion}%` : "â€”"} delta="Live from server" deltaColor="#8a8073" accentColor="#6b8ab0" />
          <MetricCard label="PUBLISHED" value={stats ? String(stats.published_count) : "â€”"} delta="Live from server" deltaColor="#8a8073" accentColor="#facc15" />
        </div>

        <div className="rounded-[10px] border border-[var(--app-border)] bg-[var(--app-surface)] p-[6px]">
          <div className="grid grid-cols-2 gap-[4px] sm:grid-cols-4 lg:grid-cols-7">
            {CONTENT_TABS.map((tab) => {
              const active = activeCategory === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveCategory(tab)}
                  className={`flex items-center justify-center gap-[6px] rounded-[8px] px-[10px] py-[8px] font-['Figtree'] text-[11px] font-medium transition-all cursor-pointer ${
                    active
                      ? "bg-[#f37422] text-white shadow-[0_2px_8px_rgba(243,116,34,0.25)]"
                      : "text-[var(--app-muted)] hover:bg-[rgba(255,255,255,0.03)] hover:text-[var(--app-text)]"
                  }`}
                >
                  <span>{tab}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[10px] border border-[var(--app-border)] bg-[var(--app-surface)]">
          <div className="flex items-center gap-[18px] overflow-x-auto px-[14px] py-[10px]">
            <button
              onClick={() => setActiveStatus("All")}
              className={`whitespace-nowrap font-['Figtree'] text-[11px] font-semibold cursor-pointer ${activeStatus === "All" ? "text-[var(--app-text)]" : "text-[var(--app-muted)] hover:text-[var(--app-text)]"}`}
            >
              All Content
            </button>
            {["All", "Featured", "New", "Draft", "Review", "Archived"].map((status) => (
              <button
                key={status}
                onClick={() => setActiveStatus(status)}
                className={`whitespace-nowrap font-['Figtree'] text-[10px] font-medium cursor-pointer transition-colors ${activeStatus === status ? "text-[#f37422]" : "text-[var(--app-muted)] hover:text-[var(--app-text)]"}`}
              >
                {status}
              </button>
            ))}
            <div className="ml-auto flex-shrink-0">
              <button className="rounded-[6px] border border-[var(--app-border)] bg-[rgba(255,255,255,0.02)] px-[8px] py-[5px] font-['Figtree'] text-[9px] text-[var(--app-muted)] cursor-pointer">
                Sort by: Plays â†“
              </button>
            </div>
          </div>
        </div>

        <TableCard>

          {!isLiterature ? (
            <div className="overflow-x-auto">
              <div className="min-w-[860px]">
                <TableHead cols={[
                  { label: "CONTENT", w: "flex-1 min-w-[220px]" },
                  { label: "TYPE", w: "w-[110px]" },
                  { label: "CATEGORY", w: "w-[110px]" },
                  { label: "DIFFICULTY", w: "w-[110px]" },
                  { label: "DURATION", w: "w-[90px]" },
                  { label: "STATUS", w: "w-[100px]" },
                  { label: "FEATURED", w: "w-[90px]" },
                  { label: "PLAYS", w: "w-[70px]" },
                  { label: "ACTIONS", w: "w-[70px] text-right" },
                ]} />
                {contentLoading && (
                  <div className="py-[48px] text-center">
                    <p className="font-['Figtree'] text-[var(--app-muted)] text-[14px]">Loading content...</p>
                  </div>
                )}
                {!contentLoading && !isLiterature && content.map((item) => {
                  const typeLabel = toTitleCase(item.content_type);
                  const tc = CONTENT_TYPE_COLORS[typeLabel] ?? { bg: "rgba(138,128,115,0.15)", color: "#8a8073" };
                  return (
                    <TableRow key={item.id}>
                      <div className="flex items-center gap-[10px] flex-1 min-w-[220px]">
                        <div className="w-[32px] h-[32px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: tc.bg }}>
                          {typeLabel === "Audio" && <MicIcon color={tc.color} />}
                          {typeLabel === "Video" && <VideoIcon color={tc.color} />}
                          {typeLabel === "Meditation" && <SparklesIcon color={tc.color} />}
                          {!["Audio", "Video", "Meditation"].includes(typeLabel) && <FileIcon color={tc.color} />}
                        </div>
                        <div>
                          <p className="font-['Figtree'] font-semibold text-[var(--app-text)] text-[13px] leading-tight">{item.title}</p>
                          <p className="font-['JetBrains_Mono'] font-normal text-[var(--app-muted)] text-[9px] leading-tight">{item.creator || "â€”"}</p>
                        </div>
                      </div>
                      <div className="w-[110px]">
                        <span className="inline-flex px-[8px] py-[3px] rounded-[4px] font-['JetBrains_Mono'] font-bold text-[10px]" style={{ background: tc.bg, color: tc.color }}>
                          {typeLabel.toUpperCase()}
                        </span>
                      </div>
                      <div className="w-[110px] font-['JetBrains_Mono'] font-normal text-[var(--app-muted)] text-[11px]">{toTitleCase(item.category)}</div>
                      <div className="w-[110px] font-['Figtree'] font-normal text-[var(--app-text)] text-[12px]">{item.difficulty_level ? toTitleCase(item.difficulty_level) : "â€”"}</div>
                      <div className="w-[90px] font-['JetBrains_Mono'] font-normal text-[var(--app-muted)] text-[11px]">{item.duration_minutes}</div>
                      <div className="w-[100px]"><StatusPill status={toDisplayStatus(item.status)} /></div>
                      <div className="w-[90px]">
                        <button onClick={() => handleToggleContentFeatured(item)} className="cursor-pointer">
                          <Toggle on={item.is_featured} />
                        </button>
                      </div>
                      <div className="w-[70px] font-['JetBrains_Mono'] font-bold text-[var(--app-text)] text-[12px]">â€”</div>
                      <div className="w-[70px] flex items-center justify-end gap-[10px]">
                        <ActionBtn onClick={() => setEditContentItem(item)} title="Edit" icon={<EditIcon />} />
                        <ActionBtn onClick={() => handleDeleteContent(item)} title="Delete" icon={<Trash2 size={15} strokeWidth={1.8} />} />
                      </div>
                    </TableRow>
                  );
                })}
                {!contentLoading && !isLiterature && content.length === 0 && (
                  <div className="py-[48px] text-center">
                    <p className="font-['Figtree'] text-[var(--app-muted)] text-[14px]">No content matches this filter.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <TableHead cols={[
                  { label: "CONTENT", w: "flex-1 min-w-[220px]" },
                  { label: "CATEGORY", w: "w-[140px]" },
                  { label: "FEATURED", w: "w-[100px]" },
                  { label: "UPLOADED", w: "w-[130px]" },
                  { label: "ACTIONS", w: "w-[70px] text-right" },
                ]} />
                {literatureLoading && (
                  <div className="py-[48px] text-center">
                    <p className="font-['Figtree'] text-[var(--app-muted)] text-[14px]">Loading literature...</p>
                  </div>
                )}
                {!literatureLoading && literature.map((item) => (
                  <TableRow key={item.id}>
                    <div className="flex items-center gap-[10px] flex-1 min-w-[220px]">
                      <div className="w-[32px] h-[32px] rounded-full bg-[rgba(183,163,110,0.2)] flex items-center justify-center flex-shrink-0">
                        <BookIcon color="#b7a36e" />
                      </div>
                      <p className="font-['Figtree'] font-semibold text-[var(--app-text)] text-[13px]">{item.title}</p>
                    </div>
                    <div className="w-[140px]">
                      <span className="inline-flex px-[8px] py-[3px] rounded-[4px] bg-[rgba(183,163,110,0.15)] font-['JetBrains_Mono'] font-bold text-[10px] text-[#b7a36e]">
                        {item.category.toUpperCase()}
                      </span>
                    </div>
                    <div className="w-[100px]">
                      <button onClick={() => handleToggleLiteratureFeatured(item)} className="cursor-pointer">
                        <Toggle on={item.is_featured} />
                      </button>
                    </div>
                    <div className="w-[130px] font-['JetBrains_Mono'] font-normal text-[var(--app-muted)] text-[11px]">
                      {new Date(item.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                    <div className="w-[70px] flex items-center justify-end gap-[10px]">
                      <ActionBtn onClick={() => setEditLiteratureItem(item)} title="Edit" icon={<EditIcon />} />
                      <ActionBtn onClick={() => handleDeleteLiterature(item)} title="Delete" icon={<Trash2 size={15} strokeWidth={1.8} />} />
                    </div>
                  </TableRow>
                ))}
                {!literatureLoading && literature.length === 0 && (
                  <div className="py-[48px] text-center">
                    <p className="font-['Figtree'] text-[var(--app-muted)] text-[14px]">No literature uploaded yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </TableCard>
        <div className="flex items-center justify-between border-t border-[var(--app-border)] px-[13px] py-[10px]">
          <span className="font-['JetBrains_Mono'] text-[8px] text-[var(--app-muted)]">
            Page {isLiterature ? literaturePage : contentPage} Â· {isLiterature ? literatureTotal : contentTotal} total
          </span>
          <div className="flex items-center gap-[4px]">
            <button type="button" aria-label="Previous page" onClick={() => isLiterature ? setLiteraturePage((value) => Math.max(1, value - 1)) : setContentPage((value) => Math.max(1, value - 1))} disabled={isLiterature ? !literatureHasPrev || literatureLoading : !contentHasPrev || contentLoading} className="flex h-[26px] w-[26px] items-center justify-center rounded-[5px] border border-[var(--app-border)] text-[var(--app-muted)] disabled:opacity-30"><ChevronLeft size={13} /></button>
            <span className="flex h-[26px] min-w-[26px] items-center justify-center rounded-[5px] bg-[#f37422] px-[7px] font-['JetBrains_Mono'] text-[9px] font-bold text-[#15110e]">{isLiterature ? literaturePage : contentPage}</span>
            <button type="button" aria-label="Next page" onClick={() => isLiterature ? setLiteraturePage((value) => value + 1) : setContentPage((value) => value + 1)} disabled={isLiterature ? !literatureHasNext || literatureLoading : !contentHasNext || contentLoading} className="flex h-[26px] w-[26px] items-center justify-center rounded-[5px] border border-[var(--app-border)] text-[var(--app-muted)] disabled:opacity-30"><ChevronRight size={13} /></button>
          </div>
        </div>
        {editContentItem && (
          <EditContentModal
            item={editContentItem}
            onClose={() => setEditContentItem(null)}
            onSaved={bumpContentVersion}
          />
        )}
        {editLiteratureItem && (
          <EditLiteratureModal
            item={editLiteratureItem}
            onClose={() => setEditLiteratureItem(null)}
            onSaved={bumpLiteratureVersion}
          />
        )}
        {importModalOpen && <ExcelImportModal title="Load In-App Resources" subtitle="Super Admin · UAT Only" actionLabel="Load Resources" helperText="All resource fields included" templateHeaders={RESOURCE_IMPORT_HEADERS} templateFilename="torch-resource-library-template.xlsx" onClose={() => setImportModalOpen(false)} onUpload={handleImport} />}
      </div>
    </div>
  );
}
