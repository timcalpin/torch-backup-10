import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/app/app-context";
import { StatusPill } from "@/components/common/StatusPill";
import { EditIcon } from "@/components/icons";
import { ModalOverlay, ModalCard, ModalHeader, ModalFooter, SectionLabel } from "@/components/common/Modal";
import { FormField, TextInput, SelectInput } from "@/components/common/FormFields";
import { ApiError } from "@/lib/api";
import { counselorDisplayName, listCounselors, type ApiCounselor } from "@/lib/counselors";
import {
  listUsers,
  getUser,
  getUserStats,
  createUser,
  updateUser,
  type ApiUser,
  type UserStats,
} from "@/lib/users";

const ROLE_OPTIONS = ["Patient", "Counselor", "Admin", "Super Admin"];
const STATUS_OPTIONS = ["Active", "Inactive"];

interface DisplayUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  counselor: string;
  counselorId: string | null;
  sobriety: string;
  sobrietyDate: string;
  primarySubstance: string;
  status: "ACTIVE" | "ARCHIVED";
}

interface UserUiExtras {
  streak: number;
  checkInRate: number;
  risk: "LOW" | "MODERATE" | "ELEVATED" | "HIGH";
  lastActive: string;
  flagged: boolean;
  isNew: boolean;
}

const USER_UI_EXTRAS: UserUiExtras[] = [
  { streak: 12, checkInRate: 72, risk: "ELEVATED", lastActive: "2h ago", flagged: false, isNew: false },
  { streak: 5, checkInRate: 91, risk: "LOW", lastActive: "1d ago", flagged: false, isNew: false },
  { streak: 2, checkInRate: 45, risk: "HIGH", lastActive: "3d ago", flagged: true, isNew: true },
  { streak: 18, checkInRate: 98, risk: "LOW", lastActive: "just now", flagged: false, isNew: false },
  { streak: 7, checkInRate: 63, risk: "MODERATE", lastActive: "5h ago", flagged: false, isNew: false },
  { streak: 1, checkInRate: 28, risk: "HIGH", lastActive: "6d ago", flagged: true, isNew: false },
  { streak: 31, checkInRate: 95, risk: "LOW", lastActive: "30m ago", flagged: false, isNew: false },
  { streak: 12, checkInRate: 79, risk: "ELEVATED", lastActive: "1h ago", flagged: false, isNew: true },
];

function getUserUiExtras(index: number): UserUiExtras {
  return USER_UI_EXTRAS[index % USER_UI_EXTRAS.length];
}

function toDisplayUser(user: ApiUser): DisplayUser {
  let counselorName = "Unassigned";
  let counselorId: string | null = null;
  const soberDays = user.sobriety_days ?? user.days_sober;
  const sobrietyDate = user.sobriety_start_date || user.sobriety_date || "";

  if (user.counselor) {
    if (typeof user.counselor === "object") {
      counselorName = user.counselor.full_name || user.counselor.name || "Unassigned";
      counselorId = String(user.counselor.id);
    } else if (typeof user.counselor === "string") {
      counselorName = user.counselor_name || user.counselor;
      counselorId = user.counselor_name ? user.counselor : null;
    }
  } else if (user.counselor_name) {
    counselorName = user.counselor_name;
  }

  return {
    id: user.id,
    name: user.full_name,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
    counselor: counselorName,
    counselorId,
    sobriety: soberDays != null ? `${soberDays}d` : "—",
    sobrietyDate,
    primarySubstance: user.primary_substance || "",
    status: user.is_active ? "ACTIVE" : "ARCHIVED",
  };
}

