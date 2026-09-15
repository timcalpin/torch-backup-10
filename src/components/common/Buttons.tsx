export function GhostBtn({ label, icon, onClick, disabled = false }: { label: string; icon?: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative h-[38px] inline-flex items-center gap-[8px] px-[14px] rounded-[9px] bg-[var(--app-surface)] cursor-pointer hover:bg-[var(--app-hover)] hover:border-[#f37422] transition-colors disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-[var(--app-border-strong)]"
    >
      <div className="absolute inset-0 rounded-[10px] border border-[var(--app-border-strong)] pointer-events-none" />
      {icon && <span className="text-[var(--app-muted)] leading-none">{icon}</span>}
      <span className="font-['Figtree'] font-semibold text-[var(--app-muted)] text-[13px]">{label}</span>
    </button>
  );
}

export function PrimaryBtn({ label, onClick, disabled = false }: { label: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="h-[38px] inline-flex items-center px-[16px] rounded-[9px] bg-gradient-to-r from-[#f37422] to-[#c04a12] font-['Figtree'] font-semibold text-white text-[13px] shadow-[0_4px_8px_rgba(243,116,34,0.22)] hover:brightness-110 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:brightness-100"
    >
      {label}
    </button>
  );
}
