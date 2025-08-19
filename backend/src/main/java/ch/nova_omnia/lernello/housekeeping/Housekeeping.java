package ch.nova_omnia.lernello.housekeeping;

import ch.nova_omnia.lernello.auth.service.OtpCodeService;
import ch.nova_omnia.lernello.auth.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Housekeeping tasks for cleaning up expired OTP codes and refresh tokens.
 * <p>
 * This component runs scheduled tasks to periodically clean up expired OTP codes
 * and refresh tokens from the database.
 */
@Component
@EnableScheduling
@RequiredArgsConstructor
public class Housekeeping {
    private final OtpCodeService otp;
    private final RefreshTokenService rt;

    @Scheduled(cron = "0 */10 * * * *") // alle 10 Minuten
    public void sweepOtp() {
        otp.cleanup();
    }

    @Scheduled(cron = "0 0 * * * *")   // stündlich
    public void sweepRt() {
        rt.cleanup();
    }
}
