import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Trash2 } from "lucide-react";
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
  createContentItem,
  updateContentItem,
  deleteContentItem,
  deleteContentItems,
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
  type ContentQuery,
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
  Literature: { bg: "rgba(183,163,110,0.15)", color: "#b7a36e" },
  Books: { bg: "rgba(183,163,110,0.15)", color: "#b7a36e" },
};

const LIBRARY_CATEGORY_TABS = [
  "All",
  "Meditation",
  "Mental Health",
  "Emotional Regulation",
  "Sleep",
  "Spirituality",
  "Unassigned",
  "Yoga",
  "Trauma",
  "Family & Relationships",
  "Books",
  "In-App Literature",
];

const CONTENT_IMPORT_HEADERS = [
  "#", "Resource", "Source", "URL", "Original Section", "Primary Category", "Also Appears In",
  "Tag 1", "Tag 2", "Tag 3", "Tag 4", "Tag 5", "All Tags", "status",
] as const;

const LIBRARY_CATEGORY_MAP: Record<string, ContentCategory> = {
  meditation: "meditation",
  cravings: "stress_relief",
  "mental health": "mental_health",
  "emotional regulation": "stress_relief",
  sleep: "self_care",
  spirituality: "spirituality",
  unassigned: "self_care",
  yoga: "yoga",
  trauma: "trauma",
  "family & relationships": "self_care",
};

function mapLibraryCategory(value: string): ContentCategory {
  const normalized = value.trim().toLowerCase();
  return LIBRARY_CATEGORY_MAP[normalized] ?? "self_care";
}

function mapImportedCategory(primaryCategory: string, section: string): ContentCategory {
  if (primaryCategory.trim().toLowerCase() === "cravings") return "meditation";
  const normalizedSection = section.trim().toLowerCase();
  if (normalizedSection.startsWith("meditation")) return "meditation";
  if (normalizedSection === "books") return "books";
  if (normalizedSection === "in-app literature") return "literature";
  return mapLibraryCategory(primaryCategory);
}

function inferLibraryContentType(url: string, section: string, title: string): ContentType {
  const value = `${url} ${section} ${title}`.toLowerCase();
  if (value.includes("podcast")) return "podcast";
  if (value.includes("youtube") || value.includes("video")) return "video";
  if (value.includes("meditation") || value.includes("guided practice")) return "meditation";
  return "text";
}

function normalizeImportStatus(value: string): ContentStatus {
  const normalized = normalizeCsvValue(value, "draft");
  if (normalized === "pending") return "review";
  if (normalized === "active") return "published";
  return CONTENT_STATUSES.includes(normalized as ContentStatus)
    ? normalized as ContentStatus
    : "draft";
}

function libraryDescription(row: Record<string, string>): string {
  const details = [
    row["Primary Category"] && `Primary Category: ${row["Primary Category"]}`,
    row["Also Appears In"] && `Also Appears In: ${row["Also Appears In"]}`,
    row["Original Section"] && `Section: ${row["Original Section"]}`,
    row["Source"] && `Source: ${row["Source"]}`,
    row["All Tags"] && `Tags: ${row["All Tags"]}`,
  ].filter(Boolean);
  return details.join(" · ");
}

function matchesLibraryCategory(item: ApiContentItem, category: string): boolean {
  const searchText = `${item.description} ${item.topic} ${item.emotion}`.toLowerCase();
  const normalized = category.toLowerCase();
  const primary = searchText.match(/primary category:\s*([^·]+)/i)?.[1] ?? "";
  const alsoAppearsIn = searchText.match(/also appears in:\s*([^·]+)/i)?.[1] ?? "";
  const section = searchText.match(/section:\s*([^·]+)/i)?.[1] ?? "";
  if (normalized === "meditation" && primary.trim() === "cravings") return true;
  if (normalized === "meditation" && section.toLowerCase().startsWith("meditation")) return true;
  if (normalized === "books" && section.trim() === "books") return true;
  if (normalized === "in-app literature" && section.trim() === "in-app literature") return true;
  const categories = `${primary},${alsoAppearsIn},${section}`
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return categories.includes(normalized) || item.category === LIBRARY_CATEGORY_MAP[normalized];
}