function useAvailableCounselors() {
  const [counselors, setCounselors] = useState<ApiCounselor[]>([]);

  useEffect(() => {
    let cancelled = false;
    listCounselors({ page_size: 100 })
      .then((response) => {
        if (!cancelled) setCounselors(response.results);
      })
      .catch(() => {
        if (!cancelled) setCounselors([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return counselors;
}

function RiskPill({ risk }: { risk: UserUiExtras["risk"] }) {
  const styles: Record<UserUiExtras["risk"], string> = {
    LOW: "border-[#35d47b] text-[#35d47b] bg-[rgba(53,212,123,0.06)]",
    MODERATE: "border-[#f4c400] text-[#f4c400] bg-[rgba(244,196,0,0.06)]",
    ELEVATED: "border-[#f37422] text-[#f37422] bg-[rgba(243,116,34,0.06)]",
    HIGH: "border-[#ef4444] text-[#ef4444] bg-[rgba(239,68,68,0.06)]",
  };

  return (
    <span className={`inline-flex w-fit items-center gap-[4px] rounded-full border px-[7px] py-[3px] font-['JetBrains_Mono'] text-[9px] font-bold leading-none ${styles[risk]}`}>
      <span className="h-[4px] w-[4px] rounded-full bg-current" />
      {risk}
    </span>
  );
}

function CheckInBar({ rate }: { rate: number }) {
  const width = `${Math.min(100, Math.max(0, rate))}%`;
  const barClass = rate >= 80 ? "bg-[#35d47b]" : rate >= 60 ? "bg-[#f4c400]" : "bg-[#ef4444]";

  return (
    <div className="flex items-center gap-[8px]">
      <div className="h-[4px] w-[30px] overflow-hidden rounded-full bg-[#2b2927]">
        <div className={`h-full ${barClass}`} style={{ width }} />
      </div>
    <span className="font-['JetBrains_Mono'] text-[11px] text-[var(--app-muted)]">{rate}%</span>
    </div>
  );
}

function UserStatus({ status, flagged }: { status: DisplayUser["status"]; flagged: boolean }) {
  const active = status === "ACTIVE" && !flagged;
  const label = status !== "ACTIVE" ? "Inactive" : flagged ? "Flagged" : "Active";
  return (
    <span className={`inline-flex items-center gap-[6px] text-[10px] ${active ? "text-[#35d47b]" : "text-[#ef4444]"}`}>
      <span className={`h-[5px] w-[5px] rounded-full ${active ? "bg-[#35d47b]" : "bg-[#ef4444]"}`} />
      {label}
    </span>
  );
}

/* ==========================================================================
   ADD USER MODAL
   ========================================================================== */
export function AddUserModal({ onClose }: { onClose: () => void }) {
  const { bumpUsersVersion } = useAppContext();
  const counselors = useAvailableCounselors();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState(ROLE_OPTIONS[0]);
  const [counselor, setCounselor] = useState("Unassigned");
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [sobrietyDate, setSobrietyDate] = useState("");
  const [primarySubstance, setPrimarySubstance] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!fullName.trim() || !email.trim()) {
      setError("Full name and email are required.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const selectedCounselor = counselors.find((item) => counselor === counselorDisplayName(item));

    try {
      await createUser({
        email: email.trim(),
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        role,
        counselor: selectedCounselor?.id ?? null,
        counselor_name: selectedCounselor ? counselorDisplayName(selectedCounselor) : null,
        is_active: status === "Active",
        sobriety_start_date: sobrietyDate || null,
        primary_substance: primarySubstance.trim() || null,
      });
      bumpUsersVersion();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to add user. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalCard className="max-w-[560px] w-full">
        <ModalHeader title="Add User" onClose={onClose} />
        <div className="flex flex-col gap-[20px] max-h-[70vh] overflow-y-auto pr-1">
          {/* Personal Info */}
          <div className="flex flex-col gap-[12px]">
            <SectionLabel label="Personal Info" />
            <FormField label="Full Name" required>
              <TextInput placeholder="e.g. Marcus Aurelius" value={fullName} onChange={setFullName} />
            </FormField>
            <div className="flex gap-[16px] flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <FormField label="Email Address" required>
                  <TextInput type="email" placeholder="name@email.com" value={email} onChange={setEmail} />
                </FormField>
              </div>
              <div className="flex-1 min-w-[180px]">
                <FormField label="Phone Number">
                  <TextInput placeholder="+1 (555) 000-0000" value={phone} onChange={setPhone} />
                </FormField>
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="flex flex-col gap-[12px]">
            <SectionLabel label="Account" />
            <div className="flex gap-[16px] flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <FormField label="Role">
                  <SelectInput options={ROLE_OPTIONS} value={role} onChange={setRole} />
                </FormField>
              </div>
              <div className="flex-1 min-w-[180px]">
                <FormField label="Assigned Counselor">
                  <SelectInput options={["Unassigned", ...counselors.map(counselorDisplayName)]} value={counselor} onChange={setCounselor} />
                </FormField>
              </div>
            </div>
            <div className="flex gap-[16px] flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <FormField label="Status">
                  <SelectInput options={STATUS_OPTIONS} value={status} onChange={setStatus} />
                </FormField>
              </div>
            </div>
          </div>

          {/* Recovery */}
          <div className="flex flex-col gap-[12px]">
            <SectionLabel label="Recovery" />
            <div className="flex gap-[16px] flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <FormField label="Sobriety Date">
                  <TextInput type="date" value={sobrietyDate} onChange={setSobrietyDate} />
                </FormField>
              </div>
              <div className="flex-1 min-w-[180px]">
                <FormField label="Primary Substance">
                  <TextInput placeholder="e.g. Alcohol" value={primarySubstance} onChange={setPrimarySubstance} />
                </FormField>
              </div>
            </div>
          </div>

          {error && <p className="font-['Figtree'] text-[15px] text-red-500">{error}</p>}
        </div>
        <ModalFooter
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmLabel={submitting ? "Adding..." : "Add User"}
          confirmDisabled={submitting}
        />
      </ModalCard>
    </ModalOverlay>
  );
}

/* ==========================================================================
   EDIT USER MODAL
   ========================================================================== */
function EditUserModal({ user, onClose, onSaved }: { user: DisplayUser; onClose: () => void; onSaved: () => void }) {
  const counselors = useAvailableCounselors();
  const [fullName, setFullName] = useState(user.name);
  const [role, setRole] = useState(ROLE_OPTIONS.includes(user.role) ? user.role : ROLE_OPTIONS[0]);
  const [counselor, setCounselor] = useState(user.counselor);
  const [status, setStatus] = useState(user.status === "ACTIVE" ? "Active" : "Inactive");
  const [sobrietyDate, setSobrietyDate] = useState(user.sobrietyDate);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const assigned = counselors.find((item) =>
      user.counselorId === String(item.id) || user.counselor === counselorDisplayName(item),
    );
    if (assigned) setCounselor(counselorDisplayName(assigned));
  }, [counselors, user.counselor, user.counselorId]);

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const selectedCounselor = counselors.find((item) => counselor === counselorDisplayName(item));

    try {
      await updateUser(user.id, {
        full_name: fullName.trim(),
        role,
        counselor: selectedCounselor?.id ?? null,
        counselor_name: selectedCounselor ? counselorDisplayName(selectedCounselor) : null,
        is_active: status === "Active",
        sobriety_start_date: sobrietyDate || null,
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
      <ModalCard className="max-w-[560px] w-full">
        <ModalHeader title="Edit User" onClose={onClose} />
        <div className="flex flex-col gap-[20px] max-h-[70vh] overflow-y-auto pr-1">
          {/* Personal Info */}
          <div className="flex flex-col gap-[12px]">
            <SectionLabel label="Personal Info" />
            <FormField label="Full Name" required>
              <TextInput placeholder="e.g. Marcus Aurelius" value={fullName} onChange={setFullName} />
            </FormField>
            <div className="flex gap-[16px] flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <FormField label="Email Address">
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full h-[40px] px-3 rounded-[6px] border border-[var(--app-border)] bg-[var(--app-surface-muted)] text-[var(--app-muted)] cursor-not-allowed text-[15px] font-['Figtree'] opacity-60 focus:outline-none"
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="flex flex-col gap-[12px]">
            <SectionLabel label="Account" />
            <div className="flex gap-[16px] flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <FormField label="Role">
                  <SelectInput options={ROLE_OPTIONS} value={role} onChange={setRole} />
                </FormField>
              </div>
              <div className="flex-1 min-w-[180px]">
                <FormField label="Assigned Counselor">
                  <SelectInput options={["Unassigned", ...counselors.map(counselorDisplayName)]} value={counselor} onChange={setCounselor} />
                </FormField>
              </div>
            </div>
            <div className="flex gap-[16px] flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <FormField label="Status">
                  <SelectInput options={STATUS_OPTIONS} value={status} onChange={setStatus} />
                </FormField>
              </div>
            </div>
          </div>

          {/* Recovery */}
          <div className="flex flex-col gap-[12px]">
            <SectionLabel label="Recovery" />
            <div className="flex gap-[16px] flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <FormField label="Sobriety Date">
                  <TextInput type="date" value={sobrietyDate} onChange={setSobrietyDate} />
                </FormField>
              </div>
            </div>
          </div>

          {error && <p className="font-['Figtree'] text-[15px] text-red-500">{error}</p>}
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

/* ==========================================================================
   USER DETAIL MODAL
   ========================================================================== */
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
        {loading && <p className="font-['Figtree'] text-[15px] text-[var(--app-muted)]">Loading user details...</p>}
        {!loading && error && <p className="font-['Figtree'] text-[15px] text-red-500">{error}</p>}
        {!loading && !error && user && detail && (
          <div className="flex flex-col gap-[20px]">
            <div className="flex items-center gap-[14px]">
              <div className="w-[48px] h-[48px] rounded-full bg-[rgba(243,116,34,0.18)] text-[#f37422] font-['Figtree'] font-bold text-[18px] flex items-center justify-center">
                {initials}
              </div>
              <div>
                <p className="font-['Figtree'] font-bold text-[19px] text-[var(--app-text)]">{user.name}</p>
                <p className="font-['Figtree'] text-[15px] text-[var(--app-muted)]">{user.email}</p>
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
                  <p className="font-['JetBrains_Mono'] text-[10px] text-[var(--app-muted)]">{label}</p>
                  <p className="mt-[4px] font-['Figtree'] font-semibold text-[15px] text-[var(--app-text)]">{value}</p>
                </div>
              ))}
              <div className="rounded-[9px] bg-[var(--app-surface)] border border-[var(--app-border)] p-[12px]">
                <p className="font-['JetBrains_Mono'] text-[10px] text-[var(--app-muted)]">Account status</p>
                <div className="mt-[5px]">
                  <StatusPill status={user.status} />
                </div>
              </div>
            </div>
          </div>
        )}
        <ModalFooter onCancel={onClose} onConfirm={onClose} confirmLabel="Close" />
      </ModalCard>
    </ModalOverlay>
  );
}

/* ==========================================================================
   USERS PAGE
   ========================================================================== */
export function UsersPage() {
  const { modal, setModal, usersVersion, dataRefreshVersion, bumpUsersVersion } = useAppContext();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState<DisplayUser | null>(null);
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);
  const [users, setUsers] = useState<DisplayUser[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const pageSize = 10;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listUsers({ search, page, page_size: pageSize })
      .then((response) => {
        if (cancelled) return;
        setUsers(response.results.map(toDisplayUser));
        setTotalCount(response.count);
        setHasNext(Boolean(response.next));
        setHasPrev(Boolean(response.previous));
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
  }, [usersVersion, dataRefreshVersion, search, page]);

  useEffect(() => setPage(1), [search]);

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
  }, [usersVersion, dataRefreshVersion]);

  const enrichedUsers = useMemo(
    () => users.map((user, index) => ({ user, extras: getUserUiExtras(index) })),
    [users]
  );

  const avgDaysSober = 61;
  const highRiskAlerts = 12;
  const checkInRate = 78;

  const goToRecovery = (id: string) => {
    navigate(`/recovery/${id}`);
  };

  const openEditUser = async (user: DisplayUser) => {
    setLoadingEditId(user.id);
    try {
      const detail = await getUser(user.id);
      setEditUser(toDisplayUser(detail));
    } catch {
      // Keep the table data available if the detail request fails.
      setEditUser(user);
    } finally {
      setLoadingEditId(null);
    }
  };

  const exportUsersCsv = async () => {
    try {
      const allUsers: ApiUser[] = [];
      const response = await listUsers({ page_size: 100 });
      allUsers.push(...response.results);

      const headers = ["id", "email", "full_name", "phone", "role", "counselor", "sobriety_days", "sobriety_start_date", "primary_substance", "is_active", "created_at"];
      const escapeCsv = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
      const formatDateTime = (value: string | null | undefined) => {
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return `'${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}, ${date.toLocaleDateString("en-GB")}`;
      };
      const rows = allUsers.map((user) => [
        user.id,
        user.email,
        user.full_name,
        user.phone,
        user.role,
        typeof user.counselor === "string" ? user.counselor : user.counselor?.full_name ?? user.counselor?.name ?? "",
        user.sobriety_days,
        user.sobriety_start_date ? `'${new Date(user.sobriety_start_date).toLocaleDateString("en-GB")}` : "",
        user.primary_substance,
        user.is_active,
        formatDateTime(user.created_at),
      ].map(escapeCsv).join(","));
      const csv = [headers.join(","), ...rows].join("\r\n");
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "users.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to export users.");
    }
  };

  return (
    <div className="flex min-w-0 flex-1 overflow-y-auto bg-[var(--app-bg)] text-[var(--app-text)] transition-colors duration-200">
      <div className="w-full p-[20px] lg:p-[22px]">
        <div className="flex flex-col gap-[18px]">
          <div className="flex flex-col gap-[12px] xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="font-['JetBrains_Mono'] text-[9px] font-bold uppercase tracking-[0.04em] text-[#f37422]">
                REGISTERED {totalCount.toLocaleString()} · ACTIVE THIS WEEK {stats ? stats.active_this_week.toLocaleString() : "—"}
              </p>
                <h1 className="mt-[5px] font-['Figtree'] text-[26px] font-bold leading-none text-[var(--app-text)]">
                User Management
              </h1>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-[8px]">
              <div className="relative w-[240px]">
                <Search className="pointer-events-none absolute left-[11px] top-1/2 -translate-y-1/2 text-[var(--app-muted)]" size={15} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users..." className="h-[36px] w-full rounded-[8px] border border-[var(--app-border-strong)] bg-[var(--app-surface)] pl-[32px] pr-[10px] font-['Figtree'] text-[13px] text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)] focus:border-[#f37422]" />
              </div>
              <button onClick={exportUsersCsv} className="flex h-[36px] items-center gap-[7px] rounded-[8px] border border-[var(--app-border-strong)] bg-[var(--app-surface)] px-[13px] font-['Figtree'] text-[13px] text-[var(--app-muted)] hover:border-[#f37422]">
                <Download size={15} />
                Export CSV
              </button>
              <button
                onClick={() => setModal("add-user")}
                className="flex h-[38px] items-center gap-[8px] rounded-[9px] bg-gradient-to-r from-[#f37422] to-[#c04a12] px-[16px] font-['Figtree'] text-[13px] font-semibold text-white shadow-[0_4px_8px_rgba(243,116,34,0.22)] transition-all hover:brightness-110"
              >
                <Plus size={14} strokeWidth={2.5} />
                Add User
              </button>
            </div>
          </div>

          {statsError && <p className="font-['Figtree'] text-[13px] text-red-500">{statsError}</p>}

          <div className="grid grid-cols-1 gap-[8px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <div className="rounded-[9px] border border-[var(--app-border-strong)] bg-[var(--app-surface)] p-[12px]">
              <p className="font-['JetBrains_Mono'] text-[8px] uppercase text-[#756c61]">Total Users</p>
              <div className="mt-[8px] flex items-end justify-between">
                <span className="font-['Figtree'] text-[27px] font-bold text-[#f37422]">{stats ? stats.total_users.toLocaleString() : "—"}</span>
                <span className="text-[#f37422]">↗</span>
              </div>
              <p className="mt-[3px] font-['JetBrains_Mono'] text-[8px] text-[#6f665c]">Live from server</p>
            </div>

            <div className="rounded-[9px] border border-[var(--app-border-strong)] bg-[var(--app-surface)] p-[12px]">
              <p className="font-['JetBrains_Mono'] text-[8px] uppercase text-[#756c61]">Active (7d)</p>
              <div className="mt-[8px] flex items-end justify-between">
                <span className="font-['Figtree'] text-[27px] font-bold text-[#35d47b]">{stats ? stats.active_this_week.toLocaleString() : "—"}</span>
                <span className="text-[#35d47b]">↗</span>
              </div>
              <p className="mt-[3px] font-['JetBrains_Mono'] text-[8px] text-[#6f665c]">Live from server</p>
            </div>

            <div className="rounded-[9px] border border-[var(--app-border-strong)] bg-[var(--app-surface)] p-[12px]">
              <p className="font-['JetBrains_Mono'] text-[8px] uppercase text-[#756c61]">Avg Days Sober</p>
              <div className="mt-[8px] flex items-end justify-between">
                <span className="font-['Figtree'] text-[27px] font-bold text-[#f4c400]">{avgDaysSober}</span>
                <span className="text-[#f4c400]">↗</span>
              </div>
              <p className="mt-[3px] font-['JetBrains_Mono'] text-[8px] text-[#6f665c]">Current recovery view</p>
            </div>

            <div className="rounded-[9px] border border-[var(--app-border-strong)] bg-[var(--app-surface)] p-[12px]">
              <p className="font-['JetBrains_Mono'] text-[8px] uppercase text-[#756c61]">High Risk Alerts</p>
              <div className="mt-[8px] flex items-end justify-between">
                <span className="font-['Figtree'] text-[27px] font-bold text-[#ef4444]">{highRiskAlerts}</span>
                <span className="text-[#ef4444]">↗</span>
              </div>
              <p className="mt-[3px] font-['JetBrains_Mono'] text-[8px] text-[#6f665c]">Needs review</p>
            </div>

            <div className="rounded-[9px] border border-[var(--app-border-strong)] bg-[var(--app-surface)] p-[12px]">
              <p className="font-['JetBrains_Mono'] text-[8px] uppercase text-[#756c61]">Check-In Rate</p>
              <div className="mt-[8px] flex items-end justify-between">
                <span className="font-['Figtree'] text-[27px] font-bold text-[#6b8ab0]">{checkInRate}%</span>
                <span className="text-[#6b8ab0]">↗</span>
              </div>
              <p className="mt-[3px] font-['JetBrains_Mono'] text-[8px] text-[#6f665c]">Current recovery view</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-[10px] border border-[var(--app-border-strong)] bg-[var(--app-surface)]">
            <div className="flex flex-col border-b border-[var(--app-border-strong)] lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-[7px] px-[10px] py-[8px]">
                <span className="rounded-full border border-[#7b3f00] bg-[rgba(243,116,34,0.05)] px-[8px] py-[4px] font-['JetBrains_Mono'] text-[8px] font-bold text-[#f37422]">SUPER ADMIN · JUST ONLY</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[980px]">
                <div className="grid grid-cols-[minmax(210px,1.7fr)_72px_100px_125px_110px_95px_90px_100px_70px_38px] items-center border-b border-[var(--app-border-strong)] px-[13px] py-[9px]">
                  {[
                    "USER",
                    "DAYS SOBER",
                    "STREAK",
                    "CHECK-IN RATE",
                    "RISK",
                    "LAST ACTIVE",
                    "STATUS",
                    "COUNSELOR",
                    "",
                    "ACTION",
                  ].map((heading) => (
                      <span key={heading} className="font-['JetBrains_Mono'] text-[9px] uppercase text-[#756c61]">
                      {heading}
                    </span>
                  ))}
                </div>

                {loading && <div className="px-[15px] py-[28px] font-['Figtree'] text-[13px] text-[#756c61]">Loading users...</div>}
                {!loading && error && <div className="px-[15px] py-[28px] font-['Figtree'] text-[13px] text-red-500">{error}</div>}
                {!loading && !error && enrichedUsers.length === 0 && <div className="px-[15px] py-[28px] font-['Figtree'] text-center font-['Figtree'] text-[13px] text-[#756c61]">No users found.</div>}

                {!loading && !error && enrichedUsers.map(({ user: u, extras }) => (
                  <div key={u.id} className="grid grid-cols-[minmax(210px,1.7fr)_72px_100px_125px_110px_95px_90px_100px_70px_38px] items-center border-b border-[var(--app-border-soft)] px-[13px] py-[9px] transition-colors hover:bg-[var(--app-hover)]">
                    <div className="flex min-w-0 items-center gap-[9px]">
                      <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[var(--app-hover)] font-['Figtree'] text-[12px] font-bold text-[var(--app-muted)]">
                        {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-['Figtree'] text-[13px] font-semibold leading-tight text-[var(--app-text)]">{u.name}</p>
                        <p className="truncate font-['JetBrains_Mono'] text-[10px] leading-tight text-[var(--app-muted)]">{u.email}</p>
                      </div>
                    </div>

                    <div className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#f37422]">{u.sobriety}</div>
                    <div className="font-['JetBrains_Mono'] text-[10px] font-bold text-[var(--app-text)]">{extras.streak}{extras.streak > 10 && <span className="ml-[3px] text-[#f37422]">•</span>}</div>
                    <CheckInBar rate={extras.checkInRate} />
                    <RiskPill risk={extras.risk} />
                    <span className="font-['Figtree'] text-[11px] text-[#8b8174]">{extras.lastActive}</span>
                    <UserStatus status={u.status} flagged={extras.flagged} />
                    <span className="truncate pr-[8px] font-['Figtree'] text-[11px] text-[#c4b9aa]">{u.counselor}</span>
                    <button
                      type="button"
                      title={`Edit ${u.name}`}
                      aria-label={`Edit ${u.name}`}
                      onClick={() => openEditUser(u)}
                      disabled={loadingEditId === u.id}
                      className="flex h-[25px] w-[25px] items-center justify-center rounded-[5px] text-[var(--app-muted)] transition-colors hover:bg-[rgba(243,116,34,0.12)] hover:text-[#f37422] disabled:cursor-wait disabled:opacity-50"
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/recovery/${u.id}`)}
                      className="flex items-center gap-[4px] font-['Figtree'] text-[11px] font-semibold text-[#f37422] hover:text-[#ff9a57]"
                    >
                      View <span aria-hidden="true">→</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
          </div>

          <div className="flex items-center justify-between border-t border-[var(--app-border-strong)] px-[13px] py-[10px]">
            <span className="font-['JetBrains_Mono'] text-[8px] text-[#756c61]">Page {page} · {totalCount.toLocaleString()} users</span>
            <div className="flex items-center gap-[4px]">
              <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={!hasPrev || loading} className="flex h-[26px] w-[26px] items-center justify-center rounded-[5px] border border-[var(--app-border-strong)] text-[var(--app-muted)] disabled:opacity-30"><ChevronLeft size={13} /></button>
              <span className="flex h-[26px] min-w-[26px] items-center justify-center rounded-[5px] bg-[#f37422] px-[7px] font-['JetBrains_Mono'] text-[9px] font-bold text-[#15110e]">{page}</span>
              <button type="button" onClick={() => setPage((value) => value + 1)} disabled={!hasNext || loading} className="flex h-[26px] w-[26px] items-center justify-center rounded-[5px] border border-[var(--app-border-strong)] text-[var(--app-muted)] disabled:opacity-30"><ChevronRight size={13} /></button>
            </div>
          </div>

        {modal === "add-user" && <AddUserModal onClose={() => setModal(null)} />}
        {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(null)} onSaved={bumpUsersVersion} />}
      </div>
    </div>
  );
}

