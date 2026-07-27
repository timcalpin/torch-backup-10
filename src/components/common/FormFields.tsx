import { ChevronDownIcon } from "@/components/icons";

export function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[8px]">
      <div className="flex items-center gap-[4px]">
        <span className="font-['JetBrains_Mono'] font-bold text-[var(--app-muted)] text-[11px] uppercase tracking-wide">{label}</span>
        {required && <span className="text-[#f37422] text-[11px] font-bold">*</span>}
      </div>
      {children}
    </div>
  );
}

export function TextInput({
  placeholder,
  defaultValue,
  value,
  onChange,
  type = "text",
  required,
}: {
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: "text" | "email" | "date" | "number" | "time";
  required?: boolean;
}) {
  return (
    <div className="relative bg-[var(--app-surface)] h-[44px] rounded-[10px]">
      <div className="absolute inset-0 rounded-[10px] border border-[var(--app-border)] pointer-events-none" />
      <input
        type={type}
        placeholder={placeholder}
        defaultValue={onChange ? undefined : defaultValue}
        value={onChange ? value : undefined}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        required={required}
        className="w-full h-full bg-transparent px-[14px] font-['Figtree'] font-normal text-[var(--app-text)] text-[14px] placeholder-[var(--app-muted)] outline-none"
      />
    </div>
  );
}

export function TextArea({
  placeholder,
  rows = 4,
  value,
  onChange,
}: {
  placeholder?: string;
  rows?: number;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="relative bg-[var(--app-surface)] rounded-[10px]">
      <div className="absolute inset-0 rounded-[10px] border border-[var(--app-border)] pointer-events-none" />
      <textarea
        placeholder={placeholder}
        rows={rows}
        value={onChange ? value : undefined}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className="w-full bg-transparent p-[14px] font-['Figtree'] font-normal text-[var(--app-text)] text-[14px] placeholder-[var(--app-muted)] outline-none resize-none"
      />
    </div>
  );
}

export function SelectInput({
  options,
  defaultValue,
  value,
  onChange,
}: {
  options: string[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="relative bg-[var(--app-surface)] h-[44px] rounded-[10px]">
      <div className="absolute inset-0 rounded-[10px] border border-[var(--app-border)] pointer-events-none" />
      <select
        defaultValue={onChange ? undefined : defaultValue ?? options[0]}
        value={onChange ? value : undefined}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className="w-full h-full bg-transparent px-[14px] font-['Figtree'] font-normal text-[var(--app-text)] text-[14px] outline-none appearance-none cursor-pointer"
      >
        {options.map((o, index) => (
          <option key={`${o}-${index}`} value={o} className="bg-[var(--app-surface)]">{o}</option>
        ))}
      </select>
      <div className="absolute right-[14px] top-1/2 -translate-y-1/2 pointer-events-none">
        <ChevronDownIcon />
      </div>
    </div>
  );
}
