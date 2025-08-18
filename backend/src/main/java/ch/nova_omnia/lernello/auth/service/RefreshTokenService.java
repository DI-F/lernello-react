package ch.nova_omnia.lernello.auth.service;

import ch.nova_omnia.lernello.auth.JwtUtil;
import ch.nova_omnia.lernello.auth.model.RefreshToken;
import ch.nova_omnia.lernello.auth.repository.RefreshTokenRepository;
import ch.nova_omnia.lernello.user.model.User;
import ch.nova_omnia.lernello.user.repository.UserRepository;
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
public class RefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwt;
    private final Random rng = new Random();

    @Value("${app.auth.access-cookie-name}")
    private String accessCookieName;
    @Value("${app.auth.refresh-cookie-name}")
    private String refreshCookieName;
    @Value("${app.auth.cookie-secure:false}")
    private boolean cookieSecure;
    @Value("${app.auth.cookie-samesite:Lax}")
    private String cookieSameSite;

    @Value("${app.auth.access-ttl}")
    private Duration accessTtl;
    @Value("${app.auth.refresh-long-ttl}")
    private Duration refreshLongTtl;
    @Value("${app.auth.refresh-short-ttl}")
    private Duration refreshShortTtl;

    private String randomToken() {
        byte[] bytes = new byte[32];
        rng.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private String sha256(String s) {
        try {
            var md = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(md.digest(s.getBytes()));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    private ResponseCookie buildAccessCookie(String jwtToken) {
        return ResponseCookie.from(accessCookieName, jwtToken)
            .httpOnly(true).secure(cookieSecure).sameSite(cookieSameSite)
            .path("/").maxAge(accessTtl).build();
    }

    private ResponseCookie buildRefreshCookie(String raw, Duration ttl) {
        return ResponseCookie.from(refreshCookieName, raw)
            .httpOnly(true).secure(cookieSecure).sameSite(cookieSameSite)
            .path("/").maxAge(ttl).build();
    }

    /**
     * Issue a new access and refresh token pair for the given user.
     * If `remember` is true, the refresh token will have a longer TTL.
     * The user agent and IP are stored for security purposes.
     */
    @Transactional
    public Pair issueFor(User user, boolean remember, String userAgent, String ip) {
        Instant now = Instant.now();
        Duration refreshTtl = remember ? refreshLongTtl : refreshShortTtl;

        // Access JWT
        String at = jwt.generateToken(user.getUsername(), accessTtl);
        ResponseCookie access = buildAccessCookie(at);

        // Refresh raw + hash persist
        String raw = randomToken();
        RefreshToken rt = new RefreshToken();
        rt.setUserUuid(user.getUuid());
        rt.setTokenHash(sha256(raw));
        rt.setCreatedAt(now);
        rt.setExpiresAt(now.plus(refreshTtl));
        rt.setUserAgent(userAgent);
        rt.setIp(ip);
        refreshTokenRepository.save(rt);

        ResponseCookie refresh = buildRefreshCookie(raw, refreshTtl);
        return new Pair(access, refresh);
    }

    /**
     * Rotate an existing refresh token, issuing a new access and refresh token pair.
     * The old refresh token is revoked and replaced by the new one.
     * The user agent and IP are stored for security purposes.
     */
    @Transactional
    public Pair rotate(String rawRefresh, String userAgent, String ip) {
        if (rawRefresh == null || rawRefresh.isBlank()) throw new IllegalArgumentException("No refresh token");
        Instant now = Instant.now();
        RefreshToken existing = refreshTokenRepository.findActiveByHash(sha256(rawRefresh), now)
            .orElseThrow(() -> new IllegalArgumentException("Invalid or expired refresh token"));

        // Load user by UUID from the existing refresh token -> username for new access JWT
        var user = userRepository.findByUuid(existing.getUserUuid());
        if (user == null) throw new IllegalArgumentException("User not found");

        // revoke old refresh token
        existing.setRevokedAt(now);
        refreshTokenRepository.save(existing);

        // Access new
        String at = jwt.generateToken(user.getUsername(), accessTtl);
        ResponseCookie access = buildAccessCookie(at);

        // Refresh new (Rotation, same total duration)
        Duration remaining = Duration.between(now, existing.getExpiresAt());
        if (remaining.isNegative() || remaining.isZero()) remaining = Duration.ofMinutes(1);

        String raw = randomToken();
        RefreshToken rt = new RefreshToken();
        rt.setUserUuid(existing.getUserUuid());
        rt.setTokenHash(sha256(raw));
        rt.setCreatedAt(now);
        rt.setExpiresAt(existing.getExpiresAt());
        rt.setUserAgent(userAgent);
        rt.setIp(ip);
        refreshTokenRepository.save(rt);
        existing.setReplacedBy(rt.getUuid());

        ResponseCookie refresh = buildRefreshCookie(raw, remaining);
        return new Pair(access, refresh);
    }

    /**
     * Revoke a refresh token by its raw value.
     * This will mark the token as revoked in the database.
     */
    @Transactional
    public void revoke(String rawRefresh) {
        if (rawRefresh == null || rawRefresh.isBlank()) return;
        refreshTokenRepository.findActiveByHash(sha256(rawRefresh), Instant.now()).ifPresent(rt -> {
            rt.setRevokedAt(Instant.now());
            refreshTokenRepository.save(rt);
        });
    }

    /**
     * Cleanup expired refresh tokens from the database.
     * This should be called periodically to remove old tokens.
     */
    @Transactional
    public void cleanup() {
        refreshTokenRepository.deleteExpired(Instant.now());
    }

    public record Pair(ResponseCookie access, ResponseCookie refresh) {
    }
}
