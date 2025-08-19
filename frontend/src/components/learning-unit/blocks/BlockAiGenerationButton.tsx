import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";

import type { BlockRes } from "@/lib/schemas/response/BlockRes";
import { Button } from "@/components/ui/button";
import type { GeneratedAIQuestionBlock } from "@/lib/schemas/request/block/GeneratedAIQuestionBlock.ts";
import type { GenerateAITheoryBlock } from "@/lib/schemas/request/block/GenerateAITheoryBlock.ts";
// import GenerateQuizModal from '@/components/dialogs/GenerateQuizModal'; // Assuming this exists
// import GenerateTheoryModal from '@/components/dialogs/GenerateTheoryModal'; // Assuming this exists

// import {
//   generateAITheoryBlock,
//   generatedAIMultipleChoiceBlock,
//   generatedAIQuestionBlock
// } from '@/lib/api/collections/aiBlock'; // Assuming these exist
// import { api } from '@/lib/api/apiClient'; // Assuming this exists

// Mock dependencies based on your other components
const useTranslation = () => ({
  t: (key: string) => key.split(".").pop() || "",
});
const useToaster = () => ({
  create: (toast: { description: string; type: string }) =>
    console.warn(`Toast: [${toast.type}] ${toast.description}`),
});
const useBlockActionQueue = () => ({
  queueBlockAction: (action: any) =>
    console.log("Queueing block action:", action),
});
const useBlockStore = () => ({
  blocks: [] as BlockRes[],
});

// Mock API functions for demonstration
const mockApiCall = (payload: any) => {
  console.log("API call with payload:", payload);
  return new Promise((resolve) =>
    setTimeout(() => resolve({ ...payload, generated: true }), 1000),
  );
};

// Mock Modal components for demonstration
const GenerateQuizModal = ({
  isOpen,
  onConfirm,
  onCancel,
  theoryBlocks,
}: any) =>
  isOpen ? (
    <div>
      <h2>Generate Quiz</h2>
      <button onClick={() => onConfirm(theoryBlocks[0]?.id)}>Confirm</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ) : null;

const GenerateTheoryModal = ({ isOpen, onConfirm, onCancel }: any) =>
  isOpen ? (
    <div>
      <h2>Generate Theory</h2>
      <button onClick={() => onConfirm("some topic", [])}>Confirm</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ) : null;

interface BlockAiGenerationButtonProps {
  block: BlockRes;
  onGenerationLoadingChange: (isLoading: boolean) => void;
}

export function BlockAiGenerationButton({
  block,
  onGenerationLoadingChange,
}: BlockAiGenerationButtonProps) {
  const { t } = useTranslation();
  const toaster = useToaster();
  const { queueBlockAction } = useBlockActionQueue();
  const { blocks } = useBlockStore(); // Assuming a store/context provides all blocks
  const [showCreationDialog, setShowCreationDialog] = useState(false);

  const theoryBlocks = blocks.filter((b) => b.type === "THEORY");

  const useGenericMutation = (
    mutationFn: (payload: any) => Promise<any>,
    actionType: string,
  ) => {
    return useMutation({
      mutationFn,
      onMutate: () => {
        toaster.create({
          description: t(`${actionType}.loading.description`),
          type: "loading",
        });
        onGenerationLoadingChange(true);
        setShowCreationDialog(false);
      },
      onSuccess: (data: any) => {
        queueBlockAction({
          type: "UPDATE_BLOCK",
          blockId: block.uuid,
          ...data,
        });
        toaster.create({
          description: t(`${actionType}.success.description`),
          type: "success",
        });
      },
      onError: () => {
        toaster.create({
          description: t(`${actionType}.error.description`),
          type: "error",
        });
      },
      onSettled: () => {
        onGenerationLoadingChange(false);
      },
    });
  };

  const generateMultipleChoiceMutation = useGenericMutation(
    (payload: GeneratedAIQuestionBlock) => mockApiCall(payload), // Replace with generatedAIMultipleChoiceBlock
    "multipleChoiceBlock",
  );

  const generateQuestionMutation = useGenericMutation(
    (payload: GeneratedAIQuestionBlock) => mockApiCall(payload), // Replace with generatedAIQuestionBlock
    "questionBlock",
  );

  const generateTheoryMutation = useGenericMutation(
    (payload: GenerateAITheoryBlock) => mockApiCall(payload), // Replace with generateAITheoryBlock
    "theoryBlock",
  );

  const renderModal = () => {
    switch (block.type) {
      case "MULTIPLE_CHOICE":
        return (
          <GenerateQuizModal
            isOpen={showCreationDialog}
            onConfirm={(selectedBlockId: string) => {
              generateMultipleChoiceMutation.mutate({
                blockId: block.uuid,
                theoryBlockId: selectedBlockId,
              });
            }}
            onCancel={() => setShowCreationDialog(false)}
            theoryBlocks={theoryBlocks.map((b) => ({
              id: b.uuid,
              title: b.name,
            }))}
          />
        );
      case "QUESTION":
        return (
          <GenerateQuizModal
            isOpen={showCreationDialog}
            onConfirm={(selectedBlockId: string) => {
              generateQuestionMutation.mutate({
                blockId: block.uuid,
                theoryBlockId: selectedBlockId,
              });
            }}
            onCancel={() => setShowCreationDialog(false)}
            theoryBlocks={theoryBlocks.map((b) => ({
              id: b.uuid,
              title: b.name,
            }))}
          />
        );
      case "THEORY":
        return (
          <GenerateTheoryModal
            isOpen={showCreationDialog}
            onConfirm={(topic: string, files: File[]) => {
              generateTheoryMutation.mutate({
                topic,
                files,
                blockId: block.uuid,
              });
            }}
            onCancel={() => setShowCreationDialog(false)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        title={t("block.generateAi.description")}
        onClick={(e) => {
          e.preventDefault();
          setShowCreationDialog(true);
        }}
      >
        {t("block.generateAi")}
        <Sparkles className="ml-2 h-4 w-4" />
      </Button>
      {renderModal()}
    </>
  );
}
