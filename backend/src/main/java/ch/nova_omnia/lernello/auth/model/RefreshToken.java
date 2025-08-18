package ch.nova_omnia.lernello.auth.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Data
@Table(name = "auth_refresh_tokens", indexes = {
    @Index(name = "idx_rt_user_active", columnList = "user_uuid, revoked_at, expires_at"),
    @Index(name = "idx_rt_hash", columnList = "token_hash", unique = true)
})
@RequiredArgsConstructor
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID uuid;

    @Column(name = "user_uuid", nullable = false)
    private UUID userUuid;

    @Column(name = "token_hash", nullable = false, length = 64)
    private String tokenHash; // sha256(raw)

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    @Column(name = "replaced_by")
    private UUID replacedBy;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "ip")
    private String ip;
}
