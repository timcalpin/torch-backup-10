import { createBrowserRouter, Navigate } from "react-router-dom";
import type { ComponentType, ReactNode } from "react";
import { useAppContext } from "./app-context";

export type AppPageKey =
  | "support-groups"
  | "users"
  | "counselors"
  | "testdata"
  | "intake-scripts"
  | "resources-real"
  | "resources-app"
  | "treatment-plans"
  | "aggregate-data"
  | "metric-detail"
  | "relapse-signals"
  | "insights"
  | "settings"
  | "privacy"
  | "profile"
  | "recovery"
  | "metrics-debug"
  | "metrics-debug-detail"
  | "payload-inspector"
  | "push-notifications"
  | "create-notification";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { authenticated } = useAppContext();
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function LoginRoute({ LoginPage }: { LoginPage: ComponentType }) {
  const { authenticated } = useAppContext();
  if (authenticated) {
    return <Navigate to="/support-groups" replace />;
  }
  return <LoginPage />;
}

function PageRoute({ pageKey, renderPage }: { pageKey: AppPageKey; renderPage: (pageKey: AppPageKey) => ReactNode }) {
  return <>{renderPage(pageKey)}</>;
}

interface RouterOptions {
  AdminLayout: ComponentType;
  LoginPage: ComponentType;
  renderPage: (pageKey: AppPageKey) => ReactNode;
}

export function createAppRouter({ AdminLayout, LoginPage, renderPage }: RouterOptions) {
  return createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="/support-groups" replace /> },
        { path: "support-groups", element: <PageRoute pageKey="support-groups" renderPage={renderPage} /> },
        { path: "users", element: <PageRoute pageKey="users" renderPage={renderPage} /> },
        { path: "counselors", element: <PageRoute pageKey="counselors" renderPage={renderPage} /> },
        { path: "test-data", element: <PageRoute pageKey="testdata" renderPage={renderPage} /> },
        { path: "testdata", element: <PageRoute pageKey="testdata" renderPage={renderPage} /> },
        { path: "intake-scripts", element: <PageRoute pageKey="intake-scripts" renderPage={renderPage} /> },
        { path: "treatment-plans", element: <PageRoute pageKey="treatment-plans" renderPage={renderPage} /> },
        { path: "treatment-plans/:userId", element: <PageRoute pageKey="treatment-plans" renderPage={renderPage} /> },
        { path: "goals", element: <PageRoute pageKey="goals" renderPage={renderPage} /> },
        { path: "goals/:userId", element: <PageRoute pageKey="goals" renderPage={renderPage} /> },
        { path: "resources/real-world", element: <PageRoute pageKey="resources-real" renderPage={renderPage} /> },
        { path: "resources/in-app", element: <PageRoute pageKey="resources-app" renderPage={renderPage} /> },
        { path: "aggregate-data", element: <PageRoute pageKey="aggregate-data" renderPage={renderPage} /> },
        { path: "aggregate-data/metric/:metric", element: <PageRoute pageKey="metric-detail" renderPage={renderPage} /> },
        { path: "relapse-signals", element: <PageRoute pageKey="relapse-signals" renderPage={renderPage} /> },
        { path: "insights", element: <PageRoute pageKey="insights" renderPage={renderPage} /> },
        { path: "settings", element: <PageRoute pageKey="settings" renderPage={renderPage} /> },
        { path: "push-notifications", element: <PageRoute pageKey="push-notifications" renderPage={renderPage} /> },
        { path: "push-notifications/create", element: <PageRoute pageKey="create-notification" renderPage={renderPage} /> },
        { path: "privacy", element: <PageRoute pageKey="privacy" renderPage={renderPage} /> },
        { path: "profile", element: <PageRoute pageKey="profile" renderPage={renderPage} /> },
        { path: "recovery/:userId", element: <PageRoute pageKey="recovery" renderPage={renderPage} /> },
        { path: "metrics-debug", element: <PageRoute pageKey="metrics-debug" renderPage={renderPage} /> },
        { path: "metrics-debug/:userId", element: <PageRoute pageKey="metrics-debug-detail" renderPage={renderPage} /> },
        {
          path: "metrics-debug/:userId/payload-inspector",
          element: <PageRoute pageKey="payload-inspector" renderPage={renderPage} />,
        }
      ],
    },
    {
      path: "/login",
      element: <LoginRoute LoginPage={LoginPage} />,
    },
  ]);
}
