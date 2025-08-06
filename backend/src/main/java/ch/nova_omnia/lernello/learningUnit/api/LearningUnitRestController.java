package ch.nova_omnia.lernello.learningUnit.api;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import ch.nova_omnia.lernello.learningUnit.dto.request.SaveLearningUnitDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import ch.nova_omnia.lernello.block.dto.request.update.RenameLearningUnitDTO;
import ch.nova_omnia.lernello.block.service.BlockService;
import ch.nova_omnia.lernello.learningKit.model.LearningKit;
import ch.nova_omnia.lernello.learningKit.repository.LearningKitRepository;
import ch.nova_omnia.lernello.learningUnit.dto.request.CreateLearningUnitDTO;
import ch.nova_omnia.lernello.learningUnit.dto.request.GenerateLearningUnitDTO;
import ch.nova_omnia.lernello.learningUnit.dto.request.JobStatusDTO;
import ch.nova_omnia.lernello.learningUnit.dto.response.LearningUnitResDTO;
import ch.nova_omnia.lernello.learningUnit.mapper.LearningUnitMapper;
import ch.nova_omnia.lernello.learningUnit.mapper.TemporaryKeyMapper;
import ch.nova_omnia.lernello.learningUnit.model.LearningUnit;
import ch.nova_omnia.lernello.learningUnit.service.AsyncJobService;
import ch.nova_omnia.lernello.learningUnit.service.LearningUnitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/learning-unit")
@Validated
@RequiredArgsConstructor
public class LearningUnitRestController {
    private final LearningKitRepository learningKitRepository;
    private final LearningUnitService learningUnitService;
    private final LearningUnitMapper learningUnitMapper;
    private final TemporaryKeyMapper temporaryKeyMapper;
    private final BlockService blockService;
    private final AsyncJobService asyncJobService;

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('SCOPE_learningUnit:read')")
    public @Valid LearningUnitResDTO getLearningUnitById(@PathVariable UUID id) {
        return learningUnitService.findById(id).map(learningUnitMapper::toDTO).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SCOPE_learningUnit:write')")
    public UUID deleteLearningUnit(@PathVariable UUID id) {
        learningUnitService.deleteById(id);
        return id;
    }

    @PostMapping("/{id}/rename")
    @PreAuthorize("hasAuthority('SCOPE_learningUnit:write')")
    public @Valid LearningUnitResDTO renameLearningUnit(@Valid @RequestBody RenameLearningUnitDTO renameLearningUnitDTO, @PathVariable UUID id) {
        LearningUnit learningUnit = learningUnitService.renameLearningUnit(id, renameLearningUnitDTO.name());
        return learningUnitMapper.toDTO(learningUnit);
    }

    @PostMapping("/{id}/save")
    @PreAuthorize("hasAuthority('SCOPE_learningUnit:write')")
    public @Valid LearningUnitResDTO saveLearningUnit(@Valid @RequestBody SaveLearningUnitDTO saveLearningUnitDTO, @PathVariable UUID id) {
        LearningUnit learningUnit = learningUnitService.saveLearningUnit(id, saveLearningUnitDTO);
        return learningUnitMapper.toDTO(learningUnit);
    }

    @PostMapping("/")
    @PreAuthorize("hasAuthority('SCOPE_learningUnit:write')")
    public @Valid LearningUnitResDTO createLearningUnit(@Valid @RequestBody CreateLearningUnitDTO createLearningUnitDTO) {
        UUID learningKitId = createLearningUnitDTO.learningKitId();

        LearningKit learningKit = learningKitRepository.findById(createLearningUnitDTO.learningKitId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        LearningUnit newLearningUnit = learningUnitMapper.toEntity(createLearningUnitDTO, learningKit);
        LearningUnit learningUnit = learningUnitService.createLearningUnit(newLearningUnit, learningKitId);
        return learningUnitMapper.toDTO(learningUnit);
    }

    @PostMapping("/{id}")
    @PreAuthorize("hasAuthority('SCOPE_learningUnit:write')")
    public @Valid LearningUnitResDTO generateLearningUnit(@PathVariable UUID id, @RequestBody GenerateLearningUnitDTO generateLearningUnitDTO) {
        LearningUnit learningUnit = learningUnitService.generateLearningUnitWithAI(generateLearningUnitDTO, id);
        return learningUnitMapper.toDTO(learningUnit);
    }

    @PostMapping("/{id}/generate-async")
    @PreAuthorize("hasAuthority('SCOPE_learningUnit:write')")
    public ResponseEntity<Map<String, String>> triggerAsyncGeneration(
                                                                      @PathVariable UUID id, @Valid @RequestBody GenerateLearningUnitDTO dto
    ) {
        String jobId = asyncJobService.startLearningUnitGeneration(id, dto);
        return ResponseEntity.accepted().body(Map.of("jobId", jobId));
    }

    @GetMapping("/generation-status/{jobId}")
    public JobStatusDTO getJobStatus(@PathVariable String jobId) {
        return asyncJobService.getStatus(jobId);
    }

    @GetMapping("/active-job/{unitId}")
    public ResponseEntity<Map<String, String>> getActiveJobId(@PathVariable UUID unitId) {
        return asyncJobService.getJobIdForUnit(unitId).map(jobId -> ResponseEntity.ok(Map.of("jobId", jobId))).orElse(ResponseEntity.noContent().build());
    }
}
