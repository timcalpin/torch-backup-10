import { createContext, useContext, useEffect, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";

export type Modal =
  | null
  | "create-group"
  | "create-event"
  | "add-user"
  | "add-counselor"
  | "edit-user"
  | "new-plan"
  | "add-content"
  | "add-literature"
  | "export-insights";

interface AppContextValue {
  authenticated: boolean;
  login: () => void;
  logout: () => void;
  darkMode: boolean;
  setDarkMode: Dispatch<SetStateAction<boolean>>;
  modal: Modal;
  setModal: Dispatch<SetStateAction<Modal>>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(true);
  const [darkMode, setDarkMode] = useState(() => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true);
  const [modal, setModal] = useState<Modal>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const value: AppContextValue = {
    authenticated,
    login: () => setAuthenticated(true),
    logout: () => setAuthenticated(false),
    darkMode,
    setDarkMode,
    modal,
    setModal,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
