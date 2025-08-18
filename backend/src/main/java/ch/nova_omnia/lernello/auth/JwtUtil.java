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

/**
 * Utility class for JWT operations for generating and validating tokens.
 */
@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String jwtSecret;
    private SecretKey key;

    @PostConstruct
    public void init() {
        byte[] keyBytes;
        String s = jwtSecret.trim();
        try {
            keyBytes = Decoders.BASE64.decode(s);
        } catch (IllegalArgumentException ignore) {
            keyBytes = s.getBytes(StandardCharsets.UTF_8);
        }
        if (keyBytes.length < 32) {
            throw new IllegalStateException("jwt.secret must be >= 32 bytes (256-bit). Provide a long random string or Base64-encode it.");
        }
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Creates a JWT with the exact desired lifetime.
     */
    public String generateToken(String subject, Duration ttl) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + ttl.toMillis());
        return Jwts.builder()
            .setSubject(subject)
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
