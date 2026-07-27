import { createContext, useContext, useEffect, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { ApiError, UNAUTHORIZED_EVENT } from "../lib/api";
import { login as loginRequest, logout as logoutRequest, getMe, type AdminUser } from "../lib/auth";

const AUTH_STORAGE_KEY = "torch-admin-auth";

interface StoredAuth {
  user: AdminUser | null;
}

function readStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
}

function writeStoredAuth(auth: StoredAuth | null) {
  if (auth) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

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
  user: AdminUser | null;
  loginLoading: boolean;
  loginError: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  darkMode: boolean;
  setDarkMode: Dispatch<SetStateAction<boolean>>;
  modal: Modal;
  setModal: Dispatch<SetStateAction<Modal>>;
  usersVersion: number;
  bumpUsersVersion: () => void;
  groupsVersion: number;
  bumpGroupsVersion: () => void;
  counselorsVersion: number;
  bumpCounselorsVersion: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const storedAuth = readStoredAuth();
  const [authenticated, setAuthenticated] = useState(storedAuth !== null);
  const [user, setUser] = useState<AdminUser | null>(storedAuth?.user ?? null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true);
  const [modal, setModal] = useState<Modal>(null);
  const [usersVersion, setUsersVersion] = useState(0);
  const [groupsVersion, setGroupsVersion] = useState(0);
  const [counselorsVersion, setCounselorsVersion] = useState(0);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // The session lives in an httpOnly cookie we can't read, so a 401 from any
  // API call (session expired/revoked server-side) is the only reliable
  // signal that we should drop back to the login page.
  useEffect(() => {
    const handleUnauthorized = () => {
      writeStoredAuth(null);
      setAuthenticated(false);
      setUser(null);
    };
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  // On reload, the session cookie is still valid but this cached profile may
  // be stale (or missing, since the login response doesn't reliably include
  // one) — refresh it from /me/ once on mount.
  useEffect(() => {
    if (!authenticated) return;
    getMe()
      .then((me) => {
        setUser(me);
        writeStoredAuth({ user: me });
      })
      .catch(() => {});
  }, []);

  const login = async (email: string, password: string) => {
    setLoginLoading(true);
    setLoginError(null);
    try {
      await loginRequest(email, password);
      const me = await getMe();
      setUser(me);
      setAuthenticated(true);
      writeStoredAuth({ user: me });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Unable to reach the server. Please try again.";
      setLoginError(message);
      throw error;
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } finally {
      writeStoredAuth(null);
      setAuthenticated(false);
      setUser(null);
    }
  };

  const value: AppContextValue = {
    authenticated,
    user,
    loginLoading,
    loginError,
    login,
    logout,
    darkMode,
    setDarkMode,
    modal,
    setModal,
    usersVersion,
    bumpUsersVersion: () => setUsersVersion((v) => v + 1),
    groupsVersion,
    bumpGroupsVersion: () => setGroupsVersion((v) => v + 1),
    counselorsVersion,
    bumpCounselorsVersion: () => setCounselorsVersion((v) => v + 1),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
