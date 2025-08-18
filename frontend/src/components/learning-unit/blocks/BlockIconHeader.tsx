import { useState, useEffect, useMemo, useCallback } from 'react';
import type { BlockRes } from '@/lib/schemas/response/BlockRes';
import { BlockIcon } from './BlockIcon';
import { BlockAiGenerationButton } from './BlockAiGenerationButton';
import { Input } from '@/components/ui/input';

// Mock dependencies
const INSTRUCTOR_ROLE = 'INSTRUCTOR';
const useTranslation = () => ({ t: (key: string) => key.split('.').pop() || '' });
const useToaster = () => ({
	create: (toast: { description: string; type: string }) =>
		console.warn(`Toast: [${toast.type}] ${toast.description}`)
});
const useBlockActionQueue = () => ({
	queueBlockAction: (action: any) => console.log('Queueing block action:', action)
});
const ActionType = { UPDATE_BLOCK_NAME: 'UPDATE_BLOCK_NAME' };

interface BlockIconHeaderProps {
	block: BlockRes;
	role: string;
	language: string;
	onGenerationLoadingChange: (isLoading: boolean) => void;
}

export function BlockIconHeader({ block, role, language, onGenerationLoadingChange }: BlockIconHeaderProps) {
	const { t } = useTranslation();
	const toaster = useToaster();
	const { queueBlockAction } = useBlockActionQueue();

	const initialName = useMemo(() => {
		return block?.translatedContents?.find((c) => c.language === language)?.name ?? block.name;
	}, [block, language]);

	const [name, setName] = useState(initialName);

	useEffect(() => {
		setName(initialName);
	}, [initialName]);

	const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setName(event.target.value);
	};

	const handleBlur = () => {
		// The debounced function will handle the final update
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			event.currentTarget.blur();
		} else if (event.key === 'Escape') {
			setName(initialName);
			event.currentTarget.blur();
		}
	};

	return (
		<div className="flex w-full items-center justify-between">
			<div className="flex items-center gap-2">
				<BlockIcon iconType={block.type} />
				<div className="flex items-baseline gap-2 text-nowrap">
					{role === INSTRUCTOR_ROLE ? (
						<Input
							className="-m-1 h-auto w-[150px] p-1 font-medium"
							type="text"
							placeholder={t('block.name')}
							value={name}
							onChange={handleNameChange}
							onBlur={handleBlur}
							onKeyDown={handleKeyDown}
						/>
					) : (
						<h3 className="font-medium">{name}</h3>
					)}
				</div>
			</div>

			{role === INSTRUCTOR_ROLE && (
				<div className="ml-auto">
					<BlockAiGenerationButton block={block} onGenerationLoadingChange={onGenerationLoadingChange} />
				</div>
			)}
		</div>
	);
}