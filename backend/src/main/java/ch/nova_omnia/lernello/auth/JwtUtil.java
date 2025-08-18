package ch.nova_omnia.lernello.auth;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Date;

@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String jwtSecret;
    private SecretKey key;

    @PostConstruct
    public void init() {
        // 1) Try Base64 decoding (recommended format)
        // 2) If that fails, use the raw bytes of the string
        byte[] keyBytes;
        final String s = jwtSecret == null ? "" : jwtSecret.trim();
        try {
            keyBytes = Decoders.BASE64.decode(s);
        } catch (IllegalArgumentException e) {
            keyBytes = s.getBytes(StandardCharsets.UTF_8);
        }

        // HS256 requires at least 256 bits (32 bytes)
        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                "jwt.secret must be at least 256 bits (32 bytes). Provided: " + (keyBytes.length * 8) + " bits."
            );
        }
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Access-JWT mit frei wählbarer Lebensdauer
     */
    public String generateToken(String username, Duration ttl) {
        final Date now = new Date();
        final Date exp = new Date(now.getTime() + ttl.toMillis());
        return Jwts.builder()
            .setSubject(username)
            .setIssuedAt(now)
            .setExpiration(exp)
            .signWith(key, SignatureAlgorithm.HS256)
            .compact();
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
            .parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateJwtToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
