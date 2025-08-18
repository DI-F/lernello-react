// frontend/src/components/learning-unit/LearningUnitTrainingContainer.tsx
import { useState, useMemo } from 'react';
import { BlockItem } from '@/components/learning-unit/blocks/BlockItem';
import { BlockOverviewItem } from '@/components/learning-unit/blocks/BlockOverviewItem';
import type { RoleType } from '@/lib/schemas/response/UserInfo';
import type { BlockProgressRes } from '@/lib/schemas/response/progress/BlockProgressResSchema';
import Select from "@/components/ui/select.tsx";
import type { LearningUnitRes } from "@/lib/schemas/response/LearningUnitRes.ts";
import type { BlockRes } from "@/lib/schemas/response/BlockRes.ts";

// Mock dependencies for demonstration
const useTranslation = () => {
	const t = (key: string) => key.split('.').pop() || '';
	const locale = 'en'; // Mock current locale
	return { t, locale };
};

export const hardcodedLearningUnit: LearningUnitRes = {
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

const useLearningUnitProgress = () => ({
	getBlockProgress: (blockId: string): BlockProgressRes | undefined => {
		console.log('Mock getBlockProgress for', blockId);
		return undefined; // Mock implementation
	}
});

interface LearningUnitTrainingContainerProps {
	role: RoleType;
	learningUnit: LearningUnitRes;
}

export function LearningUnitTrainingContainer({ role, learningUnit }: LearningUnitTrainingContainerProps) {
	const { t, locale } = useTranslation();
	const { blocks } = learningUnit;
	const { getBlockProgress } = useLearningUnitProgress();

	const localeToLanguageMap: Record<string, string> = {
		en: 'ENGLISH',
		de: 'GERMAN',
		fr: 'FRENCH',
		it: 'ITALIAN',
	};

	const [selectedLanguage, setSelectedLanguage] = useState<string>(localeToLanguageMap[locale] ?? 'ENGLISH');

	const languageOptions = useMemo(() => [
		{ value: 'ENGLISH', label: t('common.english') },
		{ value: 'GERMAN', label: t('common.german') },
		{ value: 'FRENCH', label: t('common.french') },
		{ value: 'ITALIAN', label: t('common.italian') }
	], [t]);

	const scrollToBlock = (blockId: string) => {
		const element = document.getElementById(`block-${blockId}`);
		element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	};

	const handleSelect = (value: string) => {
		setSelectedLanguage(value);
	};

	return (
		<div className="grid h-full grid-cols-1 md:grid-cols-[1fr_25%]">
			<div className="space-y-4 overflow-y-auto border-r-0 md:border-r md:pr-4">
				<div className="w-full md:max-w-[180px]">
					<Select
						options={languageOptions}
						selected={selectedLanguage}
						onSelect={handleSelect}
					/>
				</div>
				{blocks.length === 0 ? (
					<p>{t('learningUnit.noBlocks')}</p>
				) : (
					<div className="space-y-4">
						{blocks.map((block: BlockRes) => (
							<div key={block.uuid} id={`block-${block.uuid}`} className="block-wrapper">
								<BlockItem block={block} role={role} language={selectedLanguage} />
							</div>
						))}
					</div>
				)}
			</div>
			{blocks.length > 0 && (
				<aside className="hidden md:block sticky top-4 h-fit self-start">
					<div className="space-y-2 overflow-y-auto pl-4">
						{blocks.map((block: BlockRes) => (
							<BlockOverviewItem
								key={block.uuid}
								block={block}
								role={role}
								language={selectedLanguage}
								progress={getBlockProgress(block.uuid)}
								scrollToBlock={() => scrollToBlock(block.uuid)}
							/>
						))}
					</div>
				</aside>
			)}
		</div>
	);
}