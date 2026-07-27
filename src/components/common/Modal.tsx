import { XCloseIcon } from "@/components/icons";

export function ModalOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/67" onClick={onClose} />
      <div className="relative z-10 max-h-[90vh] overflow-y-auto">{children}</div>
    </div>
  );
}

export function ModalCard({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div
      className="bg-[var(--app-bg)] rounded-[24px] p-[32px] relative shadow-[0_32px_64px_rgba(0,0,0,0.5)] w-full"
      style={{ maxWidth: wide ? "720px" : "640px" }}
    >
      <div className="absolute inset-0 rounded-[24px] border border-[var(--app-border)] pointer-events-none" />
      {children}
    </div>
  );
}

export function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between mb-[28px]">
      <p className="font-['Figtree'] font-bold text-[var(--app-text)] text-[24px]">{title}</p>
      <button
        onClick={onClose}
        className="w-[32px] h-[32px] rounded-full bg-[var(--app-surface)] flex items-center justify-center hover:bg-[var(--app-surface)] transition-colors cursor-pointer border border-[var(--app-border)]"
      >
        <XCloseIcon />
      </button>
    </div>
  );
}

export function ModalFooter({
  onCancel,
  onConfirm,
  confirmLabel,
  confirmDisabled,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  confirmDisabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-[16px] mt-[28px]">
      <button onClick={onCancel} className="relative px-[24px] py-[12px] rounded-[12px] font-['Figtree'] font-semibold text-[var(--app-muted)] text-[15px] cursor-pointer hover:text-[var(--app-text)] transition-colors">
        <div className="absolute inset-0 rounded-[12px] border border-[var(--app-border)] pointer-events-none" />
        Cancel
      </button>
      <button
        onClick={onConfirm}
        disabled={confirmDisabled}
        className="px-[24px] py-[12px] rounded-[12px] bg-[#f37422] font-['Figtree'] font-semibold text-white text-[15px] shadow-[0_4px_8px_rgba(243,116,34,0.25)] hover:bg-[#e06820] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {confirmLabel}
      </button>
    </div>
  );
}

export function SectionLabel({ label }: { label: string }) {
  return <p className="font-['JetBrains_Mono'] font-bold text-[var(--app-muted)] text-[11px] uppercase tracking-wide">{label}</p>;
}
