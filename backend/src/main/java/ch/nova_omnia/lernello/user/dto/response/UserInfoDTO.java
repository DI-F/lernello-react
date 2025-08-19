package ch.nova_omnia.lernello.user.dto.response;

import ch.nova_omnia.lernello.user.model.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record UserInfoDTO(
    String locale,
    @NotBlank String username,
    @NotNull UUID uuid,
    @NotNull Role role
) {
}
