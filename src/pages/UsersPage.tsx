import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useAppContext } from "@/app/app-context";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchBox } from "@/components/common/SearchBox";
import { PrimaryBtn } from "@/components/common/Buttons";
import { MetricCard } from "@/components/common/MetricCard";
import { TableCard, TableHead, TableRow } from "@/components/common/Table";
import { StatusPill } from "@/components/common/StatusPill";
import { ActionBtn } from "@/components/common/ActionBtn";
import { EditIcon, EyeIcon } from "@/components/icons";
import { ModalOverlay, ModalCard, ModalHeader, ModalFooter } from "@/components/common/Modal";
import { FormField, TextInput, SelectInput } from "@/components/common/FormFields";
import { ApiError } from "@/lib/api";
import { listUsers, getUser, getUserStats, updateUser, deleteUser, type ApiUser, type UserStats } from "@/lib/users";

const ROLE_OPTIONS = ["Patient", "Counselor", "Admin", "Super Admin"];

interface DisplayUser {
  id: string;
  name: string;
  email: string;
  role: string;
  counselor: string;
  sobriety: string;
  status: "ACTIVE" | "ARCHIVED";
}

function toDisplayUser(user: ApiUser): DisplayUser {
  return {
    id: user.id,
    name: user.full_name,
    email: user.email,
    role: user.role,
    counselor: user.counselor,
    sobriety: user.sobriety_days != null ? `${user.sobriety_days} days` : "—",
    status: user.is_active ? "ACTIVE" : "ARCHIVED",
  };
}

