import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  MoreVertical,
  Pencil,
  Plus,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AddResourceModal } from "../components/modals";
import { ApiError } from "@/lib/api";
import {
  listResources,
  getResourceStats,
  type ApiResource,
} from "@/lib/resources";
import { getResource } from "../lib/resources";

const PAGE_SIZE = 8;

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

interface ResourceStatsCategory {
  value: string;
  label: string;
  count: number;
}

interface ResourceStats {
  count: number;
  active_count: number;
  pending_count: number;
  category_count: number;
  categories: ResourceStatsCategory[];
  results: ApiResource[];
}

/*
 * Your backend currently returns these fields even though the older
 * ApiResource interface may not contain them.
 */
type AdminResource = ApiResource & {
  id: number;
  title: string;

  category: string;
  category_display?: string | null;

  sub_category?: string | null;
  sub_category_display?: string | null;

  format?: string | null;

  delivery_format?: string | null;
  delivery_format_display?: string | null;

  status: string;
  status_display?: string | null;

  is_active?: boolean;
};

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function normalizeLabel(value?: string | null): string {
  if (!value) return "—";

  return value
    .replace(/_/g, " ")
    .replace(/\s*\+\s*/g, " + ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getCategoryLabel(resource: AdminResource): string {
  return (
    resource.category_display ||
    normalizeLabel(resource.category)
  );
}

function getSubCategoryLabel(resource: AdminResource): string {
  return (
    resource.sub_category_display ||
    normalizeLabel(resource.sub_category)
  );
}

function getFormatLabel(resource: AdminResource): string {
  return (
    resource.format ||
    resource.delivery_format_display ||
    normalizeLabel(resource.delivery_format)
  );
}

function getStatusLabel(resource: AdminResource): string {
  return (
    resource.status_display ||
    normalizeLabel(resource.status)
  );
}

/* -------------------------------------------------------------------------- */
/* CATEGORY COLORS                                                            */
/* -------------------------------------------------------------------------- */

function getCategoryClass(category?: string | null): string {
  switch (category) {
    case "recovery_meetings":
    case "Recovery Meetings":
      return [
        "border-[#f37422]",
        "bg-[rgba(243,116,34,0.08)]",
        "text-[#f37422]",
      ].join(" ");

    case "mental_health":
    case "Mental Health":
      return [
        "border-[#a78bfa]",
        "bg-[rgba(167,139,250,0.08)]",
        "text-[#a78bfa]",
      ].join(" ");

    case "physical_health":
    case "Physical Health":
      return [
        "border-[#38bdf8]",
        "bg-[rgba(56,189,248,0.08)]",
        "text-[#38bdf8]",
      ].join(" ");

    case "additional_support":
    case "Additional Support":
      return [
        "border-[#35d47b]",
        "bg-[rgba(53,212,123,0.08)]",
        "text-[#35d47b]",
      ].join(" ");

    case "recreation":
    case "Recreation":
      return [
        "border-[#f472b6]",
        "bg-[rgba(244,114,182,0.08)]",
        "text-[#f472b6]",
      ].join(" ");

    default:
      return [
        "border-[#6b6258]",
        "bg-[rgba(255,255,255,0.04)]",
        "text-[#b8aea2]",
      ].join(" ");
  }
}

/* -------------------------------------------------------------------------- */
/* CATEGORY PILL                                                              */
/* -------------------------------------------------------------------------- */

function CategoryPill({
  resource,
}: {
  resource: AdminResource;
}) {
  const label = getCategoryLabel(resource);

  return (
    <span
      className={[
        "inline-flex",
        "w-fit",
        "items-center",
        "rounded-full",
        "border",
        "px-[9px]",
        "py-[4px]",
        "font-['Figtree']",
        "text-[9px]",
        "font-medium",
        "whitespace-nowrap",
        getCategoryClass(resource.category),
      ].join(" ")}
    >
      {label}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* STATUS PILL                                                                */
/* -------------------------------------------------------------------------- */

function ResourceStatus({
  resource,
}: {
  resource: AdminResource;
}) {
  const status = getStatusLabel(resource).toUpperCase();

  if (status === "PUBLISHED") {
    return (
      <span className="inline-flex items-center gap-[5px] rounded-full border border-[#35d47b] bg-[rgba(53,212,123,0.06)] px-[8px] py-[3px] font-['JetBrains_Mono'] text-[7px] font-bold text-[#35d47b]">
        <span className="h-[5px] w-[5px] rounded-full bg-current" />
        PUBLISHED
      </span>
    );
  }

  if (status === "DRAFT") {
    return (
      <span className="inline-flex items-center gap-[5px] rounded-full border border-[#8a8073] bg-[rgba(138,128,115,0.06)] px-[8px] py-[3px] font-['JetBrains_Mono'] text-[7px] font-bold text-[#8a8073]">
        <span className="h-[5px] w-[5px] rounded-full bg-current" />
        DRAFT
      </span>
    );
  }

  if (status === "ARCHIVED") {
    return (
      <span className="inline-flex items-center gap-[5px] rounded-full border border-[#ef4444] bg-[rgba(239,68,68,0.06)] px-[8px] py-[3px] font-['JetBrains_Mono'] text-[7px] font-bold text-[#ef4444]">
        <span className="h-[5px] w-[5px] rounded-full bg-current" />
        ARCHIVED
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-[5px] rounded-full border border-[#6b6258] px-[8px] py-[3px] font-['JetBrains_Mono'] text-[7px] font-bold text-[#8b8174]">
      <span className="h-[5px] w-[5px] rounded-full bg-current" />
      {status}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* METRIC CARD                                                                */
/* -------------------------------------------------------------------------- */

function ResourceMetricCard({
  label,
  value,
  description,
  valueColor,
}: {
  label: string;
  value: number | string;
  description: string;
  valueColor: string;
}) {
  return (
    <div className="rounded-[9px] border border-[#2a2724] bg-[#15110e] p-[13px]">
      <p className="font-['JetBrains_Mono'] text-[7px] uppercase tracking-[0.06em] text-[#756c61]">
        {label}
      </p>

      <div className="mt-[8px] flex items-end justify-between">
        <span
          className="font-['Figtree'] text-[25px] font-bold leading-none"
          style={{ color: valueColor }}
        >
          {value}
        </span>

        <span
          className="text-[17px]"
          style={{ color: valueColor }}
        >
          ↗
        </span>
      </div>

      <p className="mt-[6px] font-['JetBrains_Mono'] text-[7px] text-[#6f665c]">
        {description}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export function EventsPage() {
  const navigate = useNavigate();

  const [resources, setResources] = useState<AdminResource[]>([]);
  const [stats, setStats] = useState<ResourceStats | null>(null);

  const [activeCategory, setActiveCategory] =
    useState<string>("all");

  const [search, setSearch] = useState("");
  const [sortAscending, setSortAscending] = useState(true);

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [editingResource, setEditingResource] = useState<ApiResource | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ---------------------------------------------------------------------- */
  /* LOAD RESOURCES                                                         */
  /* ---------------------------------------------------------------------- */

  const loadResources = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await listResources();

      setResources(
        ((response as any)?.results || []) as AdminResource[]
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to load resources."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* LOAD STATS                                                             */
  /* ---------------------------------------------------------------------- */

  const loadStats = async () => {
    try {
      setStatsLoading(true);

      const response = await getResourceStats();

      setStats(response as unknown as ResourceStats);
    } catch (err) {
      console.error(err);
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
    loadStats();
  }, []);

  /* ---------------------------------------------------------------------- */
  /* CATEGORY FILTER                                                        */
  /* ---------------------------------------------------------------------- */

  const filteredResources = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = [...resources];

    if (activeCategory !== "all") {
      result = result.filter(
        (resource) =>
          resource.category === activeCategory
      );
    }

    if (query) {
      result = result.filter((resource) => {
        const title =
          resource.title?.toLowerCase() || "";

        const category =
          getCategoryLabel(resource).toLowerCase();

        const subCategory =
          getSubCategoryLabel(resource).toLowerCase();

        const format =
          getFormatLabel(resource).toLowerCase();

        const status =
          getStatusLabel(resource).toLowerCase();

        return (
          title.includes(query) ||
          category.includes(query) ||
          subCategory.includes(query) ||
          format.includes(query) ||
          status.includes(query)
        );
      });
    }

    result.sort((a, b) => {
      const first =
        a.title?.toLowerCase() || "";

      const second =
        b.title?.toLowerCase() || "";

      return sortAscending
        ? first.localeCompare(second)
        : second.localeCompare(first);
    });

    return result;
  }, [
    resources,
    activeCategory,
    search,
    sortAscending,
  ]);

  /* ---------------------------------------------------------------------- */
  /* FRONTEND PAGINATION                                                    */
  /* ---------------------------------------------------------------------- */

  const totalFiltered = filteredResources.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalFiltered / PAGE_SIZE)
  );

  const currentPage = Math.min(
    page,
    totalPages
  );

  const startIndex =
    (currentPage - 1) * PAGE_SIZE;

  const endIndex =
    startIndex + PAGE_SIZE;

  const visibleResources =
    filteredResources.slice(
      startIndex,
      endIndex
    );

  const showingStart =
    totalFiltered === 0
      ? 0
      : startIndex + 1;

  const showingEnd =
    Math.min(
      endIndex,
      totalFiltered
    );

  /* ---------------------------------------------------------------------- */
  /* CATEGORY TABS                                                          */
  /* ---------------------------------------------------------------------- */

  const categories =
    stats?.categories || [];

  const categoryTabs = [
    {
      value: "all",
      label: "All Resources",
      count: stats?.count ?? resources.length,
    },
    ...categories.map((category) => ({
      value: category.value,
      label: category.label,
      count: category.count,
    })),
  ];

  /* ---------------------------------------------------------------------- */
  /* PAGE CHANGE                                                             */
  /* ---------------------------------------------------------------------- */

  const changeCategory = (value: string) => {
    setActiveCategory(value);
    setPage(1);
  };

  const changeSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  /* ---------------------------------------------------------------------- */
  /* EXPORT                                                                  */
  /* ---------------------------------------------------------------------- */

  const handleExport = () => {
    if (!resources.length) return;

    const headers = [
      "Resource Name",
      "Category",
      "Sub-category",
      "Format",
      "Status",
    ];

    const rows = resources.map((resource) => [
      resource.title,
      getCategoryLabel(resource),
      getSubCategoryLabel(resource),
      getFormatLabel(resource),
      getStatusLabel(resource),
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value ?? "").replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download = "resources.csv";
    link.click();

    URL.revokeObjectURL(url);
  };


  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="flex min-w-0 flex-1 overflow-y-auto bg-[#080808]">
      <div className="w-full p-[20px] lg:p-[22px]">

        <div className="flex flex-col gap-[18px]">

          {/* ============================================================= */}
          {/* HEADER                                                          */}
          {/* ============================================================= */}

          <div className="flex flex-col gap-[12px] xl:flex-row xl:items-end xl:justify-between">

            <div>
              <p className="font-['JetBrains_Mono'] text-[8px] font-bold uppercase tracking-[0.04em] text-[#f37422]">
                RESOURCES ·{" "}
                {statsLoading
                  ? "—"
                  : stats?.count ?? 0}{" "}
                TOTAL ·{" "}
                {statsLoading
                  ? "—"
                  : stats?.category_count ?? 0}{" "}
                CATEGORIES ·{" "}
                {statsLoading
                  ? "—"
                  : stats?.active_count ?? 0}{" "}
                ACTIVE
              </p>

              <h1 className="mt-[5px] font-['Figtree'] text-[23px] font-bold leading-none text-[#f4ede3]">
                Real World Resources
              </h1>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-[8px]">

              <button
                type="button"
                className="flex h-[31px] items-center gap-[6px] rounded-[7px] border border-[#2a2724] bg-[#15110e] px-[11px] font-['Figtree'] text-[10px] text-[#c4b9aa] transition hover:border-[#f37422]"
              >
                <Filter size={12} />
                Filter
              </button>

              <button
                type="button"
                onClick={handleExport}
                className="flex h-[31px] items-center gap-[6px] rounded-[7px] border border-[#2a2724] bg-[#15110e] px-[11px] font-['Figtree'] text-[10px] text-[#c4b9aa] transition hover:border-[#f37422]"
              >
                <Download size={12} />
                Export
              </button>

            <button
              type="button"
              onClick={() => setShowAddResourceModal(true)}
              className="flex h-[31px] items-center gap-[5px] rounded-[7px] bg-[#f37422] px-[12px] font-['Figtree'] text-[10px] font-bold text-[#15110e] shadow-[0_4px_14px_rgba(243,116,34,0.2)] transition hover:bg-[#ff8535]"
            >
              <Plus
                size={12}
                strokeWidth={2.5}
              />
              Add Resource
            </button>

            </div>
          </div>

          {/* ============================================================= */}
          {/* ERROR                                                           */}
          {/* ============================================================= */}

          {error && (
            <div className="rounded-[8px] border border-red-500/30 bg-red-500/5 px-[13px] py-[9px]">
              <p className="font-['Figtree'] text-[10px] text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* ============================================================= */}
          {/* STAT CARDS                                                      */}
          {/* ============================================================= */}

          <div className="grid grid-cols-1 gap-[8px] sm:grid-cols-2 lg:grid-cols-4">

            <ResourceMetricCard
              label="Total Resources"
              value={
                statsLoading
                  ? "—"
                  : stats?.count ?? 0
              }
              description="Total resources listed"
              valueColor="#f37422"
            />

            <ResourceMetricCard
              label="Active"
              value={
                statsLoading
                  ? "—"
                  : stats?.active_count ?? 0
              }
              description="Currently active"
              valueColor="#35d47b"
            />

            <ResourceMetricCard
              label="Categories"
              value={
                statsLoading
                  ? "—"
                  : stats?.category_count ?? 0
              }
              description="Available categories"
              valueColor="#6b8ab0"
            />

            <ResourceMetricCard
              label="Pending Review"
              value={
                statsLoading
                  ? "—"
                  : stats?.pending_count ?? 0
              }
              description="Awaiting review"
              valueColor="#ef4444"
            />

          </div>

          {/* ============================================================= */}
          {/* RESOURCE TABLE CARD                                            */}
          {/* ============================================================= */}

          <div className="overflow-hidden rounded-[10px] border border-[#2a2724] bg-[#15110e]">

            {/* ----------------------------------------------------------- */}
            {/* CATEGORY TABS                                                */}
            {/* ----------------------------------------------------------- */}

            <div className="flex items-center overflow-x-auto border-b border-[#2a2724] px-[10px] py-[8px]">

              {categoryTabs.map((tab) => {
                const active =
                  activeCategory === tab.value;

                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() =>
                      changeCategory(tab.value)
                    }
                    className={[
                      "flex shrink-0 items-center gap-[5px]",
                      "rounded-[6px]",
                      "px-[10px]",
                      "py-[6px]",
                      "font-['Figtree']",
                      "text-[9px]",
                      "transition-colors",
                      active
                        ? "bg-[rgba(243,116,34,0.12)] font-bold text-[#f37422]"
                        : "text-[#8b8174] hover:bg-[#1d1916] hover:text-[#f4ede3]",
                    ].join(" ")}
                  >
                    {tab.label}

                    <span
                      className={[
                        "rounded-full px-[5px] py-[1px]",
                        "font-['JetBrains_Mono'] text-[7px]",
                        active
                          ? "bg-[rgba(243,116,34,0.15)] text-[#f37422]"
                          : "bg-[#211d19] text-[#756c61]",
                      ].join(" ")}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}

            </div>

            {/* ----------------------------------------------------------- */}
            {/* TABLE TOOLBAR                                                 */}
            {/* ----------------------------------------------------------- */}

            <div className="flex flex-col gap-[8px] border-b border-[#2a2724] px-[13px] py-[9px] sm:flex-row sm:items-center sm:justify-between">

              <div>
                <span className="font-['Figtree'] text-[10px] font-semibold text-[#f4ede3]">
                  {activeCategory === "all"
                    ? "All Resources"
                    : categoryTabs.find(
                        (item) =>
                          item.value ===
                          activeCategory
                      )?.label || "Resources"}
                </span>

                <span className="ml-[7px] font-['JetBrains_Mono'] text-[8px] text-[#f37422]">
                  {totalFiltered}
                </span>
              </div>

              <div className="flex items-center gap-[7px]">

                <div className="relative w-full sm:w-[220px]">
                  <Search
                    size={13}
                    className="pointer-events-none absolute left-[9px] top-1/2 -translate-y-1/2 text-[#756c61]"
                  />

                  <input
                    value={search}
                    onChange={(event) =>
                      changeSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search resources..."
                    className="h-[31px] w-full rounded-[7px] border border-[#2a2724] bg-[#0d0c0b] pl-[28px] pr-[9px] font-['Figtree'] text-[9px] text-[#f4ede3] outline-none placeholder:text-[#756c61] focus:border-[#f37422]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSortAscending(
                      (value) => !value
                    )
                  }
                  className="flex h-[31px] shrink-0 items-center gap-[5px] rounded-[7px] border border-[#2a2724] px-[9px] font-['Figtree'] text-[9px] text-[#c4b9aa] hover:border-[#f37422]"
                >
                  Sort by:{" "}
                  {sortAscending
                    ? "Name A-Z"
                    : "Name Z-A"}

                  <ChevronDown size={10} />
                </button>

              </div>
            </div>

            {/* ----------------------------------------------------------- */}
            {/* TABLE                                                         */}
            {/* ----------------------------------------------------------- */}

            <div className="overflow-x-auto">

              <div className="min-w-[900px]">

                {/* HEADER */}

                <div className="grid grid-cols-[minmax(260px,1.8fr)_150px_160px_120px_120px_70px] items-center border-b border-[#2a2724] px-[13px] py-[9px]">

                  {[
                    "RESOURCE NAME",
                    "CATEGORY",
                    "SUB-CATEGORY",
                    "FORMAT",
                    "STATUS",
                    "ACTIONS",
                  ].map((heading) => (
                    <span
                      key={heading}
                      className="font-['JetBrains_Mono'] text-[6px] uppercase tracking-[0.05em] text-[#756c61]"
                    >
                      {heading}
                    </span>
                  ))}

                </div>

                {/* LOADING */}

                {loading && (
                  <div className="px-[15px] py-[35px] text-center font-['Figtree'] text-[10px] text-[#756c61]">
                    Loading resources...
                  </div>
                )}

                {/* EMPTY */}

                {!loading &&
                  visibleResources.length === 0 && (
                    <div className="px-[15px] py-[35px] text-center font-['Figtree'] text-[10px] text-[#756c61]">
                      No resources found.
                    </div>
                  )}

                {/* ROWS */}

                {!loading &&
                  visibleResources.map(
                    (resource) => (
                      <div
                        key={resource.id}
                        className="grid grid-cols-[minmax(260px,1.8fr)_150px_160px_120px_120px_70px] items-center border-b border-[#211e1b] px-[13px] py-[10px] transition-colors hover:bg-[#191512]"
                      >

                        {/* RESOURCE */}

                        <div className="flex min-w-0 items-center gap-[9px]">

                          <div className="flex h-[29px] w-[29px] shrink-0 items-center justify-center rounded-[8px] bg-[#2b2722]">
                            <span className="font-['Figtree'] text-[9px] font-bold text-[#8b8174]">
                              {resource.title
                                ?.slice(0, 1)
                                .toUpperCase() ||
                                "R"}
                            </span>
                          </div>

                          <div className="min-w-0">

                            <p className="truncate font-['Figtree'] text-[10px] font-semibold leading-tight text-[#f4ede3]">
                              {resource.title}
                            </p>

                            <p className="mt-[2px] truncate font-['JetBrains_Mono'] text-[7px] leading-tight text-[#756c61]">
                              Resource #{resource.id}
                            </p>

                          </div>

                        </div>

                        {/* CATEGORY */}

                        <div>
                          <CategoryPill
                            resource={resource}
                          />
                        </div>

                        {/* SUB CATEGORY */}

                        <div className="truncate pr-[10px] font-['Figtree'] text-[9px] text-[#9b9185]">
                          {getSubCategoryLabel(
                            resource
                          )}
                        </div>

                        {/* FORMAT */}

                        <div className="font-['Figtree'] text-[9px] font-medium text-[#f4ede3]">
                          {getFormatLabel(resource)}
                        </div>

                        {/* STATUS */}

                        <div>
                          <ResourceStatus
                            resource={resource}
                          />
                        </div>

                        {/* ACTIONS */}

                        <div className="flex items-center gap-[3px]">

                        <button
                          type="button"
                          title="Edit resource"
                          onClick={async () => {
                            try {
                              const resourceData = await getResource(resource.id);

                              setEditingResource(resourceData);
                              setShowAddResourceModal(true);
                            } catch (error) {
                              console.error("Failed to load resource:", error);
                            }
                          }}
                          className="flex h-[25px] w-[25px] items-center justify-center rounded-[5px] text-[#756c61] transition hover:bg-[#211d19] hover:text-[#f37422]"
                        >
                          <Pencil size={12} strokeWidth={2} />
                        </button>

                          <button
                            type="button"
                            title="More actions"
                            className="flex h-[25px] w-[25px] items-center justify-center rounded-[5px] text-[#756c61] hover:bg-[#211d19] hover:text-[#f4ede3]"
                          >
                            <MoreVertical
                              size={12}
                            />
                          </button>

                        </div>

                      </div>
                    )
                  )}

              </div>

            </div>

            {/* ----------------------------------------------------------- */}
            {/* PAGINATION                                                    */}
            {/* ----------------------------------------------------------- */}

            <div className="flex flex-col gap-[8px] border-t border-[#2a2724] px-[13px] py-[10px] sm:flex-row sm:items-center sm:justify-between">

              <span className="font-['JetBrains_Mono'] text-[7px] text-[#756c61]">
                Showing{" "}
                {showingStart}
                –
                {showingEnd}{" "}
                of{" "}
                {totalFiltered}{" "}
                resources
              </span>

              <div className="flex items-center gap-[4px]">

                {/* PREVIOUS */}

                <button
                  type="button"
                  disabled={
                    currentPage === 1 ||
                    loading
                  }
                  onClick={() =>
                    setPage((value) =>
                      Math.max(
                        1,
                        value - 1
                      )
                    )
                  }
                  className="flex h-[24px] w-[24px] items-center justify-center rounded-[5px] border border-[#2a2724] text-[#756c61] transition hover:border-[#f37422] hover:text-[#f37422] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft size={12} />
                </button>

                {/* PAGE NUMBERS */}

                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, index) =>
                    index + 1
                ).map(
                  (pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() =>
                        setPage(
                          pageNumber
                        )
                      }
                      className={[
                        "flex h-[24px] min-w-[24px] items-center justify-center rounded-[5px] px-[6px]",
                        "font-['JetBrains_Mono'] text-[8px] font-bold",
                        pageNumber ===
                        currentPage
                          ? "bg-[#f37422] text-[#15110e]"
                          : "text-[#8b8174] hover:bg-[#211d19] hover:text-[#f4ede3]",
                      ].join(" ")}
                    >
                      {pageNumber}
                    </button>
                  )
                )}

                {/* NEXT */}

                <button
                  type="button"
                  disabled={
                    currentPage ===
                      totalPages ||
                    loading
                  }
                  onClick={() =>
                    setPage((value) =>
                      Math.min(
                        totalPages,
                        value + 1
                      )
                    )
                  }
                  className="flex h-[24px] w-[24px] items-center justify-center rounded-[5px] border border-[#2a2724] text-[#756c61] transition hover:border-[#f37422] hover:text-[#f37422] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronRight size={12} />
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>
      <AddResourceModal
        open={showAddResourceModal}
        resource={editingResource}
        onClose={() => {
          setShowAddResourceModal(false);
          setEditingResource(null);
        }}
        onCreated={() => {
          setShowAddResourceModal(false);
          setEditingResource(null);
          loadResources();
        }}
      />
    </div>
    
  );
  
}