package com.jobplus.service.impl;

import com.jobplus.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${mail.from:noreply@jobplus.com}")
    private String fromAddress;

    @Value("${mail.app-url:http://localhost:5173}")
    private String appUrl;

    // ── public interface ──────────────────────────────────────────────────────

    @Override
    @Async
    public void sendWelcome(String toEmail, String userName) {
        String subject = "Welcome to JobPlus, " + firstName(userName) + "!";
        String html = """
                <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
                  <div style="background:linear-gradient(135deg,#4338CA 0%%,#6366f1 100%%);padding:40px 32px;border-radius:12px 12px 0 0;">
                    <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">Welcome to JobPlus</h1>
                    <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:15px;">Your career journey starts here</p>
                  </div>
                  <div style="padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
                    <p style="color:#1e293b;font-size:16px;line-height:1.6;">Hi <strong>%s</strong>,</p>
                    <p style="color:#475569;font-size:15px;line-height:1.7;">
                      Your account is ready. Browse thousands of jobs, connect with professionals, and let employers find you.
                    </p>
                    <div style="text-align:center;margin:32px 0;">
                      <a href="%s/jobs" style="background:#4338CA;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">
                        Browse Jobs
                      </a>
                    </div>
                    <p style="color:#94a3b8;font-size:13px;border-top:1px solid #f1f5f9;padding-top:20px;margin-top:20px;">
                      &copy; JobPlus &mdash; <a href="%s" style="color:#4338CA;text-decoration:none;">jobplus.com</a>
                    </p>
                  </div>
                </div>
                """.formatted(firstName(userName), appUrl, appUrl);
        send(toEmail, subject, html);
    }

    @Override
    public String sendPasswordReset(String toEmail, String userName, String token) {
        String resetUrl = appUrl + "/reset-password?token=" + token;
        // Dev convenience: when SMTP is disabled no email goes out, which would make the
        // reset flow a dead end locally. Surface the link (logged + returned to the caller)
        // so it can be used. Self-gating — in production mail.enabled=true, so we send a real
        // email and return null, never exposing the link.
        if (!mailEnabled) {
            log.info("Mail disabled — password reset link for {}: {}", toEmail, resetUrl);
            return resetUrl;
        }
        String subject = "Reset your JobPlus password";
        String html = """
                <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
                  <div style="background:linear-gradient(135deg,#4338CA 0%%,#6366f1 100%%);padding:40px 32px;border-radius:12px 12px 0 0;">
                    <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">Reset Your Password</h1>
                  </div>
                  <div style="padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
                    <p style="color:#1e293b;font-size:16px;">Hi <strong>%s</strong>,</p>
                    <p style="color:#475569;font-size:15px;line-height:1.7;">
                      We received a request to reset your JobPlus password. Click the button below to choose a new one.
                      This link expires in 30 minutes.
                    </p>
                    <div style="text-align:center;margin:32px 0;">
                      <a href="%s" style="background:#4338CA;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">
                        Reset Password
                      </a>
                    </div>
                    <p style="color:#94a3b8;font-size:13px;line-height:1.7;">
                      If you didn't request this, you can safely ignore this email &mdash; your password won't change.
                    </p>
                    <p style="color:#94a3b8;font-size:13px;border-top:1px solid #f1f5f9;padding-top:20px;margin-top:20px;">
                      &copy; JobPlus &mdash; <a href="%s" style="color:#4338CA;text-decoration:none;">jobplus.com</a>
                    </p>
                  </div>
                </div>
                """.formatted(firstName(userName), resetUrl, appUrl);
        send(toEmail, subject, html);
        return null;
    }

    @Override
    @Async
    public void sendNewApplicationAlert(String toEmail, String employerName, String seekerName,
                                        String jobTitle, Long jobId) {
        String subject = "New application for \"" + jobTitle + "\"";
        String html = """
                <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
                  <div style="background:linear-gradient(135deg,#10b981 0%%,#059669 100%%);padding:40px 32px;border-radius:12px 12px 0 0;">
                    <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">New Application Received</h1>
                  </div>
                  <div style="padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
                    <p style="color:#1e293b;font-size:16px;">Hi <strong>%s</strong>,</p>
                    <p style="color:#475569;font-size:15px;line-height:1.7;">
                      <strong>%s</strong> has applied for <strong>%s</strong>.
                    </p>
                    <div style="background:#f8fafc;border-radius:8px;padding:16px 20px;margin:24px 0;border-left:4px solid #10b981;">
                      <p style="margin:0;color:#64748b;font-size:13px;">POSITION</p>
                      <p style="margin:4px 0 0;color:#1e293b;font-size:16px;font-weight:600;">%s</p>
                    </div>
                    <div style="text-align:center;margin:28px 0;">
                      <a href="%s/employer/applicants?job=%d" style="background:#10b981;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">
                        Review Application
                      </a>
                    </div>
                    <p style="color:#94a3b8;font-size:13px;border-top:1px solid #f1f5f9;padding-top:20px;margin-top:20px;">
                      &copy; JobPlus &mdash; <a href="%s" style="color:#4338CA;text-decoration:none;">jobplus.com</a>
                    </p>
                  </div>
                </div>
                """.formatted(firstName(employerName), seekerName, jobTitle, jobTitle, appUrl, jobId, appUrl);
        send(toEmail, subject, html);
    }

    @Override
    @Async
    public void sendApplicationStatusUpdate(String toEmail, String seekerName,
                                            String jobTitle, String status, Long jobId) {
        String label = formatStatus(status);
        String color = statusColor(status);
        String subject = "Your application for \"" + jobTitle + "\" has been updated";
        String html = """
                <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
                  <div style="background:linear-gradient(135deg,#4338CA 0%%,#6366f1 100%%);padding:40px 32px;border-radius:12px 12px 0 0;">
                    <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">Application Update</h1>
                  </div>
                  <div style="padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
                    <p style="color:#1e293b;font-size:16px;">Hi <strong>%s</strong>,</p>
                    <p style="color:#475569;font-size:15px;line-height:1.7;">
                      Your application for <strong>%s</strong> has a new status.
                    </p>
                    <div style="background:#f8fafc;border-radius:8px;padding:16px 20px;margin:24px 0;border-left:4px solid %s;">
                      <p style="margin:0;color:#64748b;font-size:13px;">STATUS</p>
                      <p style="margin:4px 0 0;color:%s;font-size:18px;font-weight:700;">%s</p>
                    </div>
                    <div style="text-align:center;margin:28px 0;">
                      <a href="%s/applications" style="background:#4338CA;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">
                        View Application
                      </a>
                    </div>
                    <p style="color:#94a3b8;font-size:13px;border-top:1px solid #f1f5f9;padding-top:20px;margin-top:20px;">
                      &copy; JobPlus &mdash; <a href="%s" style="color:#4338CA;text-decoration:none;">jobplus.com</a>
                    </p>
                  </div>
                </div>
                """.formatted(firstName(seekerName), jobTitle, color, color, label, appUrl, appUrl);
        send(toEmail, subject, html);
    }

    @Override
    @Async
    public void sendConnectionRequest(String toEmail, String recipientName, String requesterName) {
        String subject = requesterName + " wants to connect with you";
        String html = """
                <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
                  <div style="background:linear-gradient(135deg,#f59e0b 0%%,#d97706 100%%);padding:40px 32px;border-radius:12px 12px 0 0;">
                    <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">Connection Request</h1>
                  </div>
                  <div style="padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
                    <p style="color:#1e293b;font-size:16px;">Hi <strong>%s</strong>,</p>
                    <p style="color:#475569;font-size:15px;line-height:1.7;">
                      <strong>%s</strong> sent you a connection request on JobPlus.
                    </p>
                    <div style="text-align:center;margin:28px 0;">
                      <a href="%s/network" style="background:#f59e0b;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">
                        View Request
                      </a>
                    </div>
                    <p style="color:#94a3b8;font-size:13px;border-top:1px solid #f1f5f9;padding-top:20px;margin-top:20px;">
                      &copy; JobPlus &mdash; <a href="%s" style="color:#4338CA;text-decoration:none;">jobplus.com</a>
                    </p>
                  </div>
                </div>
                """.formatted(firstName(recipientName), requesterName, appUrl, appUrl);
        send(toEmail, subject, html);
    }

    @Override
    @Async
    public void sendConnectionAccepted(String toEmail, String recipientName, String acceptorName) {
        String subject = acceptorName + " accepted your connection request";
        String html = """
                <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
                  <div style="background:linear-gradient(135deg,#4338CA 0%%,#6366f1 100%%);padding:40px 32px;border-radius:12px 12px 0 0;">
                    <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">You're Connected!</h1>
                  </div>
                  <div style="padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
                    <p style="color:#1e293b;font-size:16px;">Hi <strong>%s</strong>,</p>
                    <p style="color:#475569;font-size:15px;line-height:1.7;">
                      <strong>%s</strong> accepted your connection request. You can now message each other.
                    </p>
                    <div style="text-align:center;margin:28px 0;">
                      <a href="%s/network" style="background:#4338CA;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">
                        View Network
                      </a>
                    </div>
                    <p style="color:#94a3b8;font-size:13px;border-top:1px solid #f1f5f9;padding-top:20px;margin-top:20px;">
                      &copy; JobPlus &mdash; <a href="%s" style="color:#4338CA;text-decoration:none;">jobplus.com</a>
                    </p>
                  </div>
                </div>
                """.formatted(firstName(recipientName), acceptorName, appUrl, appUrl);
        send(toEmail, subject, html);
    }

    // ── private helpers ───────────────────────────────────────────────────────

    private void send(String to, String subject, String html) {
        if (!mailEnabled) {
            log.debug("Mail disabled — skipping: [{}] to {}", subject, to);
            return;
        }
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, false, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(msg);
            log.info("Email sent: [{}] to {}", subject, to);
        } catch (Exception e) {
            log.error("Failed to send email [{}] to {}: {}", subject, to, e.getMessage());
        }
    }

    private static String firstName(String fullName) {
        if (fullName == null || fullName.isBlank()) return "there";
        int space = fullName.indexOf(' ');
        return space > 0 ? fullName.substring(0, space) : fullName;
    }

    private static String formatStatus(String status) {
        if (status == null) return "Updated";
        return switch (status.toUpperCase()) {
            case "REVIEWING"  -> "Under Review";
            case "SHORTLISTED"-> "Shortlisted";
            case "REJECTED"   -> "Not Selected";
            case "HIRED"      -> "Hired";
            default           -> status.charAt(0) + status.substring(1).toLowerCase();
        };
    }

    private static String statusColor(String status) {
        if (status == null) return "#4338CA";
        return switch (status.toUpperCase()) {
            case "SHORTLISTED", "HIRED" -> "#10b981";
            case "REJECTED"             -> "#ef4444";
            case "REVIEWING"            -> "#f59e0b";
            default                     -> "#4338CA";
        };
    }
}
