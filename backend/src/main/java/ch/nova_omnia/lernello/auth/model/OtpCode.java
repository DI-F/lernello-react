package ch.nova_omnia.lernello.auth.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Entity
@Table(
    name = "auth_otp_codes",
    indexes = {
        @Index(name = "idx_auth_otp_email_active", columnList = "email, consumed_at, expires_at")
    }
)

@RequiredArgsConstructor
@NoArgsConstructor
public class OtpCode {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID uuid;

    @Column(nullable = false, length = 320)
    private String email;

    @Column(name = "code_hash", nullable = false, length = 64)
    private String codeHash; // sha256 hex

    @Column(name = "attempts_left", nullable = false)
    private int attemptsLeft;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "consumed_at")
    private Instant consumedAt; // set if the code was consumed, null if not

    @Column(name = "resend_available_at")
    private Instant resendAvailableAt; // optional field to control resend limits

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }
}
