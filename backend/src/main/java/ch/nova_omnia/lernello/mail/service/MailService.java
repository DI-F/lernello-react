package ch.nova_omnia.lernello.mail.service;

public interface MailService {
    void sendOtp(String toEmail, String code);
}
