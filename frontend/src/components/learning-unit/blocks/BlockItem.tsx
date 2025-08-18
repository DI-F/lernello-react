import { useState, useEffect } from 'react';
import type { BlockRes } from '@/lib/schemas/response/BlockRes';
import { BlockIconHeader } from './BlockIconHeader';
import { ConfirmDialog } from "@/components/ui/dialogs/ConfirmDialog.tsx";
import { Loader2, X } from 'lucide-react';
import { TheoryBlockComponent } from './BlockTheoryItem';
import { QuestionBlockComponent } from './BlockQuestionItem';
import { MultipleChoiceBlockComponent } from './BlockMultipleChoiceItem';
import clsx from 'clsx';

// Placeholder for block action state and i18n
const useBlockStore = () => ({
	isBlockSaving: false, // Mock value
	queueBlockAction: (action: any) => console.log('Action queued:', action)
});
const useTranslation = () => ({
	t: (key: string) => key.split('.').pop()?.replace('_', ' ') || '' // Simple mock translation
});

// Assuming these constants are defined in your BlockRes schema file
const THEORY_BLOCK_TYPE = 'THEORY';
const QUESTION_BLOCK_TYPE = 'QUESTION';
const MULTIPLE_CHOICE_BLOCK_TYPE = 'MULTIPLE_CHOICE';

interface BlockItemProps {
	block: BlockRes;
	role: string;
	language: string;
}

const blockComponents = {
	[THEORY_BLOCK_TYPE]: TheoryBlockComponent,
	[QUESTION_BLOCK_TYPE]: QuestionBlockComponent,
	[MULTIPLE_CHOICE_BLOCK_TYPE]: MultipleChoiceBlockComponent
};

export function BlockItem({ block, role, language }: BlockItemProps) {
	const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
	const [isGenerationLoading, setIsGenerationLoading] = useState(false);
	const [isApplyActionLoading, setIsApplyActionLoading] = useState(false);

	const { isBlockSaving, queueBlockAction } = useBlockStore();
	const { t } = useTranslation();

	useEffect(() => {
		if (isGenerationLoading) {
			setIsApplyActionLoading(true);
		} else if (!isBlockSaving) {
			setIsApplyActionLoading(false);
		}
	}, [isGenerationLoading, isBlockSaving]);

	const removeBlock = () => {
		queueBlockAction({
			type: 'REMOVE_BLOCK',
			blockId: block.uuid
		});
		setIsConfirmDialogOpen(false);
	};

	const BlockComponent = blockComponents[block.type as keyof typeof blockComponents];

	return (
		<>
			<div
				className={clsx('relative', {
					'opacity-50 pointer-events-none': isApplyActionLoading
				})}
			>
				{isApplyActionLoading && (
					<div className="text-surface-400 absolute inset-0 z-10 flex items-center justify-center gap-2 text-sm">
						<Loader2 className="h-40 w-40 animate-spin" />
					</div>
				)}
				<div className="card group relative space-y-5 border border-surface-200 bg-surface-100 p-4 shadow transition-all duration-200 hover:shadow-lg dark:border-surface-800 dark:bg-surface-900">
					<BlockIconHeader
						block={block}
						role={role}
						language={language}
						onGenerationLoadingChange={setIsGenerationLoading}
					/>

					{BlockComponent && <BlockComponent block={block} role={role} language={language} />}

					{role === 'INSTRUCTOR' && (
						<button
							type="button"
							className="btn preset-filled-error-500 absolute -right-2 -top-2 size-8 rounded-full p-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
							onClick={() => setIsConfirmDialogOpen(true)}
						>
							<X className="h-4 w-4" />
						</button>
					)}
				</div>
			</div>

			<ConfirmDialog
				isOpen={isConfirmDialogOpen}
				title={t('blocks.delete_title')}
				message={t('blocks.delete_message')}
				confirmText={t('common.delete')}
				cancelText={t('common.cancel')}
				danger={true}
				onConfirm={removeBlock}
				onCancel={() => setIsConfirmDialogOpen(false)}
			/>
		</>
	);
}