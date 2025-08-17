import { AppLayout } from "@/layout/AppLayout.tsx";
import { DashboardPage } from "@/pages/DashboardPage.tsx";
import { LearningUnitPage } from "@/pages/learning-unit/LearningUnitPage.tsx";
import { LoginPage } from "@/pages/auth/LoginPage.tsx";
import { Route, Routes } from "react-router";
import { LoginVerifyPage } from "@/pages/auth/LoginVerifyPage.tsx";
import { RedirectIfAuthed, RequireAuth } from "./auth-guards.tsx";

export function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<RedirectIfAuthed />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify" element={<LoginVerifyPage />} />
      </Route>

      {/* Protected */}
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="learning-kits" element={<LearningUnitPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
}
