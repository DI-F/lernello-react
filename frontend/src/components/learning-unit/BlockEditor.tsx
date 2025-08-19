import type { LearningUnitRes } from "@/lib/schemas/response/LearningUnitRes.ts";
import { BlockItem } from "@/components/learning-unit/blocks/BlockItem.tsx";
import { BlockSelectPopover } from "@/components/learning-unit/BlockSelectPopover.tsx";

interface BlockEditorProps {
  learningUnit: LearningUnitRes;
  role: string;
  language: string;
}

export function BlockEditor({
  learningUnit,
  role,
  language,
}: BlockEditorProps) {
  return (
    <div className="border-r pr-4">
      <BlockSelectPopover index={-1} learningUnitId={learningUnit.uuid} />
      {learningUnit.blocks.map((block, index) => (
        <div key={block.uuid} id={`block-${block.uuid}`} className="space-y-2">
          <BlockItem block={block} role={role} language={language} />
          <BlockSelectPopover
            index={index}
            learningUnitId={learningUnit.uuid}
          />
        </div>
      ))}
    </div>
  );
}
