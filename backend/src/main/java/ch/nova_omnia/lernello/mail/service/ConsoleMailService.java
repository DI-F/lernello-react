package ch.nova_omnia.lernello.mail.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile({"local", "dev"})
public class ConsoleMailService implements MailService {
    private static final Logger log = LoggerFactory.getLogger(ConsoleMailService.class);

    @Override
    public void sendOtp(String toEmail, String code) {
        log.info("[DEV MAIL] OTP for {} is {}", toEmail, code);
    }
}
