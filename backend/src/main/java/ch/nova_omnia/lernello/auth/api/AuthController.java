package ch.nova_omnia.lernello.auth.api;

import ch.nova_omnia.lernello.auth.dto.request.RequestCodeDTO;
import ch.nova_omnia.lernello.auth.dto.request.VerifyCodeDTO;
import ch.nova_omnia.lernello.auth.dto.response.AuthUserResDTO;
import ch.nova_omnia.lernello.auth.service.OtpCodeService;
import ch.nova_omnia.lernello.user.model.User;
import ch.nova_omnia.lernello.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final OtpCodeService otp;
    private final UserService users;

    @Value("${app.auth.cookie-name}")
    private String cookieName;
    @Value("${app.auth.cookie-secure:false}")
    private boolean cookieSecure;
    @Value("${app.auth.cookie-samesite:Lax}")
    private String cookieSameSite;

    @PostMapping("/request")
    public ResponseEntity<Void> request(@RequestBody @Valid RequestCodeDTO body) {
        otp.requestCode(body);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/verify")
    public ResponseEntity<Void> verify(@RequestBody @Valid VerifyCodeDTO body,
                                       @RequestParam(name = "remember", defaultValue = "true") boolean remember) {
        ResponseCookie cookie = otp.verify(body, remember);
        return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE, cookie.toString()).build();
    }

    @GetMapping("/me")
    public ResponseEntity<AuthUserResDTO> me(@AuthenticationPrincipal UserDetails principal) {
        if (principal == null) return ResponseEntity.noContent().build();
        User u = users.getUserFromUserDetails(principal);
        return ResponseEntity.ok(new AuthUserResDTO(u.getUuid(), u.getUsername(), u.getRole(), u.getLocale()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        ResponseCookie clear = ResponseCookie.from(cookieName, "")
            .httpOnly(true).secure(cookieSecure).sameSite(cookieSameSite)
            .path("/").maxAge(0).build();
        return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE, clear.toString()).build();
    }
}
