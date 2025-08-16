package ch.nova_omnia.lernello.user.service;

import ch.nova_omnia.lernello.user.model.Role;
import ch.nova_omnia.lernello.user.model.User;
import ch.nova_omnia.lernello.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Service from Spring Security for handling user details and authentication easily.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    /**
     * Loads a user by username.
     *
     * @param username The username of the user to load.
     * @return The user details.
     * @throws UsernameNotFoundException If the user is not found.
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User Not Found with username: " + username);
        }

        List<GrantedAuthority> authorities = getUserScopes(user);

        // Passwordless: We use a dummy password here, as we don't need it.
        return org.springframework.security.core.userdetails.User
            .withUsername(user.getUsername())
            .password("")                 // <— DUMMY; we don't use passwords in passwordless setups
            .authorities(authorities)
            .accountExpired(false)
            .accountLocked(false)
            .credentialsExpired(false)
            .disabled(false)
            .build();
    }

    /**
     * gets the user id by username
     *
     * @param username the username of the user to load
     * @return the user id
     */
    public UUID getUserIdByUsername(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User Not Found with username: " + username);
        }
        return user.getUuid();
    }

    private List<GrantedAuthority> getUserScopes(User user) {
        List<GrantedAuthority> scopes = new ArrayList<>();

        // Basisscopes
        scopes.add(new SimpleGrantedAuthority("SCOPE_self:read"));
        scopes.add(new SimpleGrantedAuthority("SCOPE_self:write"));

        if (user.getRole() == Role.INSTRUCTOR) {
            scopes.add(new SimpleGrantedAuthority("SCOPE_folders:read"));
            scopes.add(new SimpleGrantedAuthority("SCOPE_folders:write"));
            scopes.add(new SimpleGrantedAuthority("SCOPE_files:read"));
            scopes.add(new SimpleGrantedAuthority("SCOPE_files:write"));
            scopes.add(new SimpleGrantedAuthority("SCOPE_blocks:read"));
            scopes.add(new SimpleGrantedAuthority("SCOPE_blocks:write"));
            scopes.add(new SimpleGrantedAuthority("SCOPE_kits:write"));
            scopes.add(new SimpleGrantedAuthority("SCOPE_user:read"));
            scopes.add(new SimpleGrantedAuthority("SCOPE_user:write"));
            scopes.add(new SimpleGrantedAuthority("SCOPE_learningUnit:read"));
            scopes.add(new SimpleGrantedAuthority("SCOPE_learningUnit:write"));
            scopes.add(new SimpleGrantedAuthority("SCOPE_kits:read"));
            scopes.add(new SimpleGrantedAuthority("SCOPE_progress:read"));
            scopes.add(new SimpleGrantedAuthority("SCOPE_progress:write"));
        } else { // TRAINEE
            scopes.add(new SimpleGrantedAuthority("SCOPE_kits:read"));
            scopes.add(new SimpleGrantedAuthority("SCOPE_folders:read"));
            scopes.add(new SimpleGrantedAuthority("SCOPE_learningUnit:read"));
            scopes.add(new SimpleGrantedAuthority("SCOPE_files:read"));
            scopes.add(new SimpleGrantedAuthority("SCOPE_blocks:read"));
            scopes.add(new SimpleGrantedAuthority("SCOPE_progress:read"));
        }

        return scopes;
    }
}
