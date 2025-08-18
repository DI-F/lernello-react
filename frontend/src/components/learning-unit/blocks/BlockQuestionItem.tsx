// frontend/src/components/learning-unit/blocks/BlockQuestionItem.tsx
import { useState, useEffect, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { Check, RotateCcw, X, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { BlockRes } from '@/lib/schemas/response/BlockRes';
import type { RoleType } from '@/lib/schemas/response/UserInfo';
import type { CheckQuestionAnswer } from '@/lib/schemas/request/progress/CheckQuestionAnswerSchema';
import type { QuestionBlockProgressRes } from '@/lib/schemas/response/progress/BlockProgressResSchema';

// Mock dependencies for demonstration purposes
const useTranslation = () => ({ t: (key: string) => key.split('.').pop()?.replace(/_/g, ' ') || '' });
const useToaster = () => ({ create: (toast: any) => console.warn(`Toast: [${toast.type}] ${toast.description}`) });
const useLearningUnitProgress = () => ({
	getBlockProgress: (blockId: string): QuestionBlockProgressRes | undefined => {
		console.log('Mock getBlockProgress for', blockId);
		return undefined; // Mock implementation
	},
	updateBlockProgress: (blockId: string, progress: any) => {
		console.log('Mock updateBlockProgress for', blockId, progress);
	}
});
const api = (fetch: any) => ({
	req: (endpoint: any, payload: any) => ({
		parse: () => {
			console.log('API call:', endpoint.name, payload);
			if (payload.answer.toLowerCase().includes('correct')) {
				return Promise.resolve({ isCorrect: true });
			}
			return Promise.resolve({ isCorrect: false });
		}
	})
});
const checkQuestionAnswer = { name: 'checkQuestionAnswer' };

const INSTRUCTOR_ROLE = 'INSTRUCTOR';
const TRAINEE_ROLE = 'TRAINEE';
type QuestionBlock = Extract<BlockRes, { type: 'QUESTION' }>;

interface BlockQuestionItemProps {
	block: QuestionBlock;
	role: RoleType;
	language: string;
}

export function QuestionBlockComponent({ block, role, language }: BlockQuestionItemProps) {
	const { t } = useTranslation();
	const toaster = useToaster();
	const { getBlockProgress, updateBlockProgress } = useLearningUnitProgress();
	const progress = getBlockProgress(block.uuid);

	const { currentQuestion, currentExpectedAnswer, blockId } = useMemo(() => {
		const translation = block.translatedContents?.find((c) => c.language === language);
		return {
			currentQuestion: translation?.question ?? block.question,
			currentExpectedAnswer: translation?.expectedAnswer ?? block.expectedAnswer,
			blockId: translation?.id ?? block.uuid
		};
	}, [block, language]);

	// State for Instructor view
	const [instructorQuestion, setInstructorQuestion] = useState(currentQuestion);
	const [instructorExpectedAnswer, setInstructorExpectedAnswer] = useState(currentExpectedAnswer);
	const [debouncedQuestion] = useDebounce(instructorQuestion, 500);
	const [debouncedExpectedAnswer] = useDebounce(instructorExpectedAnswer, 500);

	// State for Trainee view
	const [traineeAnswer, setTraineeAnswer] = useState('');
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

	useEffect(() => {
		if (role === TRAINEE_ROLE && progress) {
			const lastAnswer = progress.lastAnswer ?? '';
			setTraineeAnswer(lastAnswer);
			if (lastAnswer.trim() !== '') {
				setIsSubmitted(true);
				setIsCorrect(progress.isCorrect ?? null);
			} else {
				setIsSubmitted(false);
				setIsCorrect(null);
			}
		}
	}, [progress, role]);

	useEffect(() => {
		// Here you would queue the update action for the block content
		// This effect runs when the debounced values change
		console.log('Debounced update:', {
			question: debouncedQuestion,
			expectedAnswer: debouncedExpectedAnswer
		});
	}, [debouncedQuestion, debouncedExpectedAnswer, block.uuid]);

	const checkAnswerMutation = useMutation({
		mutationFn: (payload: CheckQuestionAnswer) => api(fetch).req(checkQuestionAnswer, payload).parse(),
		onSuccess: (data) => {
			setIsCorrect(data.isCorrect);
			setIsSubmitted(true);
			updateBlockProgress(block.uuid, {
				...progress,
				lastAnswer: traineeAnswer,
				isCorrect: data.isCorrect
			});
		},
		onError: (error) => {
			console.error('Error checking question answer:', error);
			toaster.create({ description: t('error.description'), type: 'error' });
			setIsSubmitted(true); // Mark as submitted even on error to show feedback
			setIsCorrect(null); // Indicate feedback is unavailable
		}
	});

	const handleSubmit = () => {
		if (traineeAnswer.trim() !== '') {
			checkAnswerMutation.mutate({ blockId, answer: traineeAnswer });
		}
	};

	const handleReset = () => {
		setTraineeAnswer('');
		setIsSubmitted(false);
		setIsCorrect(null);
		updateBlockProgress(block.uuid, {
			...progress,
			lastAnswer: '',
			isCorrect: null
		});
	};

	if (role !== INSTRUCTOR_ROLE) {
		// Trainee View
		return (
			<div className="space-y-4">
				<div className="flex items-start justify-between gap-4">
					<div className="flex items-center gap-2">
						<h3 className="text-lg font-semibold">{currentQuestion}</h3>
						{isSubmitted && (
							<Button variant="outline" size="icon" title={t('common.reset')} onClick={handleReset}>
								<RotateCcw size={16} />
							</Button>
						)}
					</div>
					{!isSubmitted && (
						<Button
							onClick={handleSubmit}
							disabled={traineeAnswer.trim() === '' || checkAnswerMutation.isPending}
							className="whitespace-nowrap"
						>
							{checkAnswerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{checkAnswerMutation.isPending ? t('common.submitting') : t('common.submit')}
						</Button>
					)}
				</div>

				<div className="flex-grow">
					<label htmlFor={`student-answer-${blockId}`} className="mb-1 block text-sm font-medium">
						{t('block.yourAnswer')}
					</label>
					<Input
						id={`student-answer-${blockId}`}
						type="text"
						placeholder={t('block.typeYourAnswer')}
						value={traineeAnswer}
						onChange={(e) => setTraineeAnswer(e.target.value)}
						disabled={isSubmitted || checkAnswerMutation.isPending}
					/>
				</div>

				{isSubmitted && (
					<div
						className={cn(
							'rounded-lg border p-3',
							isCorrect === true && 'border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300',
							isCorrect === false && 'border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300',
							isCorrect === null && 'border-border bg-muted text-muted-foreground'
						)}
					>
						{isCorrect === true && (
							<div className="flex items-center font-medium">
								<Check className="mr-2 h-5 w-5" />
								{t('block.correctAnswer')}
							</div>
						)}
						{isCorrect === false && (
							<>
								<div className="flex items-center font-medium">
									<X className="mr-2 h-5 w-5" />
									{t('block.incorrectAnswer')}
								</div>
								{currentExpectedAnswer.trim() !== '' && (
									<p className="mt-1 text-sm">
										{t('block.expectedAnswerWas')}: <code className="font-mono">{currentExpectedAnswer}</code>
									</p>
								)}
							</>
						)}
						{isCorrect === null && (
							<div className="flex items-center font-medium">{t('block.feedbackUnavailable')}</div>
						)}
					</div>
				)}
			</div>
		);
	}

	// Instructor View
	return (
		<Tabs defaultValue="edit" className="w-full">
			<TabsList>
				<TabsTrigger value="edit">{t('common.edit')}</TabsTrigger>
				<TabsTrigger value="preview" disabled>
					{t('common.preview')}
				</TabsTrigger>
			</TabsList>
			<TabsContent value="edit" className="space-y-4 pt-4">
				<Input
					type="text"
					placeholder={t('block.typeTheQuestion')}
					value={instructorQuestion}
					onChange={(e) => setInstructorQuestion(e.target.value)}
				/>
				<Input
					type="text"
					placeholder={t('common.block.answer')}
					value={instructorExpectedAnswer}
					onChange={(e) => setInstructorExpectedAnswer(e.target.value)}
				/>
			</TabsContent>
		</Tabs>
	);
}