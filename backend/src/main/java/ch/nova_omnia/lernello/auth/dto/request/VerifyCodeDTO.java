package ch.nova_omnia.lernello.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerifyCodeDTO(
    @Email @NotBlank String email,
    @Pattern(regexp = "^\\d{6}$") String code
) {
}
