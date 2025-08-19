import { AppLayout } from "@/layout/AppLayout.tsx";
import { DashboardPage } from "@/pages/DashboardPage.tsx";
import { LearningKitsPage } from "@/pages/learning-unit/LearningKitsPage.tsx";
import { LoginPage } from "@/pages/auth/LoginPage.tsx";
import { Route, Routes } from "react-router";
import { LoginVerifyPage } from "@/pages/auth/LoginVerifyPage.tsx";
import { RedirectIfAuthed, RequireAuth } from "./auth-guards.tsx";
import { LearningUnitTrainingPage } from "@/pages/learning-unit/training/LearningUnitTrainingPage.tsx";
import { LearningUnitPage } from "@/pages/learning-unit/LearningUnitPage.tsx";

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
          <Route path="learning-kits" element={<LearningKitsPage />} />
			<Route path="learning-unit" element={<LearningUnitPage />} />
			<Route path="learning-unit/training" element={<LearningUnitTrainingPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
}
