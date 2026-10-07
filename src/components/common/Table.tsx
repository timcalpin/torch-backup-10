export function TableCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[var(--app-surface)] rounded-[12px] relative overflow-hidden">
      <div className="absolute inset-0 rounded-[12px] border border-[var(--app-border)] pointer-events-none" />
      {children}
    </div>
  );
}

export function TableToolbar({
  title,
  tabs,
  activeTab,
  onTab,
  sortLabel,
}: {
  title: string;
  tabs: string[];
  activeTab: string;
  onTab: (t: string) => void;
  sortLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between px-[18px] py-[14px] border-b border-[var(--app-border)] flex-wrap gap-2">
      <div className="flex items-center gap-[12px] flex-wrap">
        <span className="font-['Figtree'] font-semibold text-[var(--app-text)] text-[14px]">{title}</span>
        <div className="w-px h-[14px] bg-[var(--app-border)]" />
        <div className="flex items-center gap-[6px] flex-wrap">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => onTab(t)}
              className={`px-[10px] py-[4px] rounded-[6px] font-['Figtree'] text-[12px] cursor-pointer transition-all ${
                activeTab === t
                  ? "bg-[rgba(243,116,34,0.15)] text-[#f37422] font-bold border border-[rgba(243,116,34,0.3)]"
                  : "text-[var(--app-muted)] font-medium hover:text-[var(--app-text)] border border-transparent"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      {sortLabel && (
        <div className="flex items-center gap-[6px] px-[8px] py-[4px] rounded-[6px] border border-[var(--app-border)]">
          <span className="font-['JetBrains_Mono'] text-[var(--app-muted)] text-[10px]">Sort: </span>
          <span className="font-['JetBrains_Mono'] font-bold text-[var(--app-text)] text-[10px]">{sortLabel}</span>
        </div>
      )}
    </div>
  );
}

export function TableHead({ cols }: { cols: { label: React.ReactNode; w?: string }[] }) {
  return (
    <div className="border-b border-[var(--app-border)]">
      <div className="flex items-center px-[18px] py-[11px] font-['JetBrains_Mono'] font-bold text-[var(--app-muted)] text-[10px] uppercase tracking-wide">
        {cols.map((c, index) => (
          <div key={index} className={c.w ?? "flex-1 min-w-0"}>
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center px-[18px] h-[60px] border-b border-[var(--app-border-soft)] last:border-b-0 hover:bg-[var(--app-hover)] transition-colors">
      {children}
    </div>
  );
}