function getLibraryPrimaryCategory(item: ApiContentItem): string {
  const match = item.description.match(/Primary Category:\s*([^·]+)/i);
  const primary = match?.[1]?.trim() || "";
  const section = item.description.match(/Section:\s*([^·]+)/i)?.[1]?.trim() || "";
  if (primary.toLowerCase() === "cravings" || section.toLowerCase().startsWith("meditation")) return "Meditation";
  if (section === "Books" || section === "In-App Literature") return section;
  return primary || CONTENT_CATEGORY_LABELS[item.category] || toTitleCase(item.category);
}

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

async function downloadThumbnail(url: string, title: string): Promise<File> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`thumbnail could not be downloaded (${response.status})`);
  const blob = await response.blob();
  if (!blob.type.startsWith("image/")) throw new Error("thumbnail must be an image URL");
  const extension = blob.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  const filename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "thumbnail"}.${extension}`;
  return new File([blob], filename, { type: blob.type });
}

function EditContentModal({ item, onClose, onSaved }: { item: ApiContentItem; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(item.title);
  const [creator, setCreator] = useState(item.creator || "");
  const [contentType, setContentType] = useState<ContentType>(item.content_type);
  const [category, setCategory] = useState<ContentCategory>(item.category);
  const [difficulty, setDifficulty] = useState<ContentDifficulty>((item.difficulty_level || "beginner") as ContentDifficulty);
  const [topic, setTopic] = useState(item.topic || "");
  const [emotion, setEmotion] = useState(item.emotion || "");
  const [mediaUrl, setMediaUrl] = useState(item.media_url || "");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [bookUrl, setBookUrl] = useState(item.book_url || "");
  const [minutes, setMinutes] = useState(String(Math.floor((item.duration_seconds || 0) / 60)));
  const [seconds, setSeconds] = useState(String((item.duration_seconds || 0) % 60));
  const [description, setDescription] = useState(item.description || "");
  const [status, setStatus] = useState<ContentStatus>(item.status);
  const [featured, setFeatured] = useState(item.is_featured);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    const isBook = category === "literature" || category === "books";
    if (isBook && bookUrl.trim() && !/^https?:\/\//i.test(bookUrl.trim())) {
      setError("Book Website URL must start with http:// or https://.");
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
        ...(thumbnail ? { thumbnail } : {}),
        ...(contentFile ? { content_file: contentFile } : {}),
        ...(isBook && bookUrl.trim() ? { book_url: bookUrl.trim() } : {}),
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
                    onChange={(label) => setContentType(CONTENT_TYPES.find((t) => CONTENT_TYPE_LABELS[t] === label) ?? "text")}
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
            <SectionLabel label="Media & Files" />
            <FormField label="Media URL (Optional)"><TextInput value={mediaUrl} onChange={setMediaUrl} /></FormField>
            {(category === "literature" || category === "books") && (
              <>
                <FormField label="Book Website URL">
                  <TextInput type="url" name="book_url" placeholder="https://example.com/book" value={bookUrl} onChange={setBookUrl} />
                </FormField>
                <p className="font-['Figtree'] text-[12px] text-[var(--app-muted)] -mt-[8px]">If a PDF is not available, add the book’s website link instead.</p>
              </>
            )}
            <div className="flex gap-[16px] flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <FormField label="Thumbnail / Cover">
                  <FileDropzone label={item.thumbnail ? "Replace Thumbnail" : "Upload Thumbnail"} file={thumbnail} onChange={setThumbnail} accept="image/*" compact />
                </FormField>
              </div>
              <div className="flex-1 min-w-[200px]">
                <FormField label="PDF / Document File">
                  <FileDropzone label={item.content_file ? "Replace File" : "Upload File"} hint="PDF or Document · Max 50MB" file={contentFile} onChange={setContentFile} accept="application/pdf" compact />
                </FormField>
              </div>
              <div className="w-[140px]">
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

export function ResourcesAppPage() {
  const {
    setModal,
    contentVersion,
    bumpContentVersion,
  } = useAppContext();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");
  const [contentPage, setContentPage] = useState(1);
  const [contentTotal, setContentTotal] = useState(0);
  const [contentHasNext, setContentHasNext] = useState(false);
  const [contentHasPrev, setContentHasPrev] = useState(false);
  const [editContentItem, setEditContentItem] = useState<ApiContentItem | null>(null);

  const [content, setContent] = useState<ApiContentItem[]>([]);
  const [contentLoading, setContentLoading] = useState(true);
  const [contentError, setContentError] = useState<string | null>(null);
  const [stats, setStats] = useState<ContentStats | null>(null);

  const [actionError, setActionError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleteSelectionOpen, setDeleteSelectionOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedItems = useMemo(
    () => content.filter((item) => selectedIds.has(item.id)),
    [content, selectedIds],
  );
  const allVisibleSelected = content.length > 0 && selectedItems.length === content.length;

  useEffect(() => {
    let cancelled = false;
    setContentLoading(true);
    setContentError(null);

    const query: ContentQuery = {
      search,
      page_size: 100,
    };

    if (activeStatus === "Featured") {
      query.is_featured = true;
    } else if (activeStatus === "New") {
      query.ordering = "-created_at";
    } else if (activeStatus !== "All") {
      query.status = activeStatus.toLowerCase();
    }

    const loadAllContent = async () => {
      const results: ApiContentItem[] = [];
      let page = 1;
      let hasNext = true;

      while (hasNext && !cancelled) {
        const response = await listContent({ ...query, page });
        results.push(...response.results);
        hasNext = Boolean(response.next);
        page += 1;
      }

      if (cancelled) return;
      const filtered = activeCategory === "All"
        ? results
        : results.filter((item) => matchesLibraryCategory(item, activeCategory));
      setContent(filtered);
      setContentTotal(filtered.length);
      setContentHasNext(false);
      setContentHasPrev(false);
      setSelectedIds(new Set());
    };

    loadAllContent()
      .catch((err) => {
        if (!cancelled) setContentError(err instanceof ApiError ? err.message : "Unable to load content.");
      })
      .finally(() => {
        if (!cancelled) setContentLoading(false);
      });

    getContentStats({})
      .then((response) => {
        if (!cancelled) setStats(response);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [contentVersion, search, contentPage, activeCategory, activeStatus]);

  useEffect(() => {
    setContentPage(1);
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
    setSelectedIds(new Set([item.id]));
    setDeleteSelectionOpen(true);
  };

  const handleConfirmDelete = async () => {
    const ids = [...selectedIds];
    if (!ids.length) return;
    setActionError(null);
    setDeleting(true);
    try {
      const result = ids.length === 1
        ? await deleteContentItem(ids[0]).then(() => ({ deleted: 1 }))
        : await deleteContentItems(ids);
      setDeleteSelectionOpen(false);
      setSelectedIds(new Set());
      setSuccessMessage(`${result.deleted} resource${result.deleted === 1 ? "" : "s"} deleted successfully. They are no longer available in the app.`);
      bumpContentVersion();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Unable to delete content.");
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelected = (id: number) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAllSelected = () => {
    setSelectedIds(allVisibleSelected ? new Set() : new Set(content.map((item) => item.id)));
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
        const title = csvValue(row, "Resource", "resource", "title", "name");
        const mediaUrl = csvValue(row, "URL", "url", "media_url", "link");
        const thumbnailUrl = csvValue(row, "thumbnail", "thumbnail_url");
        const source = csvValue(row, "Source", "source", "creator", "author", "provider");
        const section = csvValue(row, "Original Section", "original_section", "topic");
        const primaryCategory = csvValue(row, "Primary Category", "primary_category", "category");
        if (!title) {
          errors.push(`Row ${rowNumber}: title is required.`);
          continue;
        }
        try {
          const suppliedType = normalizeCsvValue(csvValue(row, "content_type", "type"), "");
          const contentType = suppliedType || inferLibraryContentType(mediaUrl, section, title);
          const category = mapImportedCategory(primaryCategory, section);
          const difficulty = normalizeCsvValue(csvValue(row, "difficulty_level", "difficulty"), "");
          const status = normalizeImportStatus(csvValue(row, "status", "Status"));
          await createContentItem({
            title,
            creator: source,
            description: csvValue(row, "description", "details") || libraryDescription(row),
            content_type: (CONTENT_TYPES.includes(contentType as typeof CONTENT_TYPES[number]) ? contentType : "text") as ContentType,
            category: (CONTENT_CATEGORIES.includes(category as typeof CONTENT_CATEGORIES[number]) ? category : "self_care") as ContentCategory,
            topic: section,
            emotion: csvValue(row, "emotion"),
            difficulty_level: CONTENT_DIFFICULTIES.includes(difficulty as typeof CONTENT_DIFFICULTIES[number]) ? difficulty as ContentDifficulty : "",
            media_url: mediaUrl,
            ...(thumbnailUrl ? { thumbnail: await downloadThumbnail(thumbnailUrl, title) } : {}),
            duration_seconds: csvDuration(csvValue(row, "duration_seconds", "duration")),
            is_featured: csvBoolean(csvValue(row, "is_featured", "featured")),
            status,
          });
          created += 1;
        } catch (error) {
          errors.push(`Row ${rowNumber}: ${error instanceof ApiError ? error.message : "could not be created."}`);
        }
      }
      setImportMessage(`Imported ${created} of ${rows.length} rows${errors.length ? `; ${errors.length} failed.` : "."}`);
      if (errors.length) setActionError(errors.slice(0, 3).join(" · "));
      if (created) bumpContentVersion();
      setImportModalOpen(false);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to import content.");
      return false;
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex-1 min-w-0 overflow-y-auto">
      <div className="p-[24px] lg:p-[32px] flex flex-col gap-[20px]">
        <PageHeader
          eyebrow={stats ? `CONTENT · ${stats.total_content} ITEMS · ${stats.total_plays.toLocaleString()} TOTAL PLAYS` : "LOADING CONTENT..."}
          title="In-App Resources"
        >
          <SearchBox placeholder="Search resources..." value={search} onChange={setSearch} />
          <PrimaryBtn label={importing ? "Uploading..." : "Upload Excel"} onClick={() => !importing && setImportModalOpen(true)} />
          <PrimaryBtn label="+ Add Content" onClick={() => setModal("add-content")} />
        </PageHeader>

        {contentError && <p className="font-['Figtree'] text-[13px] text-red-500">{contentError}</p>}
        {actionError && <p className="font-['Figtree'] text-[13px] text-red-500">{actionError}</p>}
        {importMessage && <p className="font-['Figtree'] text-[13px] text-[#35d47b]">{importMessage}</p>}
        {successMessage && (
          <div className="flex items-center justify-between rounded-[10px] border border-[#1d6b41] bg-[rgba(20,92,51,0.16)] px-[16px] py-[13px] font-['Figtree'] text-[13px] text-[var(--app-text)]">
            <span><span className="mr-[10px] text-[#35d47b]">✓</span>{successMessage}</span>
            <button type="button" aria-label="Dismiss message" onClick={() => setSuccessMessage(null)} className="text-[var(--app-muted)] hover:text-[var(--app-text)]">×</button>
          </div>
        )}

        <div className="flex gap-[10px] flex-wrap">
          <MetricCard label="TOTAL CONTENT" value={stats ? String(stats.total_content) : "-"} delta="Live from server" deltaColor="#8a8073" accentColor="#f37422" />
          <MetricCard label="TOTAL PLAYS" value={stats ? stats.total_plays.toLocaleString() : "-"} delta="Live from server" deltaColor="#8a8073" accentColor="#4ade80" />
          <MetricCard label="AVG COMPLETION" value={stats ? `${stats.avg_completion}%` : "-"} delta="Live from server" deltaColor="#8a8073" accentColor="#6b8ab0" />
          <MetricCard label="PUBLISHED" value={stats ? String(stats.published_count) : "-"} delta="Live from server" deltaColor="#8a8073" accentColor="#facc15" />
        </div>

        <div className="rounded-[10px] border border-[var(--app-border)] bg-[var(--app-surface)] p-[6px]">
          <div className="grid grid-cols-2 gap-[4px] sm:grid-cols-3 lg:grid-cols-6">
            {LIBRARY_CATEGORY_TABS.map((tab) => {
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
            {["Featured", "New", "Published", "Draft", "Review", "Archived"].map((status) => (
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
                Sort by: Plays ↓
              </button>
            </div>
          </div>
        </div>

        <TableCard>
          {selectedItems.length > 0 && (
            <div className="flex items-center justify-between border-b border-[var(--app-border)] bg-[rgba(243,116,34,0.08)] px-[16px] py-[10px]">
              <div className="flex items-center gap-[16px] font-['Figtree'] text-[12px] text-[var(--app-text)]">
                <span className="font-semibold">{selectedItems.length} selected</span>
                <button type="button" onClick={() => setSelectedIds(new Set())} className="text-[var(--app-muted)] hover:text-[var(--app-text)]">Clear selection</button>
                {!allVisibleSelected && <button type="button" onClick={() => setSelectedIds(new Set(content.map((item) => item.id)))} className="text-[#f37422] hover:underline">Select all {content.length} resources</button>}
              </div>
              <button type="button" onClick={() => setDeleteSelectionOpen(true)} className="rounded-[10px] bg-[#ef4444] px-[22px] py-[10px] font-['Figtree'] text-[12px] font-semibold text-white hover:bg-[#dc2626]">Delete selected</button>
            </div>
          )}
          <div className="overflow-x-auto">
            <div className="min-w-[860px]">
              <TableHead cols={[
                { label: <button type="button" aria-label="Select all resources" onClick={toggleAllSelected} className="flex items-center"><input type="checkbox" tabIndex={-1} readOnly checked={allVisibleSelected} ref={(input) => { if (input) input.indeterminate = selectedItems.length > 0 && !allVisibleSelected; }} className="h-[16px] w-[16px] accent-[#f37422] cursor-pointer" /></button>, w: "w-[52px]" },
                { label: "CONTENT", w: "flex-1 min-w-[220px]" },
                { label: "TYPE", w: "w-[110px]" },
                { label: "CATEGORY", w: "w-[110px]" },
                { label: "DIFFICULTY", w: "w-[110px]" },
                { label: "DURATION / FILE", w: "w-[110px]" },
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
              {!contentLoading && content.map((item) => {
                const typeLabel = toTitleCase(item.content_type);
                const tc = CONTENT_TYPE_COLORS[typeLabel] ?? CONTENT_TYPE_COLORS[toTitleCase(item.category)] ?? { bg: "rgba(138,128,115,0.15)", color: "#8a8073" };
                const isDoc = item.category === "literature" || item.category === "books";
                return (
                  <TableRow key={item.id}>
                    <div className="w-[52px] flex-shrink-0">
                      <input type="checkbox" aria-label={`Select ${item.title}`} checked={selectedIds.has(item.id)} onChange={() => toggleSelected(item.id)} className="h-[16px] w-[16px] accent-[#f37422] cursor-pointer" />
                    </div>
                    <div className="flex items-center gap-[10px] flex-1 min-w-[220px]">
                      <div className="w-[32px] h-[32px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: tc.bg }}>
                        {typeLabel === "Audio" && <MicIcon color={tc.color} />}
                        {typeLabel === "Video" && <VideoIcon color={tc.color} />}
                        {typeLabel === "Meditation" && <SparklesIcon color={tc.color} />}
                        {isDoc && <BookIcon color={tc.color} />}
                        {!["Audio", "Video", "Meditation"].includes(typeLabel) && !isDoc && <FileIcon color={tc.color} />}
                      </div>
                      <div>
                        <p className="font-['Figtree'] font-semibold text-[var(--app-text)] text-[13px] leading-tight">{item.title}</p>
                        <div className="flex items-center gap-[6px] mt-[2px]">
                          <span className="font-['JetBrains_Mono'] font-normal text-[var(--app-muted)] text-[9px] leading-tight">{item.creator || "-"}</span>
                          {item.content_file && (
                            <a href={item.content_file} target="_blank" rel="noopener noreferrer" className="font-['JetBrains_Mono'] text-[9px] text-[#f37422] hover:underline flex items-center gap-[2px]">
                              📄 PDF
                            </a>
                          )}
                          {item.book_url && (item.category === "literature" || item.category === "books") && (
                            <>
                              <span className="max-w-[120px] truncate font-['JetBrains_Mono'] text-[9px] text-[var(--app-muted)]" title={item.book_url}>{item.book_url}</span>
                              <a href={item.book_url} target="_blank" rel="noopener noreferrer" className="font-['JetBrains_Mono'] text-[9px] text-[#f37422] hover:underline flex items-center gap-[2px]">
                                <ExternalLink size={10} /> Open Book
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="w-[110px]">
                      <span className="inline-flex px-[8px] py-[3px] rounded-[4px] font-['JetBrains_Mono'] font-bold text-[10px]" style={{ background: tc.bg, color: tc.color }}>
                        {typeLabel.toUpperCase()}
                      </span>
                    </div>
                    <div className="w-[110px] font-['JetBrains_Mono'] font-normal text-[var(--app-muted)] text-[11px]">{getLibraryPrimaryCategory(item)}</div>
                    <div className="w-[110px] font-['Figtree'] font-normal text-[var(--app-text)] text-[12px]">{item.difficulty_level ? toTitleCase(item.difficulty_level) : "-"}</div>
                    <div className="w-[110px] font-['JetBrains_Mono'] font-normal text-[var(--app-muted)] text-[11px] truncate" title={item.content_file ? decodeURIComponent(item.content_file.split("/").pop() || "") : undefined}>
                      {item.content_file
                        ? decodeURIComponent(item.content_file.split("/").pop() || "Document File")
                        : item.duration_minutes && item.duration_minutes !== "0:00"
                        ? item.duration_minutes
                        : "-"}
                    </div>
                    <div className="w-[100px]"><StatusPill status={toDisplayStatus(item.status)} /></div>
                    <div className="w-[90px]">
                      <button onClick={() => handleToggleContentFeatured(item)} className="cursor-pointer">
                        <Toggle on={item.is_featured} />
                      </button>
                    </div>
                    <div className="w-[70px] font-['JetBrains_Mono'] font-bold text-[var(--app-text)] text-[12px]">-</div>
                    <div className="w-[70px] flex items-center justify-end gap-[10px]">
                      <ActionBtn onClick={() => setEditContentItem(item)} title="Edit" icon={<EditIcon />} />
                      <ActionBtn onClick={() => handleDeleteContent(item)} title="Delete" icon={<Trash2 size={15} strokeWidth={1.8} />} />
                    </div>
                  </TableRow>
                );
              })}
              {!contentLoading && content.length === 0 && (
                <div className="py-[48px] text-center">
                  <p className="font-['Figtree'] text-[var(--app-muted)] text-[14px]">No content matches this filter.</p>
                </div>
              )}
            </div>
          </div>
        </TableCard>
        <div className="flex items-center justify-between border-t border-[var(--app-border)] px-[13px] py-[10px]">
          <span className="font-['JetBrains_Mono'] text-[8px] text-[var(--app-muted)]">
            Page {contentPage} · {contentTotal} total
          </span>
          <div className="flex items-center gap-[4px]">
            <button type="button" aria-label="Previous page" onClick={() => setContentPage((value) => Math.max(1, value - 1))} disabled={!contentHasPrev || contentLoading} className="flex h-[26px] w-[26px] items-center justify-center rounded-[5px] border border-[var(--app-border)] text-[var(--app-muted)] disabled:opacity-30"><ChevronLeft size={13} /></button>
            <span className="flex h-[26px] min-w-[26px] items-center justify-center rounded-[5px] bg-[#f37422] px-[7px] font-['JetBrains_Mono'] text-[9px] font-bold text-[#15110e]">{contentPage}</span>
            <button type="button" aria-label="Next page" onClick={() => setContentPage((value) => value + 1)} disabled={!contentHasNext || contentLoading} className="flex h-[26px] w-[26px] items-center justify-center rounded-[5px] border border-[var(--app-border)] text-[var(--app-muted)] disabled:opacity-30"><ChevronRight size={13} /></button>
          </div>
        </div>
        {editContentItem && (
          <EditContentModal
            item={editContentItem}
            onClose={() => setEditContentItem(null)}
            onSaved={bumpContentVersion}
          />
        )}
        {deleteSelectionOpen && selectedItems.length > 0 && (
          <ModalOverlay onClose={() => !deleting && setDeleteSelectionOpen(false)}>
            <ModalCard className="w-[520px] max-w-[calc(100vw-32px)]">
              <div className="mb-[22px] flex items-start justify-between">
                <div>
                  <div className="mb-[14px] flex h-[42px] w-[42px] items-center justify-center rounded-[12px] bg-[rgba(243,116,34,0.15)] text-[#f37422]"><Trash2 size={20} /></div>
                  <p className="font-['Figtree'] text-[24px] font-bold text-[var(--app-text)]">Delete {selectedItems.length} resource{selectedItems.length === 1 ? "" : "s"}?</p>
                  <p className="mt-[8px] font-['Figtree'] text-[13px] leading-[1.4] text-[var(--app-muted)]">These resources will be removed from the app. This action cannot be undone.</p>
                </div>
                <button type="button" disabled={deleting} onClick={() => setDeleteSelectionOpen(false)} className="text-[22px] text-[var(--app-muted)] hover:text-[var(--app-text)]">×</button>
              </div>
              <div className="max-h-[180px] overflow-y-auto rounded-[10px] bg-[var(--app-bg)] px-[14px] py-[12px]">
                <p className="mb-[8px] font-['JetBrains_Mono'] text-[10px] font-bold uppercase text-[var(--app-muted)]">{selectedItems.length} selected resources</p>
                {selectedItems.slice(0, 8).map((item) => <div key={item.id} className="flex items-center gap-[8px] py-[4px] font-['Figtree'] text-[13px] text-[var(--app-text)]"><FileIcon color="#8a8073" />{item.title}</div>)}
                {selectedItems.length > 8 && <p className="pt-[5px] font-['Figtree'] text-[12px] text-[var(--app-muted)]">+ {selectedItems.length - 8} more</p>}
              </div>
              <div className="mt-[22px] flex justify-end gap-[10px]">
                <button type="button" disabled={deleting} onClick={() => setDeleteSelectionOpen(false)} className="rounded-[10px] border border-[var(--app-border)] px-[20px] py-[10px] font-['Figtree'] text-[12px] text-[var(--app-muted)]">Cancel</button>
                <button type="button" disabled={deleting} onClick={handleConfirmDelete} className="rounded-[10px] bg-[#f37422] px-[20px] py-[10px] font-['Figtree'] text-[12px] font-semibold text-white disabled:opacity-60">{deleting ? "Deleting..." : `Delete ${selectedItems.length} resource${selectedItems.length === 1 ? "" : "s"}`}</button>
              </div>
            </ModalCard>
          </ModalOverlay>
        )}
      </div>
      {importModalOpen && (
        <ExcelImportModal
          title="Load In-App Resources"
          subtitle="Super Admin · UAT Only"
          actionLabel="Load Resources"
          helperText="Use the library columns plus status: draft, review/pending, published, or archived"
          templateHeaders={CONTENT_IMPORT_HEADERS}
          templateFilename="torch-in-app-resources-template.xlsx"
          templateUrl="/torch-in-app-resources-template.xlsx"
          onClose={() => setImportModalOpen(false)}
          onUpload={handleImport}
        />
      )}
    </div>
  );
}
