export function PlaceholderPage({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <p className="font-['JetBrains_Mono'] font-bold text-[#f37422] text-[10px] uppercase tracking-widest mb-[8px]">{subtitle}</p>
        <h1 className="font-['Figtree'] font-bold text-[var(--app-text)] text-[28px]">{title}</h1>
        <p className="font-['Figtree'] text-[var(--app-muted)] text-[14px] mt-[8px]">This section is coming soon.</p>
      </div>
    </div>
  );
}
