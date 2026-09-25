import { ImageOff } from "lucide-react";
import { useState } from "react";

export function Thumbnail({ url, alt }: { url?: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return (
      <div className="flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center rounded-full bg-[rgba(138,128,115,0.15)]" aria-label="No thumbnail available">
        <ImageOff size={15} className="text-[var(--app-muted)]" />
      </div>
    );
  }

  return <img src={url} alt={alt} onError={() => setFailed(true)} className="h-[32px] w-[32px] flex-shrink-0 rounded-full object-cover" />;
}
