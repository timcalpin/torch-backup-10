import { createAppRouter, type AppPageKey } from "./routes";
import { AppProvider } from "./app-context";
import { AppLayout } from "./layout/AppLayout";
import {
  SupportGroupsPage,
  RealWorldResourcesPage,
  UsersPage,
  CounselorsPage,
  TreatmentPlansPage,
  GoalsPage, // 1. Added Import
  ResourcesAppPage,
  IntakeScriptsPage,
  AggregateDataPage,
  InsightsPage,
  RelapseSignalsPage,
  SettingsPage,
  PlaceholderPage,
  ProfilePage,
  LoginPage,
  RecoveryPage,
} from "../pages";
import { RouterProvider } from "react-router-dom";



function renderPage(pageKey: AppPageKey) { 
  switch (pageKey) {
    case "support-groups":   return <SupportGroupsPage />;
    case "users":            return <UsersPage />;
    case "recovery":         return <RecoveryPage />;
    case "counselors":       return <CounselorsPage />;
    case "treatment-plans":  return <TreatmentPlansPage />;
    case "goals":            return <GoalsPage />; // 2. Added Render Case
    case "resources-app":    return <ResourcesAppPage />;
    case "intake-scripts":   return <IntakeScriptsPage />;
    case "aggregate-data":   return <AggregateDataPage />;
    case "insights":         return <InsightsPage />;
    case "resources-real":   return <RealWorldResourcesPage />;
    case "relapse-signals":  return <RelapseSignalsPage />;
    case "settings":         return <SettingsPage />;
    case "privacy":          return <PlaceholderPage title="Privacy & Compliance" subtitle="COMPLIANCE CENTER" />;
    case "profile":          return <ProfilePage />;
    default:                 return <SupportGroupsPage />;
  }
}

// Route structure is static — the router is built once, and reactive state
// (auth/theme/modal) flows through AppContext instead of triggering a rebuild.
const router = createAppRouter({
  AdminLayout: AppLayout,
  LoginPage,
  renderPage,
});

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}
