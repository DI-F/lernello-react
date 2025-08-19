package ch.nova_omnia.lernello.auth.service;

import ch.nova_omnia.lernello.auth.dto.request.RequestCodeDTO;
import ch.nova_omnia.lernello.auth.dto.request.VerifyCodeDTO;
import ch.nova_omnia.lernello.auth.model.OtpCode;
import ch.nova_omnia.lernello.auth.repository.OtpCodeRepository;
import ch.nova_omnia.lernello.mail.service.MailService;
import ch.nova_omnia.lernello.user.model.User;
import ch.nova_omnia.lernello.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpCodeService {
    private final OtpCodeRepository otpCodeRepository;
    private final MailService mailService;
    private final UserService userService;
    private final Random rng = new Random();

    @Value("${app.auth.code-ttl-minutes}")
    private Duration codeTtlMinutes;
    @Value("${app.auth.resend-cooldown-seconds:0}")
    private Duration resendCooldownSeconds;

    private String genCode() {
        return String.format("%06d", rng.nextInt(1_000_000));
    }

    private String sha256(String raw) {
        try {
            var md = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(md.digest(raw.getBytes()));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    @Transactional
    public void requestCode(RequestCodeDTO req) {
        final Instant now = Instant.now();
        final String email = req.email().trim().toLowerCase();

        // No existence leak → always return 204; ignore if user does not exist
        if (userService.findByUsername(email) == null) {
            return; // no user found, but we don't leak existence, 204 is returned
        }

        otpCodeRepository.findActiveByEmail(email, now).ifPresent(active -> {
            if (active.getResendAvailableAt() != null && active.getResendAvailableAt().isAfter(now)) {
                long wait = active.getResendAvailableAt().getEpochSecond() - now.getEpochSecond();
                throw new IllegalArgumentException("Please wait " + wait + "s before requesting a new code.");
            }
            otpCodeRepository.deleteAllActiveForEmail(email);
        });

        String code = genCode();
        String hash = sha256(code + "|" + email);

        OtpCode e = new OtpCode();
        e.setEmail(email);
        e.setCodeHash(hash);
        e.setAttemptsLeft(5);
        e.setExpiresAt(now.plus(codeTtlMinutes));
        e.setResendAvailableAt(resendCooldownSeconds.isZero() ? null : now.plus(resendCooldownSeconds));
        otpCodeRepository.save(e);

        mailService.sendOtp(email, code);
    }

    @Transactional
    public User verify(VerifyCodeDTO dto) {
        final Instant now = Instant.now();
        final String email = dto.email().trim().toLowerCase();

        OtpCode active = otpCodeRepository.findActiveByEmail(email, now)
            .orElseThrow(() -> new IllegalArgumentException("OTP expired or not found"));

        if (active.getAttemptsLeft() <= 0) throw new IllegalArgumentException("Too many attempts");

        String submittedHash = sha256(dto.code() + "|" + email);
        if (!submittedHash.equals(active.getCodeHash())) {
            active.setAttemptsLeft(active.getAttemptsLeft() - 1);
            otpCodeRepository.save(active);
            throw new IllegalArgumentException("Invalid code");
        }

        // Success -> mark as consumed
        active.setConsumedAt(now);
        otpCodeRepository.save(active);

        return userService.findByUsername(email);
    }

    @Transactional
    public void cleanup() {
        Instant now = Instant.now();
        Instant beforeConsumed = now.minus(Duration.ofDays(1));
        otpCodeRepository.deleteOldAndExpired(beforeConsumed, now);
    }
}
