import { useState } from "react";
import { useAppContext } from "../app/app-context";
import { TorchFlame } from "../components/icons";

export function LoginPage() {
  const { login, loginLoading, loginError } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="app-shell min-h-screen w-full flex items-center justify-center bg-[var(--app-bg)] p-[24px]">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          login(email, password).catch(() => {});
        }}
        className="w-full max-w-[420px] bg-[var(--app-surface)] border border-[var(--app-border)] rounded-[14px] p-[30px] shadow-2xl"
      >
        <div className="flex items-center gap-[10px]">
          <TorchFlame />
          <div>
            <p className="font-['Figtree'] font-extrabold text-[16px] text-[var(--app-text)]">torch</p>
            <p className="font-['JetBrains_Mono'] text-[8px] text-[var(--app-muted)]">ADMIN CONSOLE</p>
          </div>
        </div>
        <p className="mt-[30px] font-['JetBrains_Mono'] text-[#f37422] font-bold text-[10px] tracking-widest">SECURE ACCESS</p>
        <h1 className="mt-[5px] font-['Figtree'] font-bold text-[28px] text-[var(--app-text)]">Admin Portal</h1>
        <label className="block mt-[22px] font-['JetBrains_Mono'] text-[9px] text-[var(--app-muted)]">
          EMAIL
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-[6px] w-full rounded-[8px] border border-[var(--app-border-strong)] bg-transparent px-[12px] py-[10px] font-['Figtree'] text-[13px] text-[var(--app-text)]"
          />
        </label>
        <label className="block mt-[14px] font-['JetBrains_Mono'] text-[9px] text-[var(--app-muted)]">
          PASSWORD
          <input
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-[6px] w-full rounded-[8px] border border-[var(--app-border-strong)] bg-transparent px-[12px] py-[10px] font-['Figtree'] text-[13px] text-[var(--app-text)]"
          />
        </label>
        {loginError && (
          <p className="mt-[14px] font-['Figtree'] text-[12px] text-red-500">{loginError}</p>
        )}
        <button
          type="submit"
          disabled={loginLoading}
          className="mt-[22px] w-full h-[42px] rounded-[9px] bg-gradient-to-r from-[#f37422] to-[#c04a12] font-['Figtree'] font-semibold text-white text-[13px] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loginLoading ? "Signing in..." : "Sign in securely"}
        </button>
      </form>
    </div>
  );
}
