import { useState } from "react";
import type { LearningUnitRes } from "@/lib/schemas/response/LearningUnitRes.ts";
import LearningUnitToolbar from "@/components/learning-unit/LearningUnitToolbar.tsx";
import { Card } from "@/components/ui/card.tsx";
import { BlockEditor } from "@/components/learning-unit/BlockEditor.tsx";
import { BlockReorder } from "@/components/learning-unit/BlockReorder.tsx";
import type { BlockRes } from "@/lib/schemas/response/BlockRes.ts";

// Assuming INSTRUCTOR_ROLE is defined somewhere, e.g., in a constants file.
const INSTRUCTOR_ROLE = "INSTRUCTOR";

export function LearningUnitPage() {
  const [language, setLanguage] = useState('en');

  const handleLanguageSelect = (selectedLanguage: string) => {
    console.log('Selected language:', selectedLanguage);
    setLanguage(selectedLanguage);
    // Add your i18n change logic here
  };

  const handleSave = () => {
    console.log('Save triggered');
    // Add save logic here
  };

  const hardcodedLearningUnit: LearningUnitRes = {
    uuid: "123e4567-e89b-12d3-a456-42661417400",
    name: "Sample Learning Unit",
    position: 0,
    blocks: [
      {
        uuid: "block-1",
        name: "Theory Block",
        type: "THEORY",
        position: 0,
        content: "This is a theory block.",
        translatedContents: null
      },
      {
        uuid: "block-2",
        name: "Multiple Choice Block",
        type: "MULTIPLE_CHOICE",
        position: 1,
        question: "What is 2 + 2?",
        possibleAnswers: ["3", "4", "5"],
        correctAnswers: ["4"],
        translatedContents: null
      },
      {
        uuid: "block-3",
        name: "Question Block",
        type: "QUESTION",
        position: 2,
        question: "Explain the concept of type safety.",
        expectedAnswer: "Type safety ensures variables are only assigned values of the correct type.",
        translatedContents: null
      }
    ]
  };

  const [learningUnit, setLearningUnit] = useState<LearningUnitRes>(hardcodedLearningUnit);

  // Mock user role
  const userRole = INSTRUCTOR_ROLE;

  const setBlocks = (newBlocks: BlockRes[] | ((prevBlocks: BlockRes[]) => BlockRes[])) => {
    setLearningUnit(prev => ({
      ...prev,
      blocks: typeof newBlocks === 'function' ? newBlocks(prev.blocks) : newBlocks,
    }));
  };

  return (
      <>
        <LearningUnitToolbar
            onLanguageSelect={handleLanguageSelect}
            onSave={handleSave}
        />
        <Card className="w-full p-2">
          <div className="grid h-full grid-cols-[75%_25%]">
            <BlockEditor learningUnit={learningUnit} role={userRole} language={language} />
            {userRole === INSTRUCTOR_ROLE && (
                <div className="sticky top-1 h-fit self-start">
                  <BlockReorder
                      blocks={learningUnit.blocks}
                      setBlocks={setBlocks}
                      language={language}
                      role={userRole}
                  />
                </div>
            )}
          </div>
        </Card>
      </>
  );
}