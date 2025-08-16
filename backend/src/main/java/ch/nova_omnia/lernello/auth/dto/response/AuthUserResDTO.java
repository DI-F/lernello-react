package ch.nova_omnia.lernello.auth.dto.response;

import ch.nova_omnia.lernello.user.model.Role;

import java.util.UUID;

public record AuthUserResDTO(
    UUID uuid,
    String username,
    Role role,
    String locale
) {
}
