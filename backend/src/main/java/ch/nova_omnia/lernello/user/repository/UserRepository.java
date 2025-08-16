package ch.nova_omnia.lernello.user.repository;

import ch.nova_omnia.lernello.user.model.Role;
import ch.nova_omnia.lernello.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    User findByUsername(String username);

    List<User> findAllByRoleOrderBySurnameAscNameAsc(Role role);

    User findByUuid(UUID uuid);

    boolean existsByUsername(String email);

    Optional<User> findByUsernameIgnoreCase(String username);
}
