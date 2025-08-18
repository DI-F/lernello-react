import { useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, SquareMinus, SquareCheckBig, SquareX, View } from 'lucide-react';


import { BlockIconHeader } from '@/components/learning-unit/blocks/BlockIconHeader'; // Assuming this component exists
import { cn } from '@/lib/utils';
import type { BlockRes } from "@/lib/schemas/response/BlockRes.ts";
import type { RoleType } from "@/lib/schemas/response/UserInfo.ts";
import type {
	BlockProgressRes,
	MultipleChoiceBlockProgressRes, QuestionBlockProgressRes, TheoryBlockProgressRes
} from "@/lib/schemas/response/progress/BlockProgressResSchema.ts";

const INSTRUCTOR_ROLE = 'INSTRUCTOR';
const TRAINEE_ROLE = 'TRAINEE';

interface BlockOverviewItemProps {
	block: BlockRes;
	role: RoleType;
	scrollToBlock?: () => void;
	progress?: BlockProgressRes;
	language: string;
}

const statusIconMap = {
	VIEWED: View,
	CORRECT: SquareCheckBig,
	FALSE: SquareX,
	ELSE: SquareMinus
};

export function BlockOverviewItem({
									  block,
									  role,
									  scrollToBlock,
									  progress,
									  language
								  }: BlockOverviewItemProps) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: block.uuid,
		disabled: role !== INSTRUCTOR_ROLE
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 10 : undefined
	};

	const { StatusIconComponent, statusColorClass } = useMemo(() => {
		if (role === TRAINEE_ROLE && progress) {
			if (progress.blockType === 'MULTIPLE_CHOICE') {
				const mcProgress = progress as MultipleChoiceBlockProgressRes;
				if (mcProgress.isCorrect) return { StatusIconComponent: statusIconMap.CORRECT, statusColorClass: 'bg-success text-success-foreground' };
				if (mcProgress.isCorrect === false) return { StatusIconComponent: statusIconMap.FALSE, statusColorClass: 'bg-destructive text-destructive-foreground' };
			} else if (progress.blockType === 'QUESTION') {
				const qProgress = progress as QuestionBlockProgressRes;
				if (qProgress.isCorrect) return { StatusIconComponent: statusIconMap.CORRECT, statusColorClass: 'bg-success text-success-foreground' };
				if (qProgress.isCorrect === false) return { StatusIconComponent: statusIconMap.FALSE, statusColorClass: 'bg-destructive text-destructive-foreground' };
			} else if (progress.blockType === 'THEORY') {
				const tProgress = progress as TheoryBlockProgressRes;
				if (tProgress.isViewed) return { StatusIconComponent: statusIconMap.VIEWED, statusColorClass: 'bg-success text-success-foreground' };
			}
		}
		return { StatusIconComponent: statusIconMap.ELSE, statusColorClass: 'bg-muted text-muted-foreground' };
	}, [progress, role]);

	const commonButtonClasses =
		'flex w-full cursor-pointer items-center gap-2 border p-2 text-left shadow-sm transition-all duration-200 rounded-md';
	const hoverClass = 'hover:bg-muted/80';

	return (
		<div ref={setNodeRef} style={style} {...attributes}>
			<button
				type="button"
				onClick={scrollToBlock}
				className={cn(
					'card bg-card border-border',
					commonButtonClasses,
					role === INSTRUCTOR_ROLE ? 'hover:bg-muted' : hoverClass
				)}
			>
				{role === INSTRUCTOR_ROLE && (
					<div {...listeners} aria-label={`drag-handle for ${block.name}`} className="cursor-grab touch-none">
						<GripVertical className="h-6 w-6 text-muted-foreground" />
					</div>
				)}
				<BlockIconHeader
					block={block}
					role={TRAINEE_ROLE} // Assuming role is always TRAINEE for the header content
					language={language}
					onGenerationLoadingChange={() => {}}
				/>
				{role === TRAINEE_ROLE && (
					<span className={cn('badge ml-auto', statusColorClass)}>
            <StatusIconComponent className="h-5 w-5" />
          </span>
				)}
			</button>
		</div>
	);
}