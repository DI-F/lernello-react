// frontend/src/components/learning-unit/blocks/BlockTheoryItem.tsx
import { useEffect, useRef, useState, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import type { BlockRes } from '@/lib/schemas/response/BlockRes';
import type { RoleType } from '@/lib/schemas/response/UserInfo';
import { TextEditor } from '@/components/markdown-editor/TextEditor';
// Mock dependencies
// import { api } from '@/lib/api/apiClient';
// import { markTheoryBlockViewed } from '@/lib/api/collections/progress';
// import { useLearningUnitProgress } from '@/hooks/useLearningUnitProgress';
// import { useToaster } from '@/hooks/useToaster';

const TRAINEE_ROLE = 'TRAINEE';
type TheoryBlockRes = Extract<BlockRes, { type: 'THEORY' }>;

// Mock hooks and API for demonstration
const useToaster = () => ({
	create: (toast: { description: string; type: string }) =>
		console.warn(`Toast: [${toast.type}] ${toast.description}`)
});
const useLearningUnitProgress = () => ({
	updateBlockProgress: (blockId: string, progress: any) =>
		console.log('Updating progress for', blockId, progress),
	getBlockProgress: (blockId: string) => {
		console.log('Getting progress for', blockId);
		return { isViewed: false };
	}
});
const api = (fetch: any) => ({
	req: (endpoint: any, payload: any) => ({
		parse: () => {
			console.log('API call:', endpoint.name, payload);
			return Promise.resolve();
		}
	})
});
const markTheoryBlockViewed = { name: 'markTheoryBlockViewed' };

interface BlockTheoryItemProps {
	block: TheoryBlockRes;
	role: RoleType;
	language: string;
}

export function TheoryBlockComponent({ block, role, language }: BlockTheoryItemProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [viewed, setViewed] = useState(false);
	const { updateBlockProgress, getBlockProgress } = useLearningUnitProgress();
	const toaster = useToaster();

	const { translatedContent, translatedId } = useMemo(() => {
		const translation = block.translatedContents?.find((c) => c.language === language);
		return {
			translatedContent: translation?.content ?? block.content,
			translatedId: translation?.id ?? block.uuid
		};
	}, [block, language]);

	const [content, setContent] = useState(translatedContent);
	const [debouncedContent] = useDebounce(content, 500);

	useEffect(() => {
		// Here you would queue the update action
		// queueBlockAction({ type: 'UPDATE_BLOCK', blockId: block.uuid, content: debouncedContent });
		console.log('Debounced content update:', debouncedContent);
	}, [debouncedContent, block.uuid]);

	useEffect(() => {
		if (role !== TRAINEE_ROLE || !containerRef.current) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (entry.isIntersecting && !viewed) {
					const viewTimeoutId = setTimeout(() => {
						setViewed(true);
						const currentProgress = getBlockProgress(block.uuid);
						updateBlockProgress(block.uuid, { ...currentProgress, isViewed: true });

						api(fetch)
							.req(markTheoryBlockViewed, { blockId: translatedId })
							.parse()
							.catch((err) => {
								console.error(`Failed to mark theory block ${translatedId} as viewed:`, err);
								toaster.create({ description: 'Failed to save progress', type: 'error' });
								// Rollback state on failure
								setViewed(false);
								updateBlockProgress(block.uuid, { ...currentProgress, isViewed: false });
							});

						observer.unobserve(entry.target);
					}, 3000);

					// Cleanup timeout on un-intersect
					return () => clearTimeout(viewTimeoutId);
				}
			},
			{ threshold: 0.2 }
		);

		observer.observe(containerRef.current);

		return () => observer.disconnect();
	}, [role, viewed, block.uuid, translatedId, getBlockProgress, updateBlockProgress, toaster]);

	return (
		<div ref={containerRef}>
			<TextEditor content={translatedContent} onUpdate={setContent} role={role} />
		</div>
	);
}