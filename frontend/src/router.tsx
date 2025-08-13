import { Route, Routes } from "react-router";
import { DashboardPage } from "@/pages/DashboardPage.tsx";
import { LearningUnitPage } from "@/pages/learning-unit/LearningUnitPage.tsx";
import { AppLayout } from "@/layout/AppLayout.tsx";
import { LoginPage } from "@/pages/login/LoginPage.tsx";
import { RequireAuth } from "@/guards.tsx";
import { LoginVerifyPage } from "@/pages/login/LoginVerifyPage.tsx";

export function AppRouter() {
  return (
    <Routes>
      {/* Public: Login */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login/verify" element={<LoginVerifyPage />} />

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
    </Routes>
  );
}
