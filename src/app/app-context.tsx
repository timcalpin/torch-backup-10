import { createContext, useContext, useEffect, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { ApiError, UNAUTHORIZED_EVENT } from "../lib/api";
import { login as loginRequest, logout as logoutRequest, getMe, type AdminUser } from "../lib/auth";
import { clearTokens, getAccessToken } from "../lib/tokens";

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
  | "add-resource"
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
  contentVersion: number;
  bumpContentVersion: () => void;
  literatureVersion: number;
  bumpLiteratureVersion: () => void;
  resourcesVersion: number;
  bumpResourcesVersion: () => void;
  eventsVersion: number;
  bumpEventsVersion: () => void;
  treatmentPlansVersion: number;
  bumpTreatmentPlansVersion: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const storedAuth = readStoredAuth();
  // The JWT is the source of truth for "signed in"; the cached profile is only
  // there so a reload paints without waiting on /me/.
  const [authenticated, setAuthenticated] = useState(getAccessToken() !== null);
  const [user, setUser] = useState<AdminUser | null>(storedAuth?.user ?? null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true);
  const [modal, setModal] = useState<Modal>(null);
  const [usersVersion, setUsersVersion] = useState(0);
  const [groupsVersion, setGroupsVersion] = useState(0);
  const [counselorsVersion, setCounselorsVersion] = useState(0);
  const [contentVersion, setContentVersion] = useState(0);
  const [literatureVersion, setLiteratureVersion] = useState(0);
  const [resourcesVersion, setResourcesVersion] = useState(0);
  const [eventsVersion, setEventsVersion] = useState(0);
  const [treatmentPlansVersion, setTreatmentPlansVersion] = useState(0);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // A 401 that survived the automatic token refresh means the refresh token is
  // gone too (expired, blacklisted, or rotated away) — drop back to login.
  useEffect(() => {
    const handleUnauthorized = () => {
      clearTokens();
      writeStoredAuth(null);
      setAuthenticated(false);
      setUser(null);
    };
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  // On reload the stored token is still valid but the cached profile may be
  // stale — refresh it from /me/ once on mount.
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
      const { user: me } = await loginRequest(email, password);
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
    contentVersion,
    bumpContentVersion: () => setContentVersion((v) => v + 1),
    literatureVersion,
    bumpLiteratureVersion: () => setLiteratureVersion((v) => v + 1),
    resourcesVersion,
    bumpResourcesVersion: () => setResourcesVersion((v) => v + 1),
    eventsVersion,
    bumpEventsVersion: () => setEventsVersion((v) => v + 1),
    treatmentPlansVersion,
    bumpTreatmentPlansVersion: () => setTreatmentPlansVersion((v) => v + 1),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
