package ch.nova_omnia.lernello.auth.service;

import ch.nova_omnia.lernello.auth.JwtUtil;
import ch.nova_omnia.lernello.auth.dto.request.RequestCodeDTO;
import ch.nova_omnia.lernello.auth.dto.request.VerifyCodeDTO;
import ch.nova_omnia.lernello.auth.model.OtpCode;
import ch.nova_omnia.lernello.auth.repository.OtpCodeRepository;
import ch.nova_omnia.lernello.mail.service.MailService;
import ch.nova_omnia.lernello.user.model.User;
import ch.nova_omnia.lernello.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
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
    private final JwtUtil jwtUtil;
    private final Random rng = new Random();

    @Value("${app.auth.cookie-name}")
    private String cookieName;
    @Value("${app.auth.cookie-secure:false}")
    private boolean cookieSecure;
    @Value("${app.auth.cookie-samesite:Lax}")
    private String cookieSameSite;
    @Value("${app.auth.short-ttl-minutes}")
    private Duration shortTtlMinutes;
    @Value("${app.auth.long-ttl-days}")
    private Duration longTtlDays;
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

        otpCodeRepository.findActiveByEmail(email, now).ifPresent(active -> {
            if (active.getResendAvailableAt() != null && active.getResendAvailableAt().isAfter(now)) {
                long wait = active.getResendAvailableAt().getEpochSecond() - now.getEpochSecond();
                throw new IllegalArgumentException("Please wait " + wait + "s before requesting a new code.");
            }
            otpCodeRepository.deleteAllActiveForEmail(email); // delete old active codes
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
    public ResponseCookie verify(VerifyCodeDTO dto, boolean remember) {
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

        // User sicherstellen und JWT setzen
        User user = userService.findOrCreateByUsername(email);
        String token = jwtUtil.generateToken(user.getUsername());

        Duration maxAge = remember ? longTtlDays : shortTtlMinutes;
        return ResponseCookie.from(cookieName, token)
            .httpOnly(true).secure(cookieSecure).sameSite(cookieSameSite)
            .path("/").maxAge(maxAge).build();
    }

    @Transactional
    public int cleanup() {
        Instant now = Instant.now();
        Instant beforeConsumed = now.minus(Duration.ofDays(1));
        return otpCodeRepository.deleteOldAndExpired(beforeConsumed, now);
    }
}
