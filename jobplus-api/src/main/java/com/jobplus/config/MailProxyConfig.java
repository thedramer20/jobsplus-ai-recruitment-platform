package com.jobplus.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.context.annotation.Configuration;

import java.util.Properties;

/**
 * Routes outgoing SMTP through a SOCKS proxy when MAIL_SOCKS_HOST is set.
 * Needed on networks that block Gmail's SMTP directly (e.g. behind the GFW with
 * a local Clash/V2Ray proxy). Self-gating: with no MAIL_SOCKS_HOST it does nothing,
 * so production behaviour is unchanged.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class MailProxyConfig {

    private final JavaMailSender mailSender;

    @Value("${MAIL_SOCKS_HOST:}")
    private String socksHost;

    @Value("${MAIL_SOCKS_PORT:1080}")
    private String socksPort;

    @PostConstruct
    void applyProxy() {
        if (socksHost == null || socksHost.isBlank() || !(mailSender instanceof JavaMailSenderImpl impl)) {
            return;
        }
        // Expose proxy coordinates to SocksProxySocketFactory (instantiated by JavaMail via reflection).
        System.setProperty("jobplus.mail.socks.host", socksHost.trim());
        System.setProperty("jobplus.mail.socks.port", socksPort.trim());

        Properties props = impl.getJavaMailProperties();
        // Route the initial (plain) SMTP socket through the SOCKS proxy with remote DNS,
        // then let STARTTLS upgrade it to TLS. Requires port 587 + starttls.
        props.put("mail.smtp.socketFactory.class", SocksProxySocketFactory.class.getName());
        props.put("mail.smtp.socketFactory.fallback", "false");
        log.info("Mail: routing SMTP through SOCKS proxy {}:{} (remote DNS)", socksHost.trim(), socksPort.trim());
    }
}
