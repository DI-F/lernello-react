import { Route, Routes } from "react-router";
import { DashboardPage } from "@/pages/DashboardPage.tsx";
import { LearningUnitPage } from "@/pages/learning-unit/LearningUnitPage.tsx";
import { AppLayout } from "@/layout/AppLayout.tsx";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="learning-unit" element={<LearningUnitPage />} />
      </Route>
    </Routes>
  );
}
