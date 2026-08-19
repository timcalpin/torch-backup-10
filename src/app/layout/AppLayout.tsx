import { Outlet, useLocation } from "react-router-dom";
import { useAppContext } from "@/app/app-context";
import { Sidebar } from "./Sidebar";
import { Toaster } from "@/app/components/ui/sonner";
import {
  CreateGroupModal,
  AddUserModal,
  AddCounselorModal,
  NewPlanModal,
  AddContentModal,
  AddResourceModal,
  ExportInsightsModal,
} from "@/components/modals";

export function AppLayout() {
  const { modal, setModal, darkMode } = useAppContext();
  const location = useLocation();
  const close = () => setModal(null);

  return (
    <div className="app-shell bg-[var(--app-bg)] w-full h-screen flex overflow-hidden transition-colors duration-200" style={{ fontFamily: "'Figtree', sans-serif" }} data-theme={darkMode ? "dark" : "light"}>
      <Sidebar pathname={location.pathname} lightMode={!darkMode} />
      <Outlet />
      <Toaster position="top-right" richColors />

      {modal === "create-group"    && <CreateGroupModal onClose={close} />}
      {modal === "add-user"        && <AddUserModal onClose={close} />}
      {modal === "add-counselor"   && <AddCounselorModal onClose={close} />}
      {modal === "new-plan"        && <NewPlanModal onClose={close} />}
      {modal === "add-content"     && <AddContentModal onClose={close} />}
      {modal === "add-resource"    && (
        <AddResourceModal
          open={modal === "add-resource"}
          onClose={close}
          onCreated={() => {}}
        />
      )}
      {modal === "export-insights" && <ExportInsightsModal onClose={close} />}
    </div>
  );
}
