import { useEffect, useState } from "react";

export function FileDropzone({
  label,
  hint,
  file,
  onChange,
  accept,
  compact,
  previewUrl,
}: {
  label: string;
  hint?: string;
  file: File | null;
  onChange: (file: File | null) => void;
  accept: string;
  compact?: boolean;
  previewUrl?: string | null;
}) {
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setFilePreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setFilePreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const imageUrl = filePreviewUrl || previewUrl || undefined;

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
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Current thumbnail"
          className="h-[32px] w-[48px] rounded-[4px] object-cover"
        />
      )}
      <span className="font-['Figtree'] font-semibold text-[var(--app-text)] text-[12px] px-2 text-center truncate max-w-full">
        {file ? file.name : label}
      </span>
      {!file && hint && <span className="font-['Figtree'] font-normal text-[var(--app-muted)] text-[12px]">{hint}</span>}
    </label>
  );
}
