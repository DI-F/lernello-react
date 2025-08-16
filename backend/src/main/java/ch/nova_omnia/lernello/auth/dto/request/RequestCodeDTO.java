package ch.nova_omnia.lernello.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

public record RequestCodeDTO(
    @Email @NotNull String email,
    @NotNull Boolean remember
) {
}
