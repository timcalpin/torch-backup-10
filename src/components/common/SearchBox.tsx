import { SearchIcon } from "@/components/icons";

export function SearchBox({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative bg-[var(--app-surface)] rounded-[10px] w-[260px]">
      <div className="absolute inset-0 rounded-[10px] border border-[var(--app-border)] pointer-events-none" />
      <div className="flex items-center gap-[10px] px-[12px] py-[10px]">
        <SearchIcon />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 bg-transparent font-['Figtree'] font-normal text-[var(--app-muted)] text-[13px] outline-none placeholder-[var(--app-muted)]"
        />
      </div>
    </div>
  );
}
