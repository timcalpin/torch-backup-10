import { useEffect, useMemo, useState } from "react";
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
import { FileIcon } from "@/components/icons";
import { ApiError } from "@/lib/api";
import { getResourceStats, importResources, listResources, updateResource, deleteResource, deleteResources, type ApiResource, type ResourceStats } from "@/lib/resources";
import { ExcelImportModal } from "@/components/common/ExcelImportModal";
import { ModalOverlay, ModalCard } from "@/components/common/Modal";
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
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [allMatchingSelected, setAllMatchingSelected] = useState(false);
  const [selectingAll, setSelectingAll] = useState(false);
  const [deleteSelectionOpen, setDeleteSelectionOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedItems = useMemo(() => resources.filter((item) => selectedIds.has(item.id)), [resources, selectedIds]);
  const selectedCount = allMatchingSelected ? totalResources : selectedIds.size;

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

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
    setAllMatchingSelected(false);
  }, [search]);

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
    setSelectedIds(new Set([item.id]));
    setAllMatchingSelected(false);
    setDeleteSelectionOpen(true);
  };

  const toggleSelected = (id: number) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setAllMatchingSelected(false);
  };

  const selectAllMatching = async () => {
    setSelectingAll(true);
    setActionError(null);
    try {
      const ids: number[] = [];
      let currentPage = 1;
      let hasMore = true;
      while (hasMore) {
        const response = await listResources({ search, page: currentPage, page_size: 100 });
        ids.push(...response.results.map((resource) => resource.id));
        hasMore = Boolean(response.next);
        currentPage += 1;
      }
      setSelectedIds(new Set(ids));
      setAllMatchingSelected(true);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Unable to select all resources.");
    } finally {
      setSelectingAll(false);
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setAllMatchingSelected(false);
  };

  const handleConfirmDelete = async () => {
    const ids = [...selectedIds];
    if (!ids.length) return;
    setActionError(null);
    setDeleting(true);
    try {
      const result = ids.length === 1
        ? await deleteResource(ids[0]).then(() => ({ deleted: 1 }))
        : await deleteResources(ids);
      setDeleteSelectionOpen(false);
      clearSelection();
      setSuccessMessage(`${result.deleted} resource${result.deleted === 1 ? "" : "s"} deleted successfully. They are no longer available in the app.`);
      bumpResourcesVersion();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Unable to delete resource.");
    } finally {
      setDeleting(false);
    }
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    setImportMessage(null);
    setActionError(null);
    try {
      const rows = await readExcelRows(file);
      if (!rows.length) {
        setActionError("The Excel file does not contain any data rows.");
        return false;
      }
      const csvFile = excelRowsToCsvFile(
        RESOURCE_IMPORT_HEADERS,
        rows,
        file.name.replace(/\.xlsx$/i, ".csv")
      );
      const result = await importResources(csvFile);
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
        {successMessage && (
          <div className="flex items-center justify-between rounded-[10px] border border-[#1d6b41] bg-[rgba(20,92,51,0.16)] px-[16px] py-[13px] font-['Figtree'] text-[13px] text-[var(--app-text)]">
            <span><span className="mr-[10px] text-[#35d47b]">✓</span>{successMessage}</span>
            <button type="button" aria-label="Dismiss message" onClick={() => setSuccessMessage(null)} className="text-[var(--app-muted)] hover:text-[var(--app-text)]">×</button>
          </div>
        )}

        <div className="flex gap-[10px] flex-wrap">
          <MetricCard label="TOTAL RESOURCES" value={stats ? String(stats.count) : "—"} delta="Live from server" deltaColor="#8a8073" accentColor="#f37422" />
          <MetricCard label="ACTIVE" value={stats ? String(stats.active_count) : "—"} delta="Currently listed" deltaColor="#8a8073" accentColor="#4ade80" />
          <MetricCard label="CATEGORIES" value={stats ? String(stats.category_count) : "—"} delta="Live from server" deltaColor="#8a8073" accentColor="#6b8ab0" />
          <MetricCard label="PENDING REVIEW" value={stats ? String(stats.pending_count) : "—"} delta="Awaiting review" deltaColor="#8a8073" accentColor="#facc15" />
        </div>

        <TableCard>
          {selectedCount > 0 && (
            <div className="flex items-center justify-between border-b border-[var(--app-border)] bg-[rgba(243,116,34,0.08)] px-[16px] py-[10px]">
              <div className="flex items-center gap-[16px] font-['Figtree'] text-[12px] text-[var(--app-text)]">
                <span className="font-semibold">{selectedCount} selected</span>
                <button type="button" onClick={clearSelection} className="text-[var(--app-muted)] hover:text-[var(--app-text)]">Clear selection</button>
                {!allMatchingSelected && <button type="button" disabled={selectingAll} onClick={selectAllMatching} className="text-[#f37422] hover:underline disabled:opacity-50">{selectingAll ? "Selecting..." : `Select all ${totalResources} resources`}</button>}
              </div>
              <button type="button" onClick={() => setDeleteSelectionOpen(true)} className="rounded-[10px] bg-[#ef4444] px-[22px] py-[10px] font-['Figtree'] text-[12px] font-semibold text-white hover:bg-[#dc2626]">Delete selected</button>
            </div>
          )}
          <div className="overflow-x-auto">
            <div className="min-w-[840px]">
              <TableHead cols={[
                { label: <button type="button" aria-label={allMatchingSelected ? "Clear all resource selection" : "Select all resources"} disabled={selectingAll} onClick={() => allMatchingSelected ? clearSelection() : selectAllMatching()} className="flex items-center"><input type="checkbox" tabIndex={-1} readOnly checked={allMatchingSelected} className="h-[16px] w-[16px] accent-[#f37422] cursor-pointer" /></button>, w: "w-[52px]" },
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
                  <div className="w-[52px] flex-shrink-0">
                    <input type="checkbox" aria-label={`Select ${item.title}`} checked={selectedIds.has(item.id)} onChange={() => toggleSelected(item.id)} className="h-[16px] w-[16px] accent-[#f37422] cursor-pointer" />
                  </div>
                  <div className="flex items-center gap-[10px] flex-1 min-w-[220px]">
                    <div className="w-[32px] h-[32px] rounded-full bg-[rgba(107,138,176,0.2)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {(item.thumbnail || item.thumbnail_url) ? (
                        <img
                          src={item.thumbnail || item.thumbnail_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FileIcon color="#6b8ab0" />
                      )}
                    </div>
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
      {deleteSelectionOpen && selectedCount > 0 && (
        <ModalOverlay onClose={() => !deleting && setDeleteSelectionOpen(false)}>
          <ModalCard className="w-[520px] max-w-[calc(100vw-32px)]">
            <div className="mb-[22px] flex items-start justify-between">
              <div>
                <div className="mb-[14px] flex h-[42px] w-[42px] items-center justify-center rounded-[12px] bg-[rgba(243,116,34,0.15)] text-[#f37422]"><Trash2 size={20} /></div>
                <p className="font-['Figtree'] text-[24px] font-bold text-[var(--app-text)]">Delete {selectedCount} resource{selectedCount === 1 ? "" : "s"}?</p>
                <p className="mt-[8px] font-['Figtree'] text-[13px] leading-[1.4] text-[var(--app-muted)]">These resources will be removed from the app. This action cannot be undone.</p>
              </div>
              <button type="button" disabled={deleting} onClick={() => setDeleteSelectionOpen(false)} className="text-[22px] text-[var(--app-muted)] hover:text-[var(--app-text)]">×</button>
            </div>
            <div className="max-h-[180px] overflow-y-auto rounded-[10px] bg-[var(--app-bg)] px-[14px] py-[12px]">
              <p className="mb-[8px] font-['JetBrains_Mono'] text-[10px] font-bold uppercase text-[var(--app-muted)]">{selectedCount} selected resources</p>
              {selectedItems.slice(0, 8).map((item) => <div key={item.id} className="flex items-center gap-[8px] py-[4px] font-['Figtree'] text-[13px] text-[var(--app-text)]"><FileIcon color="#8a8073" />{item.title}</div>)}
              {selectedCount > selectedItems.length && <p className="pt-[5px] font-['Figtree'] text-[12px] text-[var(--app-muted)]">+ {selectedCount - selectedItems.length} more</p>}
            </div>
            <div className="mt-[22px] flex justify-end gap-[10px]">
              <button type="button" disabled={deleting} onClick={() => setDeleteSelectionOpen(false)} className="rounded-[10px] border border-[var(--app-border)] px-[20px] py-[10px] font-['Figtree'] text-[12px] text-[var(--app-muted)]">Cancel</button>
              <button type="button" disabled={deleting} onClick={handleConfirmDelete} className="rounded-[10px] bg-[#f37422] px-[20px] py-[10px] font-['Figtree'] text-[12px] font-semibold text-white disabled:opacity-60">{deleting ? "Deleting..." : `Delete ${selectedCount} resource${selectedCount === 1 ? "" : "s"}`}</button>
            </div>
          </ModalCard>
        </ModalOverlay>
      )}
    </div>
  );
}
