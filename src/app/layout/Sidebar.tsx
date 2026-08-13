import { useEffect, useState } from "react";
import { Lightbulb, SlidersHorizontal, FileText, Target } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  TorchFlame,
  UsersNavIcon,
  MessageCircleIcon,
  CalendarIcon,
  FileIcon,
  ClipboardIcon,
  ChartColumnIcon,
  AlertCircleIcon,
  CircleXIcon,
} from "@/components/icons";
import { useAppContext } from "@/app/app-context";
import { getUserStats } from "@/lib/users";
import { getSupportGroupStats } from "@/lib/supportGroups";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: string | number;
  active?: boolean;
  lightMode?: boolean;
}

function NavItem({ to, icon, label, badge, active, lightMode = false }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={`w-full relative rounded-[10px] flex items-center gap-[10px] px-[12px] py-[9px] cursor-pointer transition-all text-left ${
        active
          ? "bg-[rgba(243,116,34,0.12)]"
          : lightMode ? "hover:bg-[rgba(45,37,29,0.05)]" : "hover:bg-[var(--app-hover)]"
      }`}
    >
      {active && (
        <div className="absolute inset-0 rounded-[10px] border border-[rgba(243,116,34,0.3)] pointer-events-none" />
      )}
      {icon}
      <span
        className={`flex-1 min-w-0 font-['Figtree'] text-[13px] leading-normal ${
          active ? "font-semibold text-[#d85d12]" : lightMode ? "font-normal text-[#5e554a]" : "font-normal text-[var(--app-muted)]"
        }`}
      >
        {label}
      </span>
      {badge != null && (
        <span
          className={`inline-flex items-center px-[6px] py-[2px] rounded-[4px] font-['JetBrains_Mono'] font-bold text-[9px] ${
            active
              ? "bg-[rgba(243,116,34,0.12)] text-[#d85d12]"
              : lightMode ? "bg-[rgba(94,85,74,0.08)] text-[#5e554a]" : "bg-[rgba(138,128,115,0.1)] text-[var(--app-muted)]"
          }`}
        >
          {badge}
        </span>
      )}
    </NavLink>
  );
}

function NavSection({ label, children, lightMode = false }: { label: string; children: React.ReactNode; lightMode?: boolean }) {
  return (
    <div className="flex flex-col gap-[8px]">
      <p className={`font-['JetBrains_Mono'] font-bold text-[9px] tracking-widest uppercase ${lightMode ? "text-[#84796d]" : "text-[var(--app-muted)]"}`}>
        {label}
      </p>
      {children}
    </div>
  );
}

interface SidebarProps { pathname: string; lightMode: boolean; }

