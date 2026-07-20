function SparkLine({ color }: { color: string }) {
  return (
    <svg width="60" height="28" viewBox="0 0 60 28" fill="none">
      <line x1="0" y1="22" x2="12" y2="17" stroke={color} strokeWidth="1.5" opacity="0.5" />
      <line x1="12" y1="17" x2="24" y2="15" stroke={color} strokeWidth="1.5" opacity="0.5" />
      <line x1="24" y1="15" x2="36" y2="16" stroke={color} strokeWidth="1.5" opacity="0.5" />
      <line x1="36" y1="16" x2="48" y2="13" stroke={color} strokeWidth="1.5" opacity="0.5" />
      <line x1="48" y1="13" x2="60" y2="7" stroke={color} strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

export function MetricCard({
  label,
  value,
  delta,
  deltaColor,
  accentColor,
}: {
  label: string;
  value: string;
  delta: string;
  deltaColor: string;
  accentColor: string;
}) {
  return (
    <div className="bg-[var(--app-surface)] flex-1 min-w-[160px] relative rounded-[12px]">
      <div className="absolute inset-0 rounded-[12px] border border-[var(--app-border)] pointer-events-none" />
      <div className="p-[16px] flex flex-col gap-[12px]">
        <div className="flex items-start justify-between">
          <p className="font-['JetBrains_Mono'] font-bold text-[var(--app-muted)] text-[10px] uppercase tracking-wide leading-tight">
            {label}
          </p>
          <SparkLine color={accentColor} />
        </div>
        <div>
          <p
            className="font-['Figtree'] font-bold text-[32px] leading-none"
            style={{ color: accentColor }}
          >
            {value}
          </p>
          <p
            className="font-['JetBrains_Mono'] font-extrabold text-[10px] mt-1"
            style={{ color: deltaColor }}
          >
            {delta}
          </p>
        </div>
      </div>
    </div>
  );
}
