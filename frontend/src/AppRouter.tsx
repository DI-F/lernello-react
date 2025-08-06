import { Route, Routes } from "react-router";
import { DashboardPage } from "@/pages/DashboardPage.tsx";
import { LearningUnitPage } from "@/pages/learning-unit/LearningUnitPage.tsx";

export function AppRouter() {
  return (
    <Routes>
      <Route index element={<DashboardPage />} />
      <Route path="learning-unit" element={<LearningUnitPage />} />
    </Routes>
  );
}
