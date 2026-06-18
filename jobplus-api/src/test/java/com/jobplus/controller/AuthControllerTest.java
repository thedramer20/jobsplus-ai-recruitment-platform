package com.jobplus.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthControllerTest {

    @Autowired MockMvc       mockMvc;
    @Autowired ObjectMapper  objectMapper;

    private static final String REGISTER_URL = "/api/auth/register";
    private static final String LOGIN_URL     = "/api/auth/login";
    private static final String REFRESH_URL   = "/api/auth/refresh";

    // ── helpers ────────────────────────────────────────────────────────────────

    private String registerJson(String name, String email, String password, String role) {
        return """
                {"name":"%s","email":"%s","password":"%s","role":"%s"}
                """.formatted(name, email, password, role).strip();
    }

    private String loginJson(String email, String password) {
        return """
                {"email":"%s","password":"%s"}
                """.formatted(email, password).strip();
    }

    // ── tests ──────────────────────────────────────────────────────────────────

    @Test
    void register_withValidData_returns201AndToken() throws Exception {
        mockMvc.perform(post(REGISTER_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson("Alice Tan", "alice@test.com", "password123", "JOB_SEEKER")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.user.email").value("alice@test.com"))
                .andExpect(jsonPath("$.data.user.role").value("JOB_SEEKER"));
    }

    @Test
    void register_withDuplicateEmail_returns409() throws Exception {
        String body = registerJson("Bob", "bob@test.com", "password123", "JOB_SEEKER");
        mockMvc.perform(post(REGISTER_URL).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());

        mockMvc.perform(post(REGISTER_URL).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void register_withInvalidEmail_returns400() throws Exception {
        mockMvc.perform(post(REGISTER_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson("Carol", "not-an-email", "password123", "JOB_SEEKER")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void login_withCorrectCredentials_returns200AndToken() throws Exception {
        mockMvc.perform(post(REGISTER_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson("David", "david@test.com", "password123", "EMPLOYER")))
                .andExpect(status().isCreated());

        mockMvc.perform(post(LOGIN_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson("david@test.com", "password123")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.user.email").value("david@test.com"));
    }

    @Test
    void login_withWrongPassword_returns400() throws Exception {
        mockMvc.perform(post(REGISTER_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson("Emma", "emma@test.com", "password123", "JOB_SEEKER")))
                .andExpect(status().isCreated());

        mockMvc.perform(post(LOGIN_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson("emma@test.com", "wrongpassword")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void refresh_withValidRefreshToken_returns200AndNewAccessToken() throws Exception {
        MvcResult reg = mockMvc.perform(post(REGISTER_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson("Frank", "frank@test.com", "password123", "JOB_SEEKER")))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode body         = objectMapper.readTree(reg.getResponse().getContentAsString());
        String   refreshToken = body.at("/data/refreshToken").asText();

        mockMvc.perform(post(REFRESH_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\":\"" + refreshToken + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty());
    }
}
