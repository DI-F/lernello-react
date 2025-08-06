package ch.nova_omnia.lernello.block.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import ch.nova_omnia.lernello.block.dto.request.blocks.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ch.nova_omnia.lernello.block.dto.request.create.CreateBlockDTO;
import ch.nova_omnia.lernello.block.dto.request.create.CreateMultipleChoiceBlockDTO;
import ch.nova_omnia.lernello.block.dto.request.create.CreateQuestionBlockDTO;
import ch.nova_omnia.lernello.block.dto.request.create.CreateTheoryBlockDTO;
import ch.nova_omnia.lernello.block.dto.request.update.UpdateMultipleChoiceBlockDTO;
import ch.nova_omnia.lernello.block.dto.request.update.UpdateQuestionBlockDTO;
import ch.nova_omnia.lernello.block.dto.request.update.UpdateTheoryBlockDTO;
import ch.nova_omnia.lernello.block.model.Block;
import ch.nova_omnia.lernello.block.model.BlockLanguage;
import ch.nova_omnia.lernello.block.model.BlockType;
import ch.nova_omnia.lernello.block.model.TheoryBlock;
import ch.nova_omnia.lernello.block.model.TranslatedBlock;
import ch.nova_omnia.lernello.block.model.quiz.MultipleChoiceBlock;
import ch.nova_omnia.lernello.block.model.quiz.QuestionBlock;
import ch.nova_omnia.lernello.block.repository.BlockRepository;
import ch.nova_omnia.lernello.block.repository.TranslatedBlockRepository;
import ch.nova_omnia.lernello.learningUnit.model.LearningUnit;
import ch.nova_omnia.lernello.learningUnit.repository.LearningUnitRepository;
import ch.nova_omnia.lernello.statistic.model.block.BlockStatistic;
import ch.nova_omnia.lernello.statistic.repository.BlockStatisticRepository;
import jakarta.persistence.LockTimeoutException;
import jakarta.persistence.PessimisticLockException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BlockService {
    private final BlockRepository blockRepository;
    private final BlockStatisticRepository blockStatisticRepository;
    private final LearningUnitRepository learningUnitRepository;
    private final TranslatedBlockRepository translatedBlockRepository;
    private final AIBlockService aiBlockService;

    private final Map<String, UUID> temporaryKeyMap = new HashMap<>();

    @Transactional
    public Block saveBlock(LearningUnit learningUnit, BlockDTO blockDTO) {
        if (blockDTO == null) {
            throw new IllegalArgumentException("BlockDTO cannot be null");
        }
        if (blockDTO instanceof TheoryBlockDTO theoryBlock) {
            TheoryBlock block = (TheoryBlock) blockRepository.findById(theoryBlock.uuid()).orElse(new TheoryBlock());
            block.setType(BlockType.THEORY);
            block.setUuid(theoryBlock.uuid());
            block.setName(theoryBlock.name());
            block.setPosition(theoryBlock.position());
            block.setLearningUnit(learningUnit);
            block.setContent(theoryBlock.content());

            if (theoryBlock.translatedContents() != null) {
                for (TranslatedBlockDTO translated : theoryBlock.translatedContents()) {
                    TranslatedBlock translatedBlock = new TranslatedBlock(translated.language(), translated.content(), block, translated.name());
                    translatedBlockRepository.save(translatedBlock);
                }
            }
            return blockRepository.saveAndFlush(block);
        } else if (blockDTO instanceof MultipleChoiceBlockDTO multipleChoiceBlock) {
            MultipleChoiceBlock block = (MultipleChoiceBlock) blockRepository.findById(multipleChoiceBlock.uuid()).orElse(new MultipleChoiceBlock());
            block.setType(BlockType.MULTIPLE_CHOICE);
            block.setUuid(multipleChoiceBlock.uuid());
            block.setName(multipleChoiceBlock.name());
            block.setPosition(multipleChoiceBlock.position());
            block.setLearningUnit(learningUnit);
            block.setQuestion(multipleChoiceBlock.question());
            block.setPossibleAnswers(multipleChoiceBlock.possibleAnswers());
            block.setCorrectAnswers(multipleChoiceBlock.correctAnswers());
            if (multipleChoiceBlock.translatedContents() != null) {
                for (TranslatedBlockDTO translated : multipleChoiceBlock.translatedContents()) {
                    TranslatedBlock translatedBlock = new TranslatedBlock(translated.language(), translated.question(), "", block, translated.name());
                    translatedBlock.setPossibleAnswers(multipleChoiceBlock.possibleAnswers());
                    translatedBlock.setCorrectAnswers(multipleChoiceBlock.correctAnswers());
                    translatedBlockRepository.save(translatedBlock);
                }
            }
            return blockRepository.saveAndFlush(block);
        } else if (blockDTO instanceof QuestionBlockDTO questionBlock) {
            QuestionBlock block = (QuestionBlock) blockRepository.findById(questionBlock.uuid()).orElse(new QuestionBlock());
            block.setType(BlockType.QUESTION);
            block.setUuid(questionBlock.uuid());
            block.setName(questionBlock.name());
            block.setPosition(questionBlock.position());
            block.setLearningUnit(learningUnit);
            block.setQuestion(questionBlock.question());
            block.setExpectedAnswer(questionBlock.expectedAnswer());
            if (questionBlock.translatedContents() != null) {
                for (TranslatedBlockDTO translated : questionBlock.translatedContents()) {
                    TranslatedBlock translatedBlock = new TranslatedBlock(translated.language(), translated.question(), translated.expectedAnswer(), block, translated.name());
                    translatedBlockRepository.save(translatedBlock);
                }
            }
            return blockRepository.saveAndFlush(block);
        } else {
            throw new IllegalArgumentException("Unsupported block type for saving: " + blockDTO);
        }
    }


    private void addTranslatedBlocks(String content, String question, String expectedAnswer, List<String> possibleAnswers, List<String> correctAnswers, Block originalBlock, LearningUnit learningUnit, int position, BlockType type, String name) {
        List<TranslatedBlock> translatedBlocks = new ArrayList<TranslatedBlock>();

        for (BlockLanguage language : BlockLanguage.values()) {
            TranslatedBlock translatedBlock = new TranslatedBlock();
            translatedBlock.setContent(content);
            translatedBlock.setCorrectAnswers(correctAnswers);
            translatedBlock.setExpectedAnswer(expectedAnswer);
            translatedBlock.setLanguage(language);
            translatedBlock.setLearningUnit(learningUnit);
            translatedBlock.setName(name);
            translatedBlock.setOriginalBlock(originalBlock);
            translatedBlock.setPosition(position);
            translatedBlock.setPossibleAnswers(possibleAnswers);
            translatedBlock.setQuestion(question);
            translatedBlock.setType(type);

            translatedBlocks.add(translatedBlock);
        }
        blockRepository.saveAll(translatedBlocks);
    }


    public static boolean isValidUUID(String str) {
        if (str == null) return false;
        try {
            UUID.fromString(str);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    private boolean isTemporaryId(String id) {
        return id != null && id.startsWith("tempid:");
    }
}
