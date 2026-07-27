import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useAppContext } from "@/app/app-context";
import { PageHeader } from "@/components/common/PageHeader";
import { GhostBtn, PrimaryBtn } from "@/components/common/Buttons";
import { SearchBox } from "@/components/common/SearchBox";
import { MetricCard } from "@/components/common/MetricCard";
import { TableCard, TableHead, TableRow } from "@/components/common/Table";
import { Toggle } from "@/components/common/Toggle";
import { ActionBtn } from "@/components/common/ActionBtn";
import { FilterIcon, FileIcon } from "@/components/icons";
import { ApiError } from "@/lib/api";
import { listResources, updateResource, deleteResource, type ApiResource } from "@/lib/resources";

function toTitleCase(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function RealWorldResourcesPage() {
  const { setModal, resourcesVersion, bumpResourcesVersion } = useAppContext();
  const [search, setSearch] = useState("");
  const [resources, setResources] = useState<ApiResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listResources()
      .then((response) => {
        if (!cancelled) setResources(response.results);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Unable to load resources.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [resourcesVersion]);

  const filtered = resources.filter(
    (r) => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.category.toLowerCase().includes(search.toLowerCase())
  );
  const featuredCount = resources.filter((r) => r.is_featured).length;
  const categoryCount = new Set(resources.map((r) => r.category)).size;
  const recoveryCount = resources.filter((r) => r.resource_type === "recovery_meeting").length;

  const handleToggleFeatured = async (item: ApiResource) => {
    setActionError(null);
    try {
      await updateResource(item.id, { is_featured: !item.is_featured });
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

  return (
    <div className="flex-1 min-w-0 overflow-y-auto">
      <div className="p-[24px] lg:p-[32px] flex flex-col gap-[20px]">
        <PageHeader eyebrow={`${resources.length} RESOURCES · ${categoryCount} CATEGORIES`} title="Real World Resources">
          <SearchBox placeholder="Search resources..." value={search} onChange={setSearch} />
          <GhostBtn label="Filter" icon={<FilterIcon />} />
          <PrimaryBtn label="+ Add Resource" onClick={() => setModal("add-resource")} />
        </PageHeader>

        {error && <p className="font-['Figtree'] text-[13px] text-red-500">{error}</p>}
        {actionError && <p className="font-['Figtree'] text-[13px] text-red-500">{actionError}</p>}

        <div className="flex gap-[10px] flex-wrap">
          <MetricCard label="TOTAL RESOURCES" value={String(resources.length)} delta="Live from server" deltaColor="#8a8073" accentColor="#f37422" />
          <MetricCard label="RECOVERY MEETINGS" value={String(recoveryCount)} delta="Live from server" deltaColor="#8a8073" accentColor="#facc15" />
          <MetricCard label="CATEGORIES" value={String(categoryCount)} delta="Live from server" deltaColor="#8a8073" accentColor="#6b8ab0" />
          <MetricCard label="FEATURED" value={String(featuredCount)} delta="Live from server" deltaColor="#8a8073" accentColor="#4ade80" />
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
              {!loading && filtered.map((item) => (
                <TableRow key={item.id}>
                  <div className="flex items-center gap-[10px] flex-1 min-w-[220px]">
                    <div className="w-[32px] h-[32px] rounded-full bg-[rgba(107,138,176,0.2)] flex items-center justify-center flex-shrink-0">
                      <FileIcon color="#6b8ab0" />
                    </div>
                    <p className="font-['Figtree'] font-semibold text-[var(--app-text)] text-[13px]">{item.title}</p>
                  </div>
                  <div className="w-[140px] font-['Figtree'] font-normal text-[var(--app-text)] text-[12px]">
                    {item.resource_type_display || toTitleCase(item.resource_type)}
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
                    <ActionBtn onClick={() => handleDelete(item)} title="Delete" icon={<Trash2 size={15} strokeWidth={1.8} />} />
                  </div>
                </TableRow>
              ))}
              {!loading && filtered.length === 0 && (
                <div className="py-[48px] text-center">
                  <p className="font-['Figtree'] text-[var(--app-muted)] text-[14px]">
                    {resources.length === 0 ? "No resources yet." : "No resources match your search."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </TableCard>
      </div>
    </div>
  );
}
