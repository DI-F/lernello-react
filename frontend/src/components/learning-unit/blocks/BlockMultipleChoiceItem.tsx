// frontend/src/components/learning-unit/blocks/BlockMultipleChoiceItem.tsx
import { useState, useEffect, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { Plus, Check, X, Trash, RotateCcw, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { BlockRes } from '@/lib/schemas/response/BlockRes';
import type { RoleType } from '@/lib/schemas/response/UserInfo';
import type { CheckMultipleChoiceAnswer } from '@/lib/schemas/request/progress/CheckMultipleChoiceAnswerSchema';
import type { MultipleChoiceBlockProgressRes } from '@/lib/schemas/response/progress/BlockProgressResSchema';

// Mock dependencies for demonstration
const useTranslation = () => ({ t: (key: string) => key.split('.').pop()?.replace(/_/g, ' ') || '' });
const useToaster = () => ({ create: (toast: any) => console.warn(`Toast: [${toast.type}] ${toast.description}`) });
const useLearningUnitProgress = () => ({
	getBlockProgress: (blockId: string): MultipleChoiceBlockProgressRes | undefined => {
		console.log('Mock getBlockProgress for', blockId);
		return undefined;
	},
	updateBlockProgress: (blockId: string, progress: any) => {
		console.log('Mock updateBlockProgress for', blockId, progress);
	}
});
const api = (fetch: any) => ({
	req: (endpoint: any, payload: any) => ({
		parse: () => {
			console.log('API call:', endpoint.name, payload);
			// Mock logic: correct if 'correct' is in any answer
			const isCorrect = payload.answers.some((a: string) => a.toLowerCase().includes('correct'));
			return Promise.resolve({ isCorrect });
		}
	})
});
const checkMultipleChoiceAnswer = { name: 'checkMultipleChoiceAnswer' };

const INSTRUCTOR_ROLE = 'INSTRUCTOR';
const TRAINEE_ROLE = 'TRAINEE';
type MultipleChoiceBlock = Extract<BlockRes, { type: 'MULTIPLE_CHOICE' }>;
type Answer = { value: string; isCorrect: boolean };

interface BlockMultipleChoiceItemProps {
	block: MultipleChoiceBlock;
	role: RoleType;
	language: string;
}

export function MultipleChoiceBlockComponent({ block, role, language }: BlockMultipleChoiceItemProps) {
	const { t } = useTranslation();
	const toaster = useToaster();
	const { getBlockProgress, updateBlockProgress } = useLearningUnitProgress();
	const progress = getBlockProgress(block.uuid);

	const { initialQuestion, initialAnswers, blockId } = useMemo(() => {
		const translation = block.translatedContents?.find((c) => c.language === language);
		const possibleAnswers = translation?.possibleAnswers ?? block.possibleAnswers;
		const correctAnswers = translation?.correctAnswers ?? block.correctAnswers;
		const answers: Answer[] = possibleAnswers.map((answer) => ({
			value: answer,
			isCorrect: correctAnswers.includes(answer)
		}));
		return {
			initialQuestion: translation?.question ?? block.question,
			initialAnswers: answers,
			blockId: translation?.id ?? block.uuid
		};
	}, [block, language]);

	// Instructor State
	const [question, setQuestion] = useState(initialQuestion);
	const [answers, setAnswers] = useState<Answer[]>(initialAnswers);
	const [debouncedQuestion] = useDebounce(question, 500);
	const [debouncedAnswers] = useDebounce(answers, 500);

	// Trainee State
	const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [submissionCorrect, setSubmissionCorrect] = useState<boolean | null>(null);

	useEffect(() => {
		if (role === TRAINEE_ROLE && progress?.lastAnswers) {
			const initialSelected = initialAnswers
				.map((answer, index) => (progress.lastAnswers?.includes(answer.value) ? index : -1))
				.filter((index) => index !== -1);
			setSelectedAnswers(initialSelected);

			if (progress.lastAnswers.length > 0) {
				setIsSubmitted(true);
				setSubmissionCorrect(progress.isCorrect ?? null);
			}
		}
	}, [progress, role, initialAnswers]);

	useEffect(() => {
		// Debounced update logic for instructor changes
		console.log('Debounced update:', {
			question: debouncedQuestion,
			answers: debouncedAnswers
		});
	}, [debouncedQuestion, debouncedAnswers, block.uuid]);

	const checkAnswerMutation = useMutation({
		mutationFn: (payload: CheckMultipleChoiceAnswer) =>
			api(fetch).req(checkMultipleChoiceAnswer, payload).parse(),
		onSuccess: (data) => {
			setSubmissionCorrect(data.isCorrect);
			setIsSubmitted(true);
			updateBlockProgress(block.uuid, {
				...progress,
				lastAnswers: selectedAnswers.map((index) => answers[index].value),
				isCorrect: data.isCorrect
			});
		},
		onError: (error) => {
			console.error('Error checking answer:', error);
			toaster.create({ description: t('error.description'), type: 'error' });
			setIsSubmitted(true);
			setSubmissionCorrect(null);
		}
	});

	// --- Instructor Functions ---
	const addAnswerField = () => setAnswers([...answers, { value: '', isCorrect: false }]);
	const removeAnswer = (index: number) => {
		if (answers.length > 1) {
			setAnswers(answers.filter((_, i) => i !== index));
		}
	};
	const updateAnswerValue = (index: number, value: string) => {
		const newAnswers = [...answers];
		newAnswers[index].value = value;
		setAnswers(newAnswers);
	};
	const toggleCorrect = (index: number) => {
		const newAnswers = [...answers];
		newAnswers[index].isCorrect = !newAnswers[index].isCorrect;
		setAnswers(newAnswers);
	};

	// --- Trainee Functions ---
	const toggleSelectedAnswer = (index: number) => {
		if (isSubmitted || checkAnswerMutation.isPending) return;
		setSelectedAnswers((prev) =>
			prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
		);
	};
	const handleSubmit = () => {
		if (selectedAnswers.length > 0) {
			const answersToSubmit = selectedAnswers.map((index) => answers[index].value);
			checkAnswerMutation.mutate({ blockId, answers: answersToSubmit });
		}
	};
	const handleReset = () => {
		setSelectedAnswers([]);
		setIsSubmitted(false);
		setSubmissionCorrect(null);
		updateBlockProgress(block.uuid, { ...progress, lastAnswers: [], isCorrect: null });
	};

	if (role !== INSTRUCTOR_ROLE) {
		// Trainee View
		return (
			<div className="space-y-4">
				<div className="flex items-start justify-between gap-4">
					<div className="flex items-center gap-2">
						<h3 className="text-lg font-semibold">{initialQuestion}</h3>
						{isSubmitted && (
							<Button variant="outline" size="icon" title={t('common.reset')} onClick={handleReset}>
								<RotateCcw className="h-4 w-4" />
							</Button>
						)}
					</div>
					{!isSubmitted && (
						<Button
							onClick={handleSubmit}
							disabled={selectedAnswers.length === 0 || checkAnswerMutation.isPending}
						>
							{checkAnswerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{checkAnswerMutation.isPending ? t('common.submitting') : t('common.submit')}
						</Button>
					)}
				</div>
				<div className="space-y-2">
					{initialAnswers.map((answer, idx) => {
						const isSelected = selectedAnswers.includes(idx);
						const buttonClass = isSubmitted
							? answer.isCorrect
								? 'border-green-500 bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-200'
								: isSelected
									? 'border-red-500 bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-200'
									: 'border-input'
							: isSelected
								? 'border-primary bg-primary/10'
								: 'border-input hover:bg-muted/50';
						return (
							<Button
								key={idx}
								variant="outline"
								className={cn('w-full justify-start h-auto py-3 whitespace-normal', buttonClass)}
								onClick={() => toggleSelectedAnswer(idx)}
								disabled={isSubmitted || checkAnswerMutation.isPending}
							>
								{isSubmitted && (
									<div className="mr-2">
										{answer.isCorrect ? <Check className="h-5 w-5 text-green-600" /> : <X className="h-5 w-5 text-red-600" />}
									</div>
								)}
								{answer.value}
							</Button>
						);
					})}
				</div>
			</div>
		);
	}

	// Instructor View
	return (
		<Tabs defaultValue="edit" className="w-full">
			<TabsList className="w-full justify-start rounded-b-none">
				<TabsTrigger value="edit">{t('common.edit')}</TabsTrigger>
				<TabsTrigger value="preview" disabled>
					{t('common.preview')}
				</TabsTrigger>
			</TabsList>
			<TabsContent value="edit" className="rounded-b-md border border-t-0 p-4">
				<div className="flex items-center justify-between pb-4">
					<h3 className="text-lg font-semibold">{t('common.block.question')}</h3>
					<Button variant="outline" size="icon" onClick={addAnswerField} title={t('add_answer')}>
						<Plus className="h-4 w-4" />
					</Button>
				</div>
				<Input
					placeholder={t('common.block.question')}
					value={question}
					onChange={(e) => setQuestion(e.target.value)}
					className="mb-4"
				/>
				<div className="space-y-2">
					{answers.map((answer, idx) => (
						<div key={idx} className="flex items-center gap-2">
							<Switch
								checked={answer.isCorrect}
								onCheckedChange={() => toggleCorrect(idx)}
								aria-label={`Mark answer ${idx + 1} as correct`}
							/>
							<Input
								placeholder={`${t('common.block.answer')} ${idx + 1}`}
								value={answer.value}
								onChange={(e) => updateAnswerValue(idx, e.target.value)}
								className="flex-grow"
							/>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => removeAnswer(idx)}
								disabled={answers.length <= 1}
								aria-label={`Remove answer ${idx + 1}`}
							>
								<Trash className="h-4 w-4 text-destructive" />
							</Button>
						</div>
					))}
				</div>
			</TabsContent>
		</Tabs>
	);
}