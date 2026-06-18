package com.jobplus.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@ExtendWith(MockitoExtension.class)
class JwtUtilTest {

    @InjectMocks
    private JwtUtil jwtUtil;

    // Base64 of "jobplus-test-access-secret-signing-key-12345" (45 bytes = 360 bits > 256 bits)
    private static final String ACCESS_SECRET  = "am9icGx1cy10ZXN0LWFjY2Vzcy1zZWNyZXQtc2lnbmluZy1rZXktMTIzNDU=";
    // Base64 of "jobplus-test-refresh-secret-signing-key-67890" (46 bytes)
    private static final String REFRESH_SECRET = "am9icGx1cy10ZXN0LXJlZnJlc2gtc2VjcmV0LXNpZ25pbmcta2V5LTY3ODkw";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(jwtUtil, "jwtSecret",        ACCESS_SECRET);
        ReflectionTestUtils.setField(jwtUtil, "accessExpiryMs",   900_000L);
        ReflectionTestUtils.setField(jwtUtil, "jwtRefreshSecret", REFRESH_SECRET);
        ReflectionTestUtils.setField(jwtUtil, "refreshExpiryMs",  604_800_000L);
    }

    @Test
    void generateAccessToken_returnsNonNull() {
        String token = jwtUtil.generateAccessToken(1L, "alice@example.com", "JOB_SEEKER");
        assertThat(token).isNotNull().isNotBlank();
    }

    @Test
    void validateAccessToken_acceptsFreshTokenAndReturnsCorrectClaims() {
        String token = jwtUtil.generateAccessToken(42L, "bob@example.com", "EMPLOYER");
        Claims claims = jwtUtil.validateAccessToken(token);
        assertThat(claims.getSubject()).isEqualTo("42");
        assertThat(claims.get("email", String.class)).isEqualTo("bob@example.com");
        assertThat(claims.get("role",  String.class)).isEqualTo("EMPLOYER");
    }

    @Test
    void getUserIdFromToken_returnsCorrectId() {
        String token  = jwtUtil.generateAccessToken(99L, "carol@example.com", "ADMIN");
        Claims claims = jwtUtil.validateAccessToken(token);
        assertThat(jwtUtil.getUserIdFromToken(claims)).isEqualTo(99L);
    }

    @Test
    void getRoleFromToken_returnsCorrectRole() {
        String token  = jwtUtil.generateAccessToken(1L, "admin@jobplus.com", "ADMIN");
        Claims claims = jwtUtil.validateAccessToken(token);
        assertThat(jwtUtil.getRoleFromToken(claims)).isEqualTo("ADMIN");
    }

    @Test
    void validateAccessToken_throwsOnTamperedToken() {
        String token    = jwtUtil.generateAccessToken(1L, "user@example.com", "JOB_SEEKER");
        String tampered = token.substring(0, token.length() - 4) + "XXXX";
        assertThrows(JwtException.class, () -> jwtUtil.validateAccessToken(tampered));
    }

    @Test
    void validateAccessToken_throwsOnExpiredToken() throws InterruptedException {
        JwtUtil shortLived = new JwtUtil();
        ReflectionTestUtils.setField(shortLived, "jwtSecret",        ACCESS_SECRET);
        ReflectionTestUtils.setField(shortLived, "accessExpiryMs",   1L);
        ReflectionTestUtils.setField(shortLived, "jwtRefreshSecret", REFRESH_SECRET);
        ReflectionTestUtils.setField(shortLived, "refreshExpiryMs",  604_800_000L);

        String token = shortLived.generateAccessToken(1L, "expired@example.com", "JOB_SEEKER");
        Thread.sleep(10);

        assertThrows(ExpiredJwtException.class, () -> shortLived.validateAccessToken(token));
    }
}
