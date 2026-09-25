import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { useAppContext } from "@/app/app-context";
import { AddResourceModal } from "@/components/modals";
import { PageHeader } from "@/components/common/PageHeader";
import { PrimaryBtn } from "@/components/common/Buttons";
import { SearchBox } from "@/components/common/SearchBox";
import { MetricCard } from "@/components/common/MetricCard";
import { TableCard, TableHead, TableRow } from "@/components/common/Table";
import { Toggle } from "@/components/common/Toggle";
import { ActionBtn } from "@/components/common/ActionBtn";
import { Thumbnail } from "@/components/common/Thumbnail";
import { ApiError } from "@/lib/api";
import { getResourceStats, importResources, listResources, updateResource, deleteResource, type ApiResource, type ResourceStats } from "@/lib/resources";
import { ExcelImportModal } from "@/components/common/ExcelImportModal";
import { excelRowsToCsvFile, readExcelRows } from "@/lib/excel";

function toTitleCase(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatLabel(value?: string | null): string {
  return value ? toTitleCase(value) : "—";
}

const RESOURCE_IMPORT_HEADERS = [
  "category", "sub_category", "title", "subtitle", "description", "organization",
  "url", "phone", "email", "thumbnail", "thumbnail_url", "tags", "venue",
  "street_address", "address_line_2", "city", "county", "state", "zip_code", "country",
  "latitude", "longitude", "day", "start_time", "end_time", "delivery_format",
  "meeting_type", "audience", "language", "meeting_id", "meeting_password", "is_open",
  "is_accessible", "status", "is_featured", "is_active", "order", "published_at",
  "created_at", "updated_at",
] as const;

export function RealWorldResourcesPage() {
  const { resourcesVersion, bumpResourcesVersion } = useAppContext();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [totalResources, setTotalResources] = useState(0);
  const [stats, setStats] = useState<ResourceStats | null>(null);
  const [resources, setResources] = useState<ApiResource[]>([]);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ApiResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listResources({ search, page, page_size: 10 })
      .then((response) => {
        if (!cancelled) {
          setResources(response.results);
          setTotalResources(response.count);
          setHasNext(Boolean(response.next));
          setHasPrev(Boolean(response.previous));
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Unable to load resources.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    getResourceStats().then(setStats).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [resourcesVersion, search, page]);

  useEffect(() => setPage(1), [search]);

  const handleToggleFeatured = async (item: ApiResource) => {
    setActionError(null);
    try {
      await updateResource(item.id, { is_featured: !item.is_featured });
      setResources((current) => current.map((resource) =>
        resource.id === item.id
          ? { ...resource, is_featured: !item.is_featured }
          : resource
      ));
      bumpResourcesVersion();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Unable to update resource.");
    }
  };

  const handleDelete = async (item: ApiResource) => {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    setActionError(null);
    try {
      await deleteResource(item.id);
      bumpResourcesVersion();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Unable to delete resource.");
    }
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    setImportMessage(null);
    setActionError(null);
    try {
      const result = await importResources(file);
      setImportMessage(`Imported ${result.created} resources${result.failed ? `; ${result.failed} rows failed.` : "."}`);
      if (result.errors?.length) setActionError(result.errors.slice(0, 3).map((item) => `Row ${item.row ?? "?"}: ${item.message}`).join(" · "));
      bumpResourcesVersion();
      setImportModalOpen(false);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Unable to import resources.");
      return false;
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex-1 min-w-0 overflow-y-auto">
      <div className="p-[24px] lg:p-[32px] flex flex-col gap-[20px]">
        <PageHeader eyebrow={stats ? `RESOURCES · ${stats.count} TOTAL · ${stats.category_count} CATEGORIES · ${stats.active_count} ACTIVE` : "RESOURCES"} title="Real World Resources">
          <SearchBox placeholder="Search resources..." value={search} onChange={setSearch} />
          <PrimaryBtn label={importing ? "Uploading..." : "Upload Excel"} onClick={() => !importing && setImportModalOpen(true)} />
          <PrimaryBtn
            label="+ Add Resource"
            onClick={() => {
              setEditingResource(null);
              setResourceModalOpen(true);
            }}
          />
        </PageHeader>

        {error && <p className="font-['Figtree'] text-[13px] text-red-500">{error}</p>}
        {actionError && <p className="font-['Figtree'] text-[13px] text-red-500">{actionError}</p>}
        {importMessage && <p className="font-['Figtree'] text-[13px] text-[#35d47b]">{importMessage}</p>}

        <div className="flex gap-[10px] flex-wrap">
          <MetricCard label="TOTAL RESOURCES" value={stats ? String(stats.count) : "—"} delta="Live from server" deltaColor="#8a8073" accentColor="#f37422" />
          <MetricCard label="ACTIVE" value={stats ? String(stats.active_count) : "—"} delta="Currently listed" deltaColor="#8a8073" accentColor="#4ade80" />
          <MetricCard label="CATEGORIES" value={stats ? String(stats.category_count) : "—"} delta="Live from server" deltaColor="#8a8073" accentColor="#6b8ab0" />
          <MetricCard label="PENDING REVIEW" value={stats ? String(stats.pending_count) : "—"} delta="Awaiting review" deltaColor="#8a8073" accentColor="#facc15" />
        </div>

        <TableCard>
          <div className="overflow-x-auto">
            <div className="min-w-[840px]">
              <TableHead cols={[
                { label: "RESOURCE", w: "flex-1 min-w-[220px]" },
                { label: "TYPE", w: "w-[140px]" },
                { label: "CATEGORY", w: "w-[160px]" },
                { label: "URL", w: "w-[160px]" },
                { label: "FEATURED", w: "w-[100px]" },
                { label: "ACTIONS", w: "w-[70px] text-right" },
              ]} />
              {loading && (
                <div className="py-[48px] text-center">
                  <p className="font-['Figtree'] text-[var(--app-muted)] text-[14px]">Loading resources...</p>
                </div>
              )}
              {!loading && resources.map((item) => (
                <TableRow key={item.id}>
                  <div className="flex items-center gap-[10px] flex-1 min-w-[220px]">
                    <Thumbnail url={item.thumbnail} alt={`${item.title} thumbnail`} />
                    <p className="font-['Figtree'] font-semibold text-[var(--app-text)] text-[13px]">{item.title}</p>
                  </div>
                  <div className="w-[140px] font-['Figtree'] font-normal text-[var(--app-text)] text-[12px]">
                    {formatLabel(item.format || item.delivery_format)}
                  </div>
                  <div className="w-[160px]">
                    <span className="inline-flex px-[8px] py-[3px] rounded-[4px] bg-[rgba(107,138,176,0.15)] font-['JetBrains_Mono'] font-bold text-[10px] text-[#6b8ab0]">
                      {(item.category_display || toTitleCase(item.category)).toUpperCase()}
                    </span>
                  </div>
                  <div className="w-[160px] font-['JetBrains_Mono'] font-normal text-[var(--app-muted)] text-[11px] truncate">
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noreferrer" className="hover:text-[#f37422] transition-colors">
                        {item.url.replace(/^https?:\/\//, "")}
                      </a>
                    ) : (
                      "—"
                    )}
                  </div>
                  <div className="w-[100px]">
                    <button onClick={() => handleToggleFeatured(item)} className="cursor-pointer">
                      <Toggle on={item.is_featured} />
                    </button>
                  </div>
                  <div className="w-[70px] flex items-center justify-end gap-[10px]">
                    <ActionBtn
                      onClick={() => {
                        setEditingResource(item);
                        setResourceModalOpen(true);
                      }}
                      title="Edit"
                      icon={<Pencil size={15} strokeWidth={1.8} />}
                    />
                    <ActionBtn onClick={() => handleDelete(item)} title="Delete" icon={<Trash2 size={15} strokeWidth={1.8} />} />
                  </div>
                </TableRow>
              ))}
              {!loading && resources.length === 0 && (
                <div className="py-[48px] text-center">
                  <p className="font-['Figtree'] text-[var(--app-muted)] text-[14px]">
                    "No resources yet."
                  </p>
                </div>
              )}
            </div>
          </div>
        </TableCard>
        <div className="flex items-center justify-between border-t border-[var(--app-border)] px-[13px] py-[10px]">
          <span className="font-['JetBrains_Mono'] text-[8px] text-[var(--app-muted)]">
            Page {page} · {totalResources.toLocaleString()} resources
          </span>
          <div className="flex items-center gap-[4px]">
            <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={!hasPrev || loading} className="flex h-[26px] w-[26px] items-center justify-center rounded-[5px] border border-[var(--app-border)] text-[var(--app-muted)] disabled:opacity-30" aria-label="Previous page">
              <ChevronLeft size={13} />
            </button>
            <span className="flex h-[26px] min-w-[26px] items-center justify-center rounded-[5px] bg-[#f37422] px-[7px] font-['JetBrains_Mono'] text-[9px] font-bold text-[#15110e]">{page}</span>
            <button type="button" onClick={() => setPage((value) => value + 1)} disabled={!hasNext || loading} className="flex h-[26px] w-[26px] items-center justify-center rounded-[5px] border border-[var(--app-border)] text-[var(--app-muted)] disabled:opacity-30" aria-label="Next page">
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
      <AddResourceModal
        open={resourceModalOpen}
        resource={editingResource}
        onClose={() => {
          setResourceModalOpen(false);
          setEditingResource(null);
        }}
        onCreated={() => bumpResourcesVersion()}
      />
      {importModalOpen && <ExcelImportModal title="Load Real-World Resources" subtitle="Super Admin · UAT Only" actionLabel="Load Resources" helperText="All resource fields included" templateHeaders={RESOURCE_IMPORT_HEADERS} templateFilename="torch-real-world-resources-template.xlsx" onClose={() => setImportModalOpen(false)} onUpload={handleImport} />}
    </div>
  );
}