function EditUserModal({ user, onClose, onSaved }: { user: DisplayUser; onClose: () => void; onSaved: () => void }) {
  const [fullName, setFullName] = useState(user.name);
  const [role, setRole] = useState(ROLE_OPTIONS.includes(user.role) ? user.role : ROLE_OPTIONS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      setError("Full name is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await updateUser(user.id, { full_name: fullName.trim(), role });
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
        <ModalHeader title="Edit user" onClose={onClose} />
        <div className="flex flex-col gap-[16px]">
          <FormField label="Full name" required>
            <TextInput value={fullName} onChange={setFullName} />
          </FormField>
          <FormField label="Role">
            <SelectInput options={ROLE_OPTIONS} value={role} onChange={setRole} />
          </FormField>
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

function UserDetailModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [detail, setDetail] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getUser(userId)
      .then((response) => {
        if (!cancelled) setDetail(response);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Unable to load user details.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const user = detail ? toDisplayUser(detail) : null;
  const initials = user ? user.name.split(" ").map((name) => name[0]).join("").slice(0, 2) : "";

  return (
    <ModalOverlay onClose={onClose}>
      <ModalCard>
        <ModalHeader title="User profile" onClose={onClose} />
        {loading && <p className="font-['Figtree'] text-[13px] text-[var(--app-muted)]">Loading user details...</p>}
        {!loading && error && <p className="font-['Figtree'] text-[13px] text-red-500">{error}</p>}
        {!loading && !error && user && detail && (
          <div className="flex flex-col gap-[20px]">
            <div className="flex items-center gap-[14px]">
              <div className="w-[48px] h-[48px] rounded-full bg-[rgba(243,116,34,0.18)] text-[#f37422] font-['Figtree'] font-bold text-[16px] flex items-center justify-center">{initials}</div>
              <div>
                <p className="font-['Figtree'] font-bold text-[17px] text-[var(--app-text)]">{user.name}</p>
                <p className="font-['Figtree'] text-[13px] text-[var(--app-muted)]">{user.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-[12px]">
              {[
                ["Role", user.role],
                ["Assigned counselor", user.counselor],
                ["Sobriety", user.sobriety],
                ["Member since", new Date(detail.created_at).toLocaleDateString()],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[9px] bg-[var(--app-surface)] border border-[var(--app-border)] p-[12px]">
                  <p className="font-['JetBrains_Mono'] text-[9px] text-[var(--app-muted)]">{label}</p>
                  <p className="mt-[4px] font-['Figtree'] font-semibold text-[13px] text-[var(--app-text)]">{value}</p>
                </div>
              ))}
              <div className="rounded-[9px] bg-[var(--app-surface)] border border-[var(--app-border)] p-[12px]">
                <p className="font-['JetBrains_Mono'] text-[9px] text-[var(--app-muted)]">Account status</p>
                <div className="mt-[5px]"><StatusPill status={user.status} /></div>
              </div>
            </div>
          </div>
        )}
        <ModalFooter onCancel={onClose} onConfirm={onClose} confirmLabel="Close" />
      </ModalCard>
    </ModalOverlay>
  );
}

export function UsersPage() {
  const { setModal, usersVersion, bumpUsersVersion } = useAppContext();
  const [search, setSearch] = useState("");
  const [viewUserId, setViewUserId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<DisplayUser | null>(null);
  const [users, setUsers] = useState<DisplayUser[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listUsers()
      .then((response) => {
        if (cancelled) return;
        setUsers(response.results.map(toDisplayUser));
        setTotalCount(response.count);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Unable to load users. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [usersVersion]);

  useEffect(() => {
    let cancelled = false;
    setStatsError(null);
    getUserStats()
      .then((response) => {
        if (!cancelled) setStats(response);
      })
      .catch((err) => {
        if (cancelled) return;
        setStatsError(err instanceof ApiError ? err.message : "Unable to load stats.");
      });
    return () => {
      cancelled = true;
    };
  }, [usersVersion]);

  const filtered = users.filter((u) => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (u: DisplayUser) => {
    if (!window.confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    setDeletingId(u.id);
    setDeleteError(null);
    try {
      await deleteUser(u.id);
      bumpUsersVersion();
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Unable to delete user. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex-1 min-w-0 overflow-y-auto">
      <div className="p-[24px] lg:p-[32px] flex flex-col gap-[20px]">
        <PageHeader eyebrow={`REGISTERED ${totalCount}`} title="User Management">
          <SearchBox placeholder="Search users..." value={search} onChange={setSearch} />
          <PrimaryBtn label="+ Add User" onClick={() => setModal("add-user")} />
        </PageHeader>

        {statsError && (
          <p className="font-['Figtree'] text-[13px] text-red-500">{statsError}</p>
        )}
        {deleteError && (
          <p className="font-['Figtree'] text-[13px] text-red-500">{deleteError}</p>
        )}
        <div className="flex gap-[10px] flex-wrap">
          <MetricCard label="TOTAL USERS" value={stats ? String(stats.total_users) : "—"} delta="Live from server" deltaColor="#8a8073" accentColor="#f37422" />
          <MetricCard label="ACTIVE THIS WEEK" value={stats ? String(stats.active_this_week) : "—"} delta="Live from server" deltaColor="#8a8073" accentColor="#4ade80" />
          <MetricCard label="NEW THIS MONTH" value={stats ? String(stats.new_this_month) : "—"} delta="Live from server" deltaColor="#8a8073" accentColor="#6b8ab0" />
        </div>

        <TableCard>
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <TableHead cols={[
                { label: "USER", w: "flex-1 min-w-[200px]" },
                { label: "ROLE", w: "w-[100px]" },
                { label: "COUNSELOR", w: "w-[150px]" },
                { label: "SOBRIETY", w: "w-[110px]" },
                { label: "STATUS", w: "w-[110px]" },
                { label: "ACTIONS", w: "w-[100px] text-right" },
              ]} />
              {loading && (
                <div className="px-[18px] py-[24px] font-['Figtree'] text-[13px] text-[var(--app-muted)]">Loading users...</div>
              )}
              {!loading && error && (
                <div className="px-[18px] py-[24px] font-['Figtree'] text-[13px] text-red-500">{error}</div>
              )}
              {!loading && !error && filtered.length === 0 && (
                <div className="px-[18px] py-[24px] font-['Figtree'] text-[13px] text-[var(--app-muted)]">No users found.</div>
              )}
              {!loading && !error && filtered.map((u) => (
                <TableRow key={u.id}>
                  <div className="flex items-center gap-[10px] flex-1 min-w-[200px]">
                    <div className="w-[32px] h-[32px] rounded-full bg-[rgba(243,116,34,0.2)] flex items-center justify-center flex-shrink-0">
                      <span className="font-['Figtree'] font-bold text-[#f37422] text-[11px]">
                        {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-['Figtree'] font-semibold text-[var(--app-text)] text-[13px] leading-tight">{u.name}</p>
                      <p className="font-['JetBrains_Mono'] font-normal text-[var(--app-muted)] text-[9px] leading-tight">{u.email}</p>
                    </div>
                  </div>
                  <div className="w-[100px] font-['Figtree'] font-normal text-[var(--app-text)] text-[12px]">{u.role}</div>
                  <div className="w-[150px] font-['Figtree'] font-normal text-[var(--app-text)] text-[12px]">{u.counselor}</div>
                  <div className="w-[110px] font-['JetBrains_Mono'] font-bold text-[var(--app-text)] text-[12px]">{u.sobriety}</div>
                  <div className="w-[110px]"><StatusPill status={u.status} /></div>
                  <div className="w-[100px] flex items-center justify-end gap-[10px]">
                    <ActionBtn onClick={() => setViewUserId(u.id)} title="View user profile" icon={<EyeIcon />} />
                    <ActionBtn onClick={() => setEditUser(u)} title="Edit user" icon={<EditIcon />} />
                    <ActionBtn
                      onClick={() => handleDelete(u)}
                      title="Delete user"
                      disabled={deletingId === u.id}
                      icon={<Trash2 size={15} strokeWidth={1.8} />}
                    />
                  </div>
                </TableRow>
              ))}
            </div>
          </div>
        </TableCard>
        {viewUserId && <UserDetailModal userId={viewUserId} onClose={() => setViewUserId(null)} />}
        {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(null)} onSaved={bumpUsersVersion} />}
      </div>
    </div>
  );
}
