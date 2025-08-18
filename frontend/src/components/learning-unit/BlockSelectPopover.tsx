import { useMutation } from '@tanstack/react-query';
import { BookOpen, FileQuestion, ListChecks, PlusCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';

// Mock i18n hook
const useTranslation = () => ({
	t: (key: string) => key.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || ''
});

// Mock API client and block action queue
const apiClient = {
	// In a real app, this would make a network request
	// For now, we'll just return a new UUID.
	getBlockId: async (_payload: { learningUnitId: string }) => {
		return Promise.resolve({ blockId: uuidv4() });
	}
};

const useBlockActionQueue = () => ({
	queueBlockAction: (action: any) => {
		console.log('Queueing block action:', action);
		// This would dispatch the action to a state management store (Zustand, Redux, etc.)
	}
});

// Mock schema constants
const ActionType = { ADD_BLOCK: 'ADD_BLOCK' };
const BlockType = {
	THEORY: 'THEORY',
	MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
	QUESTION: 'QUESTION'
};

interface BlockSelectPopoverProps {
	index: number;
	learningUnitId: string;
}

export function BlockSelectPopover({ index, learningUnitId }: BlockSelectPopoverProps) {
	const [isOpen, setIsOpen] = useState(false);
	const { t } = useTranslation();
	const { queueBlockAction } = useBlockActionQueue();
	const insertIndex = index + 1;

	const addBlockMutation = useMutation({
		mutationFn: (blockData: any) => apiClient.getBlockId({ learningUnitId }).then(({ blockId }) => {
			const action = {
				type: ActionType.ADD_BLOCK,
				blockId,
				index: insertIndex,
				data: { ...blockData, learningUnitId, position: insertIndex }
			};
			queueBlockAction(action);
		}),
		onSuccess: () => {
			setIsOpen(false); // Close popover on success
		},
		onError: (error) => {
			console.error('Failed to add block:', error);
		}
	});

	const createBlockHandler = (blockType: string) => () => {
		let blockData;
		switch (blockType) {
			case BlockType.THEORY:
				blockData = { type: BlockType.THEORY, name: 'Theory', content: '' };
				break;
			case BlockType.MULTIPLE_CHOICE:
				blockData = { type: BlockType.MULTIPLE_CHOICE, name: 'Multiple Choice', question: 'Placeholder question?', possibleAnswers: ['A', 'B'], correctAnswers: ['A'] };
				break;
			case BlockType.QUESTION:
				blockData = { type: BlockType.QUESTION, name: 'Question', question: 'Placeholder question?', expectedAnswer: 'Placeholder answer' };
				break;
			default:
				return;
		}
		addBlockMutation.mutate(blockData);
	};

	return (
		<div className="flex items-center gap-2 p-2">
			<hr className="flex-grow border-t-2 border-dashed border-gray-400" />
			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<PopoverTrigger asChild>
					<Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600" aria-label="Add new block">
						<PlusCircle size={24} />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0">
					<div className="flex">
						<Button variant="ghost" className="justify-start rounded-none rounded-l-md" onClick={createBlockHandler(BlockType.THEORY)}>
							<BookOpen className="mr-2 h-4 w-4" />
							{t('block.theoryBlock')}
						</Button>
						<Button variant="ghost" className="justify-start rounded-none border-x" onClick={createBlockHandler(BlockType.MULTIPLE_CHOICE)}>
							<ListChecks className="mr-2 h-4 w-4" />
							{t('block.multipleChoiceQuiz')}
						</Button>
						<Button variant="ghost" className="justify-start rounded-none rounded-r-md" onClick={createBlockHandler(BlockType.QUESTION)}>
							<FileQuestion className="mr-2 h-4 w-4" />
							{t('block.questionBlock')}
						</Button>
					</div>
				</PopoverContent>
			</Popover>
			<hr className="flex-grow border-t-2 border-dashed border-gray-400" />
		</div>
	);
}