export function FileDropzone({
  label,
  hint,
  file,
  onChange,
  accept,
  compact,
}: {
  label: string;
  hint?: string;
  file: File | null;
  onChange: (file: File | null) => void;
  accept: string;
  compact?: boolean;
}) {
  return (
    <label
      className={`relative bg-[var(--app-surface)] ${compact ? "h-[80px]" : "h-[120px]"} rounded-[10px] border border-dashed border-[#8a8073] flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#f37422] transition-colors`}
    >
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      <span className="font-['Figtree'] font-semibold text-[var(--app-text)] text-[12px] px-2 text-center truncate max-w-full">
        {file ? file.name : label}
      </span>
      {!file && hint && <span className="font-['Figtree'] font-normal text-[var(--app-muted)] text-[12px]">{hint}</span>}
    </label>
  );
}
