export function Toggle({ on }: { on: boolean }) {
  return (
    <div className={`w-[36px] h-[20px] rounded-full flex items-center px-[3px] transition-colors ${on ? "bg-[#f37422]" : "bg-[var(--app-border-strong)]"}`}>
      <div className={`w-[14px] h-[14px] rounded-full bg-white transition-transform ${on ? "translate-x-[16px]" : "translate-x-0"}`} />
    </div>
  );
}
