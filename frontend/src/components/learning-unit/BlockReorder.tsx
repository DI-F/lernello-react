import { useState } from "react";
import type { BlockRes } from "@/lib/schemas/response/BlockRes.ts";
import { BlockOverviewItem } from "./blocks/BlockOverviewItem.tsx";
import { CheckCircle, Loader2 } from "lucide-react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

const INSTRUCTOR_ROLE = "INSTRUCTOR";

interface BlockReorderProps {
	blocks: BlockRes[];
	setBlocks: (blocks: BlockRes[]) => void;
	language: string;
	role: string;
}

export function BlockReorder({ blocks, setBlocks, language, role }: BlockReorderProps) {
	const [isSaving, setIsSaving] = useState(false);

	const scrollToBlock = (blockId: string) => {
		const element = document.getElementById(`block-${blockId}`);
		element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (over && active.id !== over.id) {
			const oldIndex = blocks.findIndex((b) => b.uuid === active.id);
			const newIndex = blocks.findIndex((b) => b.uuid === over.id);
			const reorderedBlocks = arrayMove(blocks, oldIndex, newIndex);
			setBlocks(reorderedBlocks);
			// Here you would typically trigger a save or queue an action
			// For example: queueBlockAction({ type: 'REORDER_BLOCK', blockId: active.id, newIndex });
			console.log(`Reordered block ${active.id} to index ${newIndex}`);
		}
	};

	return (
		<div className="mt-0 space-y-4 overflow-y-auto pl-4">
			<button
				type="button"
				className="btn flex w-full cursor-default items-center justify-center gap-2 border"
				disabled
			>
				{isSaving ? (
					<>
						<Loader2 className="h-5 w-5 animate-spin" />
						<span>Saving...</span>
					</>
				) : (
					<>
						<CheckCircle className="h-5 w-5 text-green-600" />
						<span>Saved</span>
					</>
				)}
			</button>

			{role === INSTRUCTOR_ROLE && (
				<DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
					<SortableContext items={blocks.map(b => b.uuid)} strategy={verticalListSortingStrategy}>
						<div className="space-y-2 rounded-lg border-transparent">
							{blocks.map((block) => (
								<BlockOverviewItem
									key={block.uuid}
									block={block}
									role={INSTRUCTOR_ROLE}
									language={language}
									scrollToBlock={() => scrollToBlock(block.uuid)}
								/>
							))}
						</div>
					</SortableContext>
				</DndContext>
			)}
		</div>
	);
}