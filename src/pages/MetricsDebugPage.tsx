import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { ApiError } from "@/lib/api";
import { getHealthKitDebugUsers, type CategoryRollup, type UserSummary } from "@/lib/healthkitDebug";

const PAGE_SIZE = 10;

function CategoryDot({ rollup }: { rollup: CategoryRollup }) {
  const cfg = {
    fresh: { color: "#4ade80", label: "Synced" },
    stale: { color: "#facc15", label: "Stale" },
    missing: { color: "#ef4444", label: "Missing" },
    not_implemented: { color: "#8a8073", label: "N/A" },
  }[rollup.status];

  return (
    <span className="inline-flex items-center gap-[6px] font-['Figtree'] text-[11px] text-[var(--app-text)]">
      <span className="h-[7px] w-[7px] rounded-full" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  );
}

export function MetricsDebugPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getHealthKitDebugUsers(page, search)
      .then((response) => {
        if (cancelled) return;
        setUsers(response.results);
        setTotalCount(response.count);
        setHasNext(Boolean(response.next));
        setHasPrev(Boolean(response.previous));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Unable to load sync status. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, search]);

  const startItem = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, totalCount);

  return (
    <div className="flex-1 min-w-0 overflow-y-auto bg-[var(--app-bg)]">
      <div className="p-[24px] lg:p-[32px] flex flex-col gap-[20px]">
        <PageHeader eyebrow="HEALTHKIT ADMIN DEBUG CONSOLE" title="Metrics Debug">
          <div className="relative w-[240px]">
            <Search className="pointer-events-none absolute left-[12px] top-1/2 -translate-y-1/2 text-[var(--app-muted)]" size={14} />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search users..."
              className="h-[38px] w-full rounded-[9px] border border-[var(--app-border-strong)] bg-[var(--app-surface)] pl-[34px] pr-[12px] font-['Figtree'] text-[13px] text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)] focus:border-[#f37422]"
            />
          </div>
        </PageHeader>

        <p className="font-['Figtree'] text-[12px] text-[var(--app-muted)] -mt-[8px]">
          One row per user — Body / Mind / Spirit sync-health rollup. Select a user to see the full 33-metric breakdown and diagnosed sync issues.
        </p>

        <div className="overflow-hidden rounded-[12px] border border-[var(--app-border)] bg-[var(--app-surface)]">
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[minmax(220px,1.6fr)_110px_110px_110px_120px_70px] items-center gap-[8px] border-b border-[var(--app-border)] px-[16px] py-[10px]">
                {["USER", "BODY", "MIND", "SPIRIT", "SYNC", ""].map((heading) => (
                  <span key={heading} className="font-['JetBrains_Mono'] text-[9px] font-bold uppercase tracking-wide text-[var(--app-muted)]">
                    {heading}
                  </span>
                ))}
              </div>

              {loading && <div className="px-[16px] py-[32px] font-['Figtree'] text-[13px] text-[var(--app-muted)]">Loading users...</div>}
              {!loading && error && <div className="px-[16px] py-[32px] font-['Figtree'] text-[13px] text-red-500">{error}</div>}
              {!loading && !error && users.length === 0 && (
                <div className="px-[16px] py-[32px] text-center font-['Figtree'] text-[13px] text-[var(--app-muted)]">No users found.</div>
              )}

              {!loading &&
                !error &&
                users.map((user) => (
                  <button
                    key={user.user_id}
                    onClick={() => navigate(`/metrics-debug/${user.user_id}`)}
                    className="grid w-full grid-cols-[minmax(220px,1.6fr)_110px_110px_110px_120px_70px] items-center gap-[8px] border-b border-[var(--app-border-soft)] px-[16px] py-[11px] text-left transition-colors hover:bg-[var(--app-hover)]"
                  >
                    <div className="flex min-w-0 items-center gap-[9px]">
                      <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-[var(--app-hover)] font-['Figtree'] text-[10px] font-bold text-[var(--app-muted)]">
                        {user.full_name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-['Figtree'] text-[12px] font-semibold text-[var(--app-text)]">{user.full_name || "Unnamed user"}</p>
                        <p className="truncate font-['JetBrains_Mono'] text-[9px] text-[var(--app-muted)]">{user.email}</p>
                      </div>
                    </div>
                    <CategoryDot rollup={user.body} />
                    <CategoryDot rollup={user.mind} />
                    <CategoryDot rollup={user.spirit} />
                    <span
                      className={`w-fit rounded-[4px] px-[7px] py-[3px] font-['JetBrains_Mono'] text-[9px] font-bold ${
                        user.sync_required
                          ? "bg-[rgba(243,116,34,0.14)] text-[#f37422]"
                          : "bg-[rgba(138,128,115,0.12)] text-[var(--app-muted)]"
                      }`}
                    >
                      {user.sync_required ? "REQUIRED" : "OK"}
                    </span>
                    <span className="font-['Figtree'] text-[11px] font-semibold text-[#f37422]">View →</span>
                  </button>
                ))}
            </div>
          </div>

          <div className="flex flex-col gap-[8px] border-t border-[var(--app-border)] px-[16px] py-[10px] sm:flex-row sm:items-center sm:justify-between">
            <span className="font-['JetBrains_Mono'] text-[9px] text-[var(--app-muted)]">
              Showing {startItem}–{endItem} of {totalCount.toLocaleString()} users
            </span>
            <div className="flex items-center gap-[4px]">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={!hasPrev || loading}
                className="flex h-[26px] w-[26px] items-center justify-center rounded-[6px] border border-[var(--app-border-strong)] text-[var(--app-muted)] hover:border-[#f37422] hover:text-[#f37422] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft size={13} />
              </button>
              <span className="flex h-[26px] min-w-[26px] items-center justify-center rounded-[6px] bg-[#f37422] px-[8px] font-['JetBrains_Mono'] text-[10px] font-bold text-[#15110e]">{page}</span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNext || loading}
                className="flex h-[26px] w-[26px] items-center justify-center rounded-[6px] border border-[var(--app-border-strong)] text-[var(--app-muted)] hover:border-[#f37422] hover:text-[#f37422] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
