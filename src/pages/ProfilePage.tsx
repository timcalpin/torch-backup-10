import { useAppContext } from "@/app/app-context";
import { PageHeader } from "@/components/common/PageHeader";

export function ProfilePage() {
  const { logout } = useAppContext();
  return (
    <div className="flex-1 min-w-0 overflow-y-auto">
      <div className="p-[24px] lg:p-[32px] max-w-[980px] flex flex-col gap-[20px]">
        <PageHeader eyebrow="SUPER ADMIN · ACCOUNT" title="Profile" />
        <section className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-[12px] p-[22px] flex items-center justify-between">
          <div className="flex items-center gap-[16px]">
            <div className="w-[58px] h-[58px] rounded-full bg-[#f37422] text-white font-['Figtree'] font-bold text-[18px] flex items-center justify-center">SA</div>
            <div>
              <p className="font-['Figtree'] font-bold text-[18px] text-[var(--app-text)]">Sarah Adams</p>
              <p className="font-['Figtree'] text-[13px] text-[var(--app-muted)]">sarah.adams@torch.admin · Super Admin</p>
            </div>
          </div>
          <span className="rounded-full bg-[rgba(74,222,128,0.12)] text-[#4ade80] px-[10px] py-[5px] font-['JetBrains_Mono'] font-bold text-[9px]">ACTIVE</span>
        </section>
        <section className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-[12px] p-[20px]">
          <p className="font-['JetBrains_Mono'] text-[#f37422] font-bold text-[10px] tracking-widest">SESSION SECURITY</p>
          <p className="mt-[10px] font-['Figtree'] text-[13px] text-[var(--app-muted)]">Multi-factor authentication is enabled. This session expires after 30 minutes of inactivity.</p>
          <button onClick={logout} className="mt-[18px] h-[38px] px-[14px] rounded-[9px] border border-[#ef4444] text-[#ef4444] font-['Figtree'] font-semibold text-[12px] cursor-pointer">Sign out</button>
        </section>
      </div>
    </div>
  );
}
