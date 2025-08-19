// frontend/src/pages/learning-unit/training/LearningUnitTrainingPage.tsx
import type { LearningUnitProgressRes } from "@/lib/schemas/response/progress/LearningUnitProgressResSchema.ts";
import {
  INSTRUCTOR_ROLE,
  TRAINEE_ROLE,
} from "@/lib/schemas/response/UserInfo.ts";
import {
  LearningUnitTrainingContainer,
  hardcodedLearningUnit,
} from "@/components/learning-unit/LearningUnitTrainingContainer.tsx";
import ToggleViewButton from "@/components/learning-unit/ToggleViewButton.tsx";

// Mock dependencies for demonstration
const useTranslation = () => ({
  t: (key: string, values?: { values: { [key: string]: string } }) =>
    `${key} ${values?.values.name || ""}`.trim(),
});
const useToaster = () => ({
  create: (toast: { description: string; type: string }) =>
    console.warn(`Toast: [${toast.type}] ${toast.description}`),
});
const useLearningUnitProgress = () => ({
  setProgress: (progress: LearningUnitProgressRes) =>
    console.log("Setting progress:", progress),
  clearProgress: () => console.log("Clearing progress"),
});

export function LearningUnitTrainingPage() {
  const role = TRAINEE_ROLE; // Role is always TRAINEE for this page

  // Mock data object to resolve the ReferenceError
  const data = {
    userInfo: {
      role: INSTRUCTOR_ROLE, // or TRAINEE_ROLE depending on the desired test case
    },
  };

  return (
    <>
      {data.userInfo?.role === INSTRUCTOR_ROLE && <ToggleViewButton />}
      <LearningUnitTrainingContainer
        role={role}
        learningUnit={hardcodedLearningUnit}
      />
    </>
  );
}
