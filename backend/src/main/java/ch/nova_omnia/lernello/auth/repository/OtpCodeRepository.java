package ch.nova_omnia.lernello.auth.repository;

import ch.nova_omnia.lernello.auth.model.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpCodeRepository extends JpaRepository<OtpCode, UUID> {
    // Find the most recent active OTP code for a given email
    @Query("""
          select c from OtpCode c
           where lower(c.email) = lower(:email)
             and c.consumedAt is null
             and c.expiresAt > :now
           order by c.createdAt desc
        """)
    Optional<OtpCode> findActiveByEmail(@Param("email") String email, @Param("now") Instant now);

    // Delete all active OTP codes for a given email that have not been consumed
    @Modifying
    @Query("""
          delete from OtpCode c
           where lower(c.email) = lower(:email)
             and c.consumedAt is null
        """)
    int deleteAllActiveForEmail(@Param("email") String email);

    // Delete all OTP codes that are either consumed or expired
    @Modifying
    @Query("""
          delete from OtpCode c
           where (c.consumedAt is not null and c.createdAt < :beforeConsumed)
              or (c.expiresAt < :now)
        """)
    int deleteOldAndExpired(@Param("beforeConsumed") Instant beforeConsumed, @Param("now") Instant now);
}
