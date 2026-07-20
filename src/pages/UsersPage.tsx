import { useState } from "react";
import { UserRound } from "lucide-react";
import { useAppContext } from "@/app/app-context";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchBox } from "@/components/common/SearchBox";
import { PrimaryBtn } from "@/components/common/Buttons";
import { MetricCard } from "@/components/common/MetricCard";
import { TableCard, TableHead, TableRow } from "@/components/common/Table";
import { StatusPill } from "@/components/common/StatusPill";
import { ActionBtn } from "@/components/common/ActionBtn";
import { EditIcon } from "@/components/icons";
import { ModalOverlay, ModalCard, ModalHeader, ModalFooter } from "@/components/common/Modal";
import { FormField, TextInput, SelectInput } from "@/components/common/FormFields";

const USERS = [
  { id: 1, name: "Marcus Aurelius", email: "m.aurelius@email.com", role: "Patient", counselor: "Dr. Chen", sobriety: "142 days", status: "ACTIVE" as const },
  { id: 2, name: "Jordan Taylor", email: "j.taylor@email.com", role: "Patient", counselor: "Sarah K.", sobriety: "89 days", status: "ACTIVE" as const },
  { id: 3, name: "Riley Singh", email: "r.singh@email.com", role: "Patient", counselor: "Maria L.", sobriety: "14 days", status: "PENDING" as const },
  { id: 4, name: "Casey Park", email: "c.park@email.com", role: "Patient", counselor: "Dr. Chen", sobriety: "365 days", status: "ACTIVE" as const },
  { id: 5, name: "Morgan Davis", email: "m.davis@email.com", role: "Patient", counselor: "Unassigned", sobriety: "7 days", status: "PENDING" as const },
];

function UserRecordModal({ user, mode, onClose }: { user: (typeof USERS)[number]; mode: "view" | "edit"; onClose: () => void }) {
  const initials = user.name.split(" ").map((name) => name[0]).join("").slice(0, 2);
  return <ModalOverlay onClose={onClose}><ModalCard><ModalHeader title={mode === "view" ? "User profile" : "Edit user"} onClose={onClose} />
    {mode === "view" ? <div className="flex flex-col gap-[20px]"><div className="flex items-center gap-[14px]"><div className="w-[48px] h-[48px] rounded-full bg-[rgba(243,116,34,0.18)] text-[#f37422] font-['Figtree'] font-bold text-[16px] flex items-center justify-center">{initials}</div><div><p className="font-['Figtree'] font-bold text-[17px] text-[var(--app-text)]">{user.name}</p><p className="font-['Figtree'] text-[13px] text-[var(--app-muted)]">{user.email}</p></div></div><div className="grid grid-cols-2 gap-[12px]">{[["Role", user.role], ["Assigned counselor", user.counselor], ["Sobriety", user.sobriety]].map(([label, value]) => <div key={label} className="rounded-[9px] bg-[var(--app-surface)] border border-[var(--app-border)] p-[12px]"><p className="font-['JetBrains_Mono'] text-[9px] text-[var(--app-muted)]">{label}</p><p className="mt-[4px] font-['Figtree'] font-semibold text-[13px] text-[var(--app-text)]">{value}</p></div>)}<div className="rounded-[9px] bg-[var(--app-surface)] border border-[var(--app-border)] p-[12px]"><p className="font-['JetBrains_Mono'] text-[9px] text-[var(--app-muted)]">Account status</p><div className="mt-[5px]"><StatusPill status={user.status} /></div></div></div></div> : <div className="flex flex-col gap-[16px]"><FormField label="Full name" required><TextInput defaultValue={user.name} /></FormField><FormField label="Email address" required><TextInput defaultValue={user.email} /></FormField><div className="grid grid-cols-2 gap-[14px]"><FormField label="Role"><SelectInput options={["Patient", "Counselor", "Admin"]} defaultValue={user.role} /></FormField><FormField label="Counselor"><SelectInput options={[user.counselor, "Dr. Chen", "Sarah K.", "Unassigned"]} defaultValue={user.counselor} /></FormField></div></div>}
    <ModalFooter onCancel={onClose} onConfirm={onClose} confirmLabel={mode === "view" ? "Close" : "Save changes"} /></ModalCard></ModalOverlay>;
}

export function UsersPage() {
  const { setModal } = useAppContext();
  const [search, setSearch] = useState("");
  const [viewUser, setViewUser] = useState<(typeof USERS)[number] | null>(null);
  const [editUser, setEditUser] = useState<(typeof USERS)[number] | null>(null);
  const filtered = USERS.filter((u) => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 min-w-0 overflow-y-auto">
      <div className="p-[24px] lg:p-[32px] flex flex-col gap-[20px]">
        <PageHeader eyebrow="REGISTERED 2,847 · ACTIVE THIS WEEK 1,204" title="User Management">
          <SearchBox placeholder="Search users..." value={search} onChange={setSearch} />
          <PrimaryBtn label="+ Add User" onClick={() => setModal("add-user")} />
        </PageHeader>

        <div className="flex gap-[10px] flex-wrap">
          <MetricCard label="TOTAL USERS" value="2,847" delta="↑ +42 this week" deltaColor="#4ade80" accentColor="#f37422" />
          <MetricCard label="ACTIVE THIS WEEK" value="1,204" delta="↑ +8% vs last week" deltaColor="#4ade80" accentColor="#4ade80" />
          <MetricCard label="NEW THIS MONTH" value="84" delta="↑ +12 vs last month" deltaColor="#4ade80" accentColor="#6b8ab0" />
          <MetricCard label="PENDING REVIEW" value="12" delta="↓ 3 resolved today" deltaColor="#4ade80" accentColor="#facc15" />
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
                { label: "ACTIONS", w: "w-[70px] text-right" },
              ]} />
              {filtered.map((u) => (
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
                  <div className="w-[70px] flex items-center justify-end gap-[10px]">
                    <ActionBtn onClick={() => setViewUser(u)} title="View user profile" icon={<UserRound size={15} strokeWidth={1.8} />} />
                    <ActionBtn onClick={() => setEditUser(u)} title="Edit user" icon={<EditIcon />} />
                  </div>
                </TableRow>
              ))}
            </div>
          </div>
        </TableCard>
        {viewUser && <UserRecordModal user={viewUser} mode="view" onClose={() => setViewUser(null)} />}
        {editUser && <UserRecordModal user={editUser} mode="edit" onClose={() => setEditUser(null)} />}
      </div>
    </div>
  );
}
