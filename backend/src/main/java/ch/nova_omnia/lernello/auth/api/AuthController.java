package ch.nova_omnia.lernello.auth.api;

import ch.nova_omnia.lernello.auth.dto.request.RequestCodeDTO;
import ch.nova_omnia.lernello.auth.dto.request.VerifyCodeDTO;
import ch.nova_omnia.lernello.auth.dto.response.AuthUserResDTO;
import ch.nova_omnia.lernello.auth.service.OtpCodeService;
import ch.nova_omnia.lernello.auth.service.RefreshTokenService;
import ch.nova_omnia.lernello.user.model.User;
import ch.nova_omnia.lernello.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
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
    private final RefreshTokenService refresh;
    private final UserService users;

    @Value("${app.auth.access-cookie-name}")
    private String accessCookieName;
    @Value("${app.auth.refresh-cookie-name}")
    private String refreshCookieName;
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
                                       @RequestParam(defaultValue = "true") boolean remember,
                                       HttpServletRequest req) {
        User user = otp.verify(body);
        var pair = refresh.issueFor(user, remember, req.getHeader("User-Agent"), req.getRemoteAddr());
        return ResponseEntity.noContent()
            .header(HttpHeaders.SET_COOKIE, pair.access().toString())
            .header(HttpHeaders.SET_COOKIE, pair.refresh().toString())
            .build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<Void> refresh(@CookieValue(name = "${app.auth.refresh-cookie-name}", required = false) String raw,
                                        HttpServletRequest req) {
        if (raw == null || raw.isBlank()) return ResponseEntity.status(401).build();
        var pair = this.refresh.rotate(raw, req.getHeader("User-Agent"), req.getRemoteAddr());
        return ResponseEntity.noContent()
            .header(HttpHeaders.SET_COOKIE, pair.access().toString())
            .header(HttpHeaders.SET_COOKIE, pair.refresh().toString())
            .build();
    }

    @GetMapping("/me")
    public ResponseEntity<AuthUserResDTO> me(@AuthenticationPrincipal UserDetails principal) {
        if (principal == null) return ResponseEntity.noContent().build();
        User u = users.getUserFromUserDetails(principal);
        return ResponseEntity.ok(new AuthUserResDTO(u.getUuid(), u.getUsername(), u.getRole(), u.getLocale()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
        @CookieValue(name = "${app.auth.refresh-cookie-name}", required = false) String rawRefresh
    ) {
        refresh.revoke(rawRefresh);
        ResponseCookie clearAccess = ResponseCookie.from(accessCookieName, "")
            .httpOnly(true).secure(cookieSecure).sameSite(cookieSameSite).path("/").maxAge(0).build();
        ResponseCookie clearRefresh = ResponseCookie.from(refreshCookieName, "")
            .httpOnly(true).secure(cookieSecure).sameSite(cookieSameSite).path("/").maxAge(0).build();
        return ResponseEntity.noContent()
            .header(HttpHeaders.SET_COOKIE, clearAccess.toString())
            .header(HttpHeaders.SET_COOKIE, clearRefresh.toString())
            .build();
    }
}
