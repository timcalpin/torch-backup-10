export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between flex-wrap gap-[12px]">
      <div>
        <p className="font-['JetBrains_Mono'] font-bold text-[#f37422] text-[10px] uppercase tracking-widest mb-[4px]">
          {eyebrow}
        </p>
        <h1 className="font-['Figtree'] font-bold text-[var(--app-text)] text-[28px] leading-tight">{title}</h1>
      </div>
      {children && <div className="flex items-center gap-[10px] flex-wrap">{children}</div>}
    </div>
  );
}
