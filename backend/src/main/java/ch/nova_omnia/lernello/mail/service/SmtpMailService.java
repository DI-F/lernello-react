package ch.nova_omnia.lernello.mail.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Profile({"default", "prod"}) // in local/dev profile, we use console output instead
public class SmtpMailService implements MailService {
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String sender;

    @Override
    public void sendOtp(String toEmail, String code) {
        try {
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                mime, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, "UTF-8");
            helper.setFrom(sender);
            helper.setTo(toEmail);
            helper.setSubject("Your Lernello sign-in code");
            helper.setText(buildText(toEmail, code), buildHtml(toEmail, code));
            mailSender.send(mime);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send OTP mail", e);
        }
    }

    private String buildText(String email, String code) {
        return ("""
            Use this code to sign in to Lernello:


            %s


            This code expires in 10 minutes. If you didn't request it, you can ignore this email.
            """
        ).formatted(code);
    }

    private String buildHtml(String email, String code) {
        return ("""
              <!doctype html>
              <html><body style=\"font-family:Arial,sans-serif;line-height:1.5;color:#111827\">
                <h2 style=\"margin:0 0 8px 0;color:#2563eb\">Your Lernello sign-in code</h2>
                <p>Use this 6‑digit code to complete your sign-in:</p>
                <p style=\"font-size:24px;font-weight:700;letter-spacing:4px;background:#f1f5f9;display:inline-block;padding:8px 12px;border-radius:8px\">%s</p>
                <p style=\"margin-top:16px;color:#6b7280\">The code expires in 10 minutes. If you didn’t request it, you can ignore this message.</p>
              </body></html>
            """).formatted(code);
    }
}
