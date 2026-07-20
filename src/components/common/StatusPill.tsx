export function StatusPill({ status }: { status: "ACTIVE" | "PENDING" | "ARCHIVED" }) {
  const cfg = {
    ACTIVE: { bg: "rgba(74,222,128,0.15)", color: "#4ade80", dot: "#4ade80", border: "rgba(74,222,128,0.3)" },
    PENDING: { bg: "rgba(250,204,21,0.15)", color: "#facc15", dot: "#facc15", border: "rgba(250,204,21,0.3)" },
    ARCHIVED: { bg: "rgba(138,128,115,0.15)", color: "#8a8073", dot: "#8a8073", border: "rgba(138,128,115,0.3)" },
  }[status];
  return (
    <span
      className="inline-flex items-center gap-[6px] px-[8px] py-[4px] rounded-full font-['JetBrains_Mono'] font-bold text-[10px]"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
    >
      <span className="w-[6px] h-[6px] rounded-full" style={{ background: cfg.dot }} />
      {status}
    </span>
  );
}
