import { useAppContext } from "@/app/app-context";

export function SettingsPage() {
  const { darkMode, setDarkMode } = useAppContext();
  const onToggleTheme = () => setDarkMode((value) => !value);
  const surface = darkMode ? "#15110e" : "#ffffff";
  const text = darkMode ? "#f4ede3" : "#25211d";
  const muted = darkMode ? "#8a8073" : "#736c63";
  const rule = darkMode ? "rgba(244,237,227,0.08)" : "rgba(54,43,31,0.13)";

  return (
    <div className="flex-1 min-w-0 overflow-y-auto" style={{ background: darkMode ? "#0a0a0b" : "#f5f1eb" }}>
      <div className="p-[24px] lg:p-[32px] max-w-[1080px] flex flex-col gap-[20px]">
        <div>
          <p className="font-['JetBrains_Mono'] font-bold text-[#f37422] text-[10px] uppercase tracking-widest mb-[4px]">SYSTEM CONFIGURATION</p>
          <h1 className="font-['Figtree'] font-bold text-[28px] leading-tight" style={{ color: text }}>Settings</h1>
        </div>
        <p className="font-['Figtree'] text-[14px] -mt-[12px]" style={{ color: muted }}>
          Configure the administrative workspace and how the console is displayed.
        </p>

        <section className="rounded-[12px] relative overflow-hidden" style={{ background: surface, border: `1px solid ${rule}` }}>
          <div className="p-[20px] flex items-center justify-between gap-[24px]">
            <div className="flex items-start gap-[14px]">
              <div className="w-[38px] h-[38px] rounded-[10px] bg-[rgba(243,116,34,0.14)] flex items-center justify-center text-[#f37422] font-['JetBrains_Mono'] font-bold text-[15px]">◐</div>
              <div>
                <p className="font-['Figtree'] font-semibold text-[15px]" style={{ color: text }}>Console appearance</p>
                <p className="font-['Figtree'] text-[13px] mt-[3px]" style={{ color: muted }}>Use {darkMode ? "the dark operational theme" : "a light, high-contrast workspace"}.</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={darkMode}
              onClick={onToggleTheme}
              className="flex-shrink-0 flex items-center gap-[10px] cursor-pointer"
            >
              <span className="font-['JetBrains_Mono'] font-bold text-[10px] tracking-wide" style={{ color: darkMode ? "#f37422" : muted }}>{darkMode ? "DARK" : "LIGHT"}</span>
              <span className={`w-[48px] h-[26px] rounded-full p-[3px] flex items-center transition-colors duration-200 shadow-inner ${darkMode ? "justify-end bg-[#d85d12]" : "justify-start bg-[#b9afa3]"}`}>
                <span className="block w-[20px] h-[20px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.28)]" />
              </span>
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-[16px]">
          <section className="rounded-[12px] p-[20px]" style={{ background: surface, border: `1px solid ${rule}` }}>
            <p className="font-['JetBrains_Mono'] font-bold text-[#f37422] text-[10px] tracking-widest">NOTIFICATIONS</p>
            <p className="font-['Figtree'] font-semibold text-[15px] mt-[10px]" style={{ color: text }}>Admin notifications</p>
            <p className="font-['Figtree'] text-[13px] mt-[4px] leading-relaxed" style={{ color: muted }}>Critical member safety signals and event changes are sent to the administrator inbox.</p>
            <button className="mt-[16px] rounded-[8px] px-[12px] py-[8px] font-['Figtree'] font-semibold text-[12px] text-[#f37422] bg-[rgba(243,116,34,0.1)] cursor-pointer">Manage notifications</button>
          </section>
          <section className="rounded-[12px] p-[20px]" style={{ background: surface, border: `1px solid ${rule}` }}>
            <p className="font-['JetBrains_Mono'] font-bold text-[#f37422] text-[10px] tracking-widest">ACCESS</p>
            <p className="font-['Figtree'] font-semibold text-[15px] mt-[10px]" style={{ color: text }}>Session security</p>
            <p className="font-['Figtree'] text-[13px] mt-[4px] leading-relaxed" style={{ color: muted }}>Sessions expire after 30 minutes of inactivity. Multi-factor authentication is required for super admins.</p>
            <button className="mt-[16px] rounded-[8px] px-[12px] py-[8px] font-['Figtree'] font-semibold text-[12px] text-[#f37422] bg-[rgba(243,116,34,0.1)] cursor-pointer">Review access controls</button>
          </section>
        </div>
      </div>
    </div>
  );
}
