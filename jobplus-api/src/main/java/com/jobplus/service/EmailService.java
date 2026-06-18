package com.jobplus.service;

public interface EmailService {
    void sendWelcome(String toEmail, String userName);
    /**
     * Sends the password-reset email. Returns the reset URL ONLY when mail is disabled
     * (local/dev), so callers can surface it directly; returns null when a real email was sent.
     */
    String sendPasswordReset(String toEmail, String userName, String token);
    void sendNewApplicationAlert(String toEmail, String employerName, String seekerName, String jobTitle, Long jobId);
    void sendApplicationStatusUpdate(String toEmail, String seekerName, String jobTitle, String status, Long jobId);
    void sendConnectionRequest(String toEmail, String recipientName, String requesterName);
    void sendConnectionAccepted(String toEmail, String recipientName, String acceptorName);
}