function initials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export function Sidebar({ pathname, lightMode }: SidebarProps) {
  const { user, usersVersion, groupsVersion } = useAppContext();
  const is = (path: string) => pathname === path;
  const iconColor = (path: string) => is(path) ? "#F37422" : lightMode ? "#2C241D" : "#8A8073";

  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [groupsCount, setGroupsCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getUserStats()
      .then((stats) => {
        if (!cancelled) setUsersCount(stats.total_users);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [usersVersion]);

  useEffect(() => {
    let cancelled = false;
    getSupportGroupStats()
      .then((stats) => {
        if (!cancelled) setGroupsCount(stats.total_groups);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [groupsVersion]);

  return (
    <div className={`w-[240px] flex-shrink-0 flex flex-col justify-between h-full relative transition-colors duration-200 ${lightMode ? "bg-[#f5f1eb]" : "bg-[var(--app-bg)]"}`}>
      <div className={`absolute inset-0 border-r pointer-events-none ${lightMode ? "border-[rgba(54,43,31,0.12)]" : "border-[var(--app-border-soft)]"}`} />

      <div className="flex flex-col overflow-y-auto">
        {/* Brand */}
        <div className="flex items-center gap-[10px] px-[22px] pt-[20px] pb-[24px]">
          <TorchFlame />
          <div>
            <p className={`font-['Figtree'] font-extrabold text-[15px] leading-tight ${lightMode ? "text-[#29231d]" : "text-[var(--app-text)]"}`}>torch</p>
            <p className={`font-['JetBrains_Mono'] font-bold text-[8.5px] leading-tight ${lightMode ? "text-[#84796d]" : "text-[var(--app-muted)]"}`}>ADMIN CONSOLE</p>
          </div>
        </div>

        {/* Nav */}
        <div className="px-[16px] flex flex-col gap-[24px] pb-4">
          <NavSection label="MANAGEMENT" lightMode={lightMode}>
            <NavItem to="/users" icon={<UsersNavIcon color={iconColor("/users")} />} label="Users" badge={usersCount ?? undefined} active={is("/users")} lightMode={lightMode} />
            <NavItem to="/support-groups" icon={<MessageCircleIcon color={iconColor("/support-groups")} />} label="Support Groups" badge={groupsCount ?? undefined} active={is("/support-groups")} lightMode={lightMode} />
            <NavItem to="/resources/real-world" icon={<CalendarIcon color={iconColor("/resources/real-world")} />} label="Real World Resources" active={is("/resources/real-world")} lightMode={lightMode} />
            <NavItem to="/resources/in-app" icon={<FileIcon color={iconColor("/resources/in-app")} />} label="In-App Resources" active={is("/resources/in-app")} lightMode={lightMode} />
            <NavItem to="/treatment-plans" icon={<ClipboardIcon color={iconColor("/treatment-plans")} />} label="Treatment Plans" active={is("/treatment-plans")} lightMode={lightMode} />
            <NavItem to="/intake-scripts" icon={<FileText size={14} strokeWidth={1.7} color={iconColor("/intake-scripts")} />} label="Intake Scripts" active={is("/intake-scripts")} lightMode={lightMode} />
            <NavItem to="/goals" icon={<Target size={14} strokeWidth={1.7} color={iconColor("/goals")} />} label="Goals" active={is("/goals")} lightMode={lightMode} />
            <NavItem to="/counselors" icon={<UsersNavIcon color={iconColor("/counselors")} />} label="Counselors" active={is("/counselors")} lightMode={lightMode} />
          </NavSection>

          <NavSection label="ANALYTICS" lightMode={lightMode}>
            <NavItem to="/aggregate-data" icon={<ChartColumnIcon color={iconColor("/aggregate-data")} />} label="Aggregate Data" active={is("/aggregate-data")} lightMode={lightMode} />
            <NavItem to="/relapse-signals" icon={<AlertCircleIcon color={iconColor("/relapse-signals")} />} label="Relapse Signals" active={is("/relapse-signals")} lightMode={lightMode} />
            <NavItem to="/insights" icon={<Lightbulb size={14} strokeWidth={1.7} color={iconColor("/insights")} />} label="Insights" active={is("/insights")} lightMode={lightMode} />
          </NavSection>

          <NavSection label="SYSTEM" lightMode={lightMode}>
            <NavItem to="/settings" icon={<SlidersHorizontal size={14} strokeWidth={1.7} color={iconColor("/settings")} />} label="Settings" active={is("/settings")} lightMode={lightMode} />
            <NavItem to="/privacy" icon={<CircleXIcon color={iconColor("/privacy")} />} label="Privacy & Compliance" active={is("/privacy")} lightMode={lightMode} />
          </NavSection>
        </div>
      </div>

      {/* Footer */}
      <div className="relative flex-shrink-0">
        <div className={`absolute inset-0 border-t pointer-events-none ${lightMode ? "border-[rgba(54,43,31,0.12)]" : "border-[var(--app-border-soft)]"}`} />
        <NavLink to="/profile" className="w-full flex items-center gap-[10px] p-[16px] text-left cursor-pointer hover:bg-[var(--app-hover)] transition-colors">
          <div className="w-[32px] h-[32px] rounded-full bg-[#f37422] flex items-center justify-center flex-shrink-0">
            <span className="font-['Figtree'] font-bold text-white text-[11px]">{user ? initials(user.full_name || user.email) : "…"}</span>
          </div>
          <div>
            <p className={`font-['Figtree'] font-semibold text-[12px] leading-tight ${lightMode ? "text-[#29231d]" : "text-[var(--app-text)]"}`}>{user?.full_name.trim() || user?.email || "Loading..."}</p>
            <p className={`font-['JetBrains_Mono'] font-normal text-[10px] leading-tight ${lightMode ? "text-[#84796d]" : "text-[var(--app-muted)]"}`}>{user ? (user.is_superuser ? "Super Admin" : user.is_staff ? "Staff" : "User") : ""}</p>
          </div>
        </NavLink>
      </div>
    </div>
  );
}