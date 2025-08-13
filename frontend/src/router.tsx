import { Route, Routes } from "react-router";
import { DashboardPage } from "@/pages/DashboardPage.tsx";
import { LearningUnitPage } from "@/pages/learning-unit/LearningUnitPage.tsx";
import { AppLayout } from "@/layout/AppLayout.tsx";
import { LoginPage } from "@/pages/LoginPage.tsx";
import { RedirectIfAuthed, RequireAuth } from "@/guards.tsx";

export function AppRouter() {
  return (
    <Routes>
      {/* Public: Login */}
      <Route
        path="/login"
        element={
          <RedirectIfAuthed>
            <LoginPage />
          </RedirectIfAuthed>
        }
      />

      {/* Private: All authenticated routes */}
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="learning-unit" element={<LearningUnitPage />} />
      </Route>

      {/* Catch-all route for authenticated users */}
      <Route path="*" element={<DashboardPage />} />
    </Routes>
  );
}
