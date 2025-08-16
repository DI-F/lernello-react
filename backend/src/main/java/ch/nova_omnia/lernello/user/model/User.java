package ch.nova_omnia.lernello.user.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "users")
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "uuid", nullable = false)
    @NotNull
    private UUID uuid;

    @Column(name = "username", nullable = false, unique = true)
    @NotBlank
    @Email
    private String username;

    @Column(name = "name", nullable = false)
    @NotBlank
    private String name;

    @Column(name = "surname", nullable = false)
    @NotBlank
    private String surname;

    @Column(name = "locale")
    private String locale;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    @NotNull
    private Role role;

    @Column(name = "create_date", updatable = false)
    @CreationTimestamp
    private LocalDateTime createDate;

    @Column(name = "update_date")
    @UpdateTimestamp
    private LocalDateTime updateDate;

    @Transient
    private String token;

    @Transient
    private ZonedDateTime expires;

    public User(String username, String surname, String name, String locale, Role role) {
        this.username = username;
        this.surname = surname;
        this.name = name;
        this.locale = locale;
        this.role = role;
    }
}
