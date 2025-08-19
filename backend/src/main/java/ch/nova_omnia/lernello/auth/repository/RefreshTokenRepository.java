package ch.nova_omnia.lernello.auth.repository;

import ch.nova_omnia.lernello.auth.model.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    // Find an active refresh token by user UUID
    @Query("select r from RefreshToken r where r.tokenHash = :hash and r.revokedAt is null and r.expiresAt > :now")
    Optional<RefreshToken> findActiveByHash(@Param("hash") String hash, @Param("now") Instant now);

    // Delete all expired refresh tokens
    @Modifying
    @Query("delete from RefreshToken r where r.expiresAt <= :now")
    int deleteExpired(@Param("now") Instant now);
}
