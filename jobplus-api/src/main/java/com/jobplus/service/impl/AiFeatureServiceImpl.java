package com.jobplus.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobplus.dto.request.AiInterviewCoachRequestDTO;
import com.jobplus.dto.request.AiInterviewFeedbackRequestDTO;
import com.jobplus.dto.response.*;
import com.jobplus.exception.ResourceNotFoundException;
import com.jobplus.exception.ValidationException;
import com.jobplus.mapper.*;
import com.jobplus.model.*;
import com.jobplus.service.AiFeatureService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiFeatureServiceImpl implements AiFeatureService {

    private static final Pattern NUMBER_PATTERN = Pattern.compile(".*\\d+.*");
    private static final List<String> COMMON_KEYWORDS = List.of(
            "java", "spring", "react", "typescript", "javascript", "sql", "mysql", "python", "aws",
            "docker", "kubernetes", "api", "rest", "microservices", "node", "angular", "vue",
            "leadership", "communication", "analytics", "product", "figma", "ui", "ux", "testing",
            "selenium", "cypress", "devops", "ci/cd", "linux", "security", "sales", "marketing",
            "finance", "excel", "power bi", "tableau", "machine learning", "ai", "data", "agile"
    );

    private final UserMapper userMapper;
    private final SeekerProfileMapper seekerProfileMapper;
    private final ExperienceMapper experienceMapper;
    private final EducationMapper educationMapper;
    private final SkillMapper skillMapper;
    private final JobMapper jobMapper;
    private final CompanyMapper companyMapper;

    @Value("${ai.provider:none}") private String aiProvider;
    @Value("${ai.api.key:}") private String apiKey;
    @Value("${ai.model:gpt-3.5-turbo}") private String aiModel;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public AiResumeAnalysisDTO analyzeResume(Long userId) {
        UserSnapshot snapshot = loadUserSnapshot(userId);
        AiResumeAnalysisDTO fallback = buildResumeFallback(snapshot);

        if (!isAiAvailable()) return fallback;

        String prompt = """
                You are an expert resume reviewer. Return JSON only.
                Improve this fallback analysis without changing the schema or adding keys.
                Keep every list concise and practical.

                Candidate profile:
                %s

                Fallback JSON:
                %s
                """.formatted(userSnapshotText(snapshot), toJson(fallback));

        AiResumeAnalysisDTO ai = tryAiJson(prompt, AiResumeAnalysisDTO.class);
        return ai != null ? ai : fallback;
    }

    @Override
    public AiJobMatchDTO getJobMatch(Long userId, Long jobId) {
        UserSnapshot snapshot = loadUserSnapshot(userId);
        JobSnapshot job = loadJobSnapshot(jobId);
        AiJobMatchDTO fallback = buildJobMatchFallback(snapshot, job);

        if (!isAiAvailable()) return fallback;

        String prompt = """
                You are an expert recruiter. Return JSON only.
                Refine this job-match analysis using the candidate and job context below.
                Keep the score realistic and keep each recommendation specific.

                Candidate:
                %s

                Job:
                %s

                Fallback JSON:
                %s
                """.formatted(userSnapshotText(snapshot), jobSnapshotText(job), toJson(fallback));

        AiJobMatchDTO ai = tryAiJson(prompt, AiJobMatchDTO.class);
        return ai != null ? ai : fallback;
    }

    @Override
    public AiInterviewCoachSessionDTO createInterviewSession(Long userId, AiInterviewCoachRequestDTO dto) {
        UserSnapshot snapshot = loadUserSnapshot(userId);
        JobSnapshot target = resolveInterviewTarget(dto);
        AiInterviewCoachSessionDTO fallback = buildInterviewSessionFallback(snapshot, target, dto.getInterviewFocus());

        if (!isAiAvailable()) return fallback;

        String prompt = """
                You are an elite interview coach. Return JSON only.
                Create a focused mock interview session for this candidate and role.
                Use 5 questions max. Keep tips short and actionable.

                Candidate:
                %s

                Role:
                %s

                Fallback JSON:
                %s
                """.formatted(userSnapshotText(snapshot), jobSnapshotText(target), toJson(fallback));

        AiInterviewCoachSessionDTO ai = tryAiJson(prompt, AiInterviewCoachSessionDTO.class);
        return ai != null ? ai : fallback;
    }

    @Override
    public AiInterviewFeedbackDTO evaluateInterviewAnswer(Long userId, AiInterviewFeedbackRequestDTO dto) {
        UserSnapshot snapshot = loadUserSnapshot(userId);
        JobSnapshot target = dto.getJobId() != null
                ? loadJobSnapshot(dto.getJobId())
                : JobSnapshot.builder().title(blankToFallback(dto.getRoleTitle(), "Interview role")).build();
        AiInterviewFeedbackDTO fallback = buildInterviewFeedbackFallback(snapshot, target, dto.getQuestion(), dto.getAnswer());

        if (!isAiAvailable()) return fallback;

        String prompt = """
                You are an interview evaluator. Return JSON only.
                Review the candidate's answer with a supportive but honest tone.
                Keep the score from 0 to 100. Give concrete improvements.

                Candidate:
                %s

                Role:
                %s

                Interview question:
                %s

                Candidate answer:
                %s

                Fallback JSON:
                %s
                """.formatted(
                userSnapshotText(snapshot),
                jobSnapshotText(target),
                dto.getQuestion(),
                dto.getAnswer(),
                toJson(fallback)
        );

        AiInterviewFeedbackDTO ai = tryAiJson(prompt, AiInterviewFeedbackDTO.class);
        return ai != null ? ai : fallback;
    }

    private UserSnapshot loadUserSnapshot(Long userId) {
        User user = userMapper.findById(userId);
        if (user == null) throw new ResourceNotFoundException("User not found");

        SeekerProfile profile = seekerProfileMapper.findByUserId(userId);
        List<Experience> experiences = experienceMapper.findByUserId(userId);
        List<Education> educations = educationMapper.findByUserId(userId);
        List<Skill> skills = skillMapper.findByUserId(userId);

        return UserSnapshot.builder()
                .user(user)
                .profile(profile)
                .experiences(experiences != null ? experiences : List.of())
                .educations(educations != null ? educations : List.of())
                .skills(skills != null ? skills : List.of())
                .build();
    }

    private JobSnapshot loadJobSnapshot(Long jobId) {
        Job job = jobMapper.findById(jobId);
        if (job == null) throw new ResourceNotFoundException("Job not found");
        Company company = job.getCompanyId() != null ? companyMapper.findById(job.getCompanyId()) : null;

        return JobSnapshot.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .location(job.getLocation())
                .employmentType(job.getEmploymentType() != null ? job.getEmploymentType().name() : null)
                .experienceLevel(job.getExperienceLevel() != null ? job.getExperienceLevel().name() : null)
                .salaryMin(job.getSalaryMin())
                .salaryMax(job.getSalaryMax())
                .companyName(company != null ? company.getName() : null)
                .companyIndustry(company != null ? company.getIndustry() : null)
                .build();
    }

    private JobSnapshot resolveInterviewTarget(AiInterviewCoachRequestDTO dto) {
        if (dto.getJobId() != null) return loadJobSnapshot(dto.getJobId());

        String roleTitle = blankToNull(dto.getRoleTitle());
        if (roleTitle == null) throw new ValidationException("Please choose a job or enter a role title");

        return JobSnapshot.builder()
                .title(roleTitle)
                .companyName(blankToNull(dto.getCompanyName()))
                .description(blankToNull(dto.getInterviewFocus()))
                .build();
    }

    private AiResumeAnalysisDTO buildResumeFallback(UserSnapshot snapshot) {
        int score = 18;
        List<String> strengths = new ArrayList<>();
        List<String> improvements = new ArrayList<>();
        List<String> missingSignals = new ArrayList<>();
        List<String> atsTips = new ArrayList<>();
        int skillCount = snapshot.skills.size();
        int experienceCount = snapshot.experiences.size();
        int educationCount = snapshot.educations.size();

        if (hasText(snapshot.user.getHeadline())) {
            score += 10;
            strengths.add("Your profile already has a headline, which helps recruiters understand your positioning quickly.");
        } else {
            missingSignals.add("No professional headline is set.");
            improvements.add("Add a headline that combines your target role, years of experience, and strongest domain.");
        }

        if (hasText(snapshot.profile != null ? snapshot.profile.getResumeUrl() : null)) {
            score += 16;
            strengths.add("You already uploaded a resume, so your application flow is easier and more complete.");
        } else {
            score -= 8;
            missingSignals.add("No uploaded resume is attached to your profile.");
            improvements.add("Upload a resume so recruiters can review your experience in one click.");
        }

        if (experienceCount > 0) {
            score += Math.min(18, 10 + ((experienceCount - 1) * 4));
            strengths.add(experienceCount >= 2
                    ? "You have multiple experience entries, which makes your profile feel more credible and complete."
                    : "Your experience section gives your profile real credibility.");
            boolean quantified = snapshot.experiences.stream()
                    .map(Experience::getDescription)
                    .filter(Objects::nonNull)
                    .anyMatch(desc -> NUMBER_PATTERN.matcher(desc).matches());
            if (quantified) {
                score += 4;
                strengths.add("At least one experience entry includes measurable detail, which makes your impact more believable.");
            } else {
                improvements.add("Add measurable results to experience bullets, such as percentages, revenue, time saved, or users impacted.");
            }
        } else {
            score -= 12;
            missingSignals.add("No work experience entries are listed.");
            improvements.add("Add at least one experience entry with achievements, not just responsibilities.");
        }

        if (skillCount >= 1) {
            score += Math.min(16, 2 + (skillCount * 2));
        }

        if (skillCount >= 8) {
            strengths.add("You have a strong spread of listed skills, which helps matching and ATS filtering.");
        } else if (skillCount >= 5) {
            strengths.add("You have a decent spread of listed skills, which helps matching and ATS filtering.");
        } else if (skillCount >= 3) {
            improvements.add("Add a few more role-relevant skills so your profile looks more complete to recruiters and matching engines.");
        } else if (skillCount == 0) {
            score -= 12;
            missingSignals.add("No skills are listed on your profile.");
            improvements.add("Add role-relevant skills so matching engines and recruiters can identify your fit faster.");
        } else {
            score -= 6;
            missingSignals.add("You have fewer than 5 listed skills.");
            improvements.add("Add more role-relevant skills so matching engines and recruiters can identify your fit faster.");
        }

        if (snapshot.profile != null && hasText(snapshot.profile.getBio())) {
            score += 7;
            strengths.add("Your profile bio adds context beyond job titles.");
        } else {
            improvements.add("Write a short professional summary focused on your niche, strengths, and target role.");
        }

        if (educationCount > 0) {
            score += Math.min(8, 4 + ((educationCount - 1) * 2));
        } else if (snapshot.profile != null && hasText(snapshot.profile.getEducationSummary())) {
            score += 3;
        } else {
            improvements.add("Add education details if they support your target role or recent learning path.");
        }

        score = clamp(score, 18, 96);

        atsTips.add("Mirror important keywords from target job descriptions in your headline, skills, and experience.");
        atsTips.add("Start bullets with action verbs and end with specific outcomes.");
        atsTips.add("Keep formatting simple and avoid burying your strongest achievements below the fold.");

        String summary = score >= 80
                ? "Your profile is already strong, but adding sharper metrics and role-specific keywords would make it more recruiter-ready."
                : score >= 55
                ? "Your resume foundation is solid, but a few missing signals are lowering how convincing it feels."
                : "Your profile needs a stronger professional story before it will consistently stand out to recruiters.";

        String suggestedHeadline = buildSuggestedHeadline(snapshot);

        return AiResumeAnalysisDTO.builder()
                .score(score)
                .summary(summary)
                .strengths(trimList(strengths, 4))
                .improvements(trimList(improvements, 4))
                .missingSignals(trimList(missingSignals, 4))
                .suggestedHeadline(suggestedHeadline)
                .atsTips(trimList(atsTips, 3))
                .build();
    }

    private AiJobMatchDTO buildJobMatchFallback(UserSnapshot snapshot, JobSnapshot job) {
        Set<String> candidateKeywords = extractCandidateKeywords(snapshot);
        Set<String> jobKeywords = extractJobKeywords(job);

        List<String> matched = jobKeywords.stream().filter(candidateKeywords::contains).limit(6).toList();
        List<String> gaps = jobKeywords.stream().filter(k -> !candidateKeywords.contains(k)).limit(5).toList();

        int score = 35 + matched.size() * 9;
        score += experienceAlignmentBonus(snapshot, job);
        if (hasText(snapshot.profile != null ? snapshot.profile.getResumeUrl() : null)) score += 6;
        if (job.getLocation() != null && snapshot.user.getLocation() != null &&
                job.getLocation().toLowerCase().contains(snapshot.user.getLocation().toLowerCase())) {
            score += 5;
        }
        if (job.getLocation() != null && job.getLocation().toLowerCase().contains("remote")) score += 3;
        score = clamp(score, 18, 97);

        List<String> strengths = new ArrayList<>();
        if (!matched.isEmpty()) {
            strengths.add("You already match important keywords for this role: " + String.join(", ", matched) + ".");
        }
        if (!snapshot.experiences.isEmpty()) {
            strengths.add("Your profile includes work experience, which makes your application more credible for this role.");
        }
        if (snapshot.profile != null && snapshot.profile.getYearsExperience() != null) {
            strengths.add("Your stated experience level gives recruiters a clearer idea of your seniority.");
        }

        List<String> recommendations = new ArrayList<>();
        if (!gaps.isEmpty()) {
            recommendations.add("Strengthen your application by addressing these likely gaps: " + String.join(", ", gaps) + ".");
        }
        recommendations.add("Tailor your resume bullets so they reflect the job's exact language and priorities.");
        if (!hasText(snapshot.user.getHeadline())) {
            recommendations.add("Add a stronger headline so this role feels more aligned with your profile at first glance.");
        }

        String verdict = score >= 80 ? "Strong Match" : score >= 60 ? "Promising Match" : score >= 45 ? "Partial Match" : "Stretch Match";
        String summary = switch (verdict) {
            case "Strong Match" -> "Your background lines up well with this job, and a tailored application could make you highly competitive.";
            case "Promising Match" -> "You have a good foundation for this role, but tightening your positioning around the job requirements would help.";
            case "Partial Match" -> "There is overlap, but you should address a few important gaps before expecting a strong response rate.";
            default -> "This role is still reachable, but you would need a carefully targeted application and a strong narrative.";
        };

        return AiJobMatchDTO.builder()
                .score(score)
                .verdict(verdict)
                .summary(summary)
                .matchingStrengths(trimList(strengths, 4))
                .gaps(gaps.isEmpty() ? List.of("No major keyword gaps were detected from the visible profile data.") : gaps)
                .recommendations(trimList(recommendations, 4))
                .build();
    }

    private AiInterviewCoachSessionDTO buildInterviewSessionFallback(UserSnapshot snapshot, JobSnapshot job, String focus) {
        String title = blankToFallback(job.getTitle(), "Interview Session");
        String company = blankToFallback(job.getCompanyName(), "this company");
        String focusText = hasText(focus) ? focus : "behavioral and role-fit";

        List<AiInterviewQuestionDTO> questions = List.of(
                AiInterviewQuestionDTO.builder()
                        .question("Tell me about yourself and why you're a fit for this " + title + " role.")
                        .whyItMatters("Interviewers use this to judge role fit, communication, and whether your story is focused.")
                        .answerTip("Give a short present-past-future answer: who you are now, proof from past work, and why this role is next.")
                        .build(),
                AiInterviewQuestionDTO.builder()
                        .question("What accomplishment best shows you can succeed in this role?")
                        .whyItMatters("This reveals whether you can connect past impact to future value.")
                        .answerTip("Use STAR and include a metric, timeline, or business outcome.")
                        .build(),
                AiInterviewQuestionDTO.builder()
                        .question("What challenge in your last role taught you something important?")
                        .whyItMatters("This checks resilience, ownership, and learning ability.")
                        .answerTip("Choose a real challenge, explain your decision-making, and end with the lesson you now apply.")
                        .build(),
                AiInterviewQuestionDTO.builder()
                        .question("Why do you want to work at " + company + "?")
                        .whyItMatters("Interviewers want proof that your interest is genuine and informed.")
                        .answerTip("Mention something specific about the company or role, then connect it to your background.")
                        .build(),
                AiInterviewQuestionDTO.builder()
                        .question("What would make you effective in your first 90 days here?")
                        .whyItMatters("This shows whether you understand the role beyond surface-level duties.")
                        .answerTip("Talk about learning the context fast, building relationships, and delivering one clear early win.")
                        .build()
        );

        List<String> tips = new ArrayList<>();
        tips.add("Practice answers out loud, not just in your head, so your phrasing becomes natural.");
        tips.add("Prepare 3 to 4 impact stories that you can adapt across multiple questions.");
        tips.add("For this session, focus especially on " + focusText + ".");
        if (!snapshot.skills.isEmpty()) {
            tips.add("Bring your strongest relevant skills into each answer when possible: " +
                    snapshot.skills.stream().limit(4).map(Skill::getName).collect(Collectors.joining(", ")) + ".");
        }

        return AiInterviewCoachSessionDTO.builder()
                .title(title + " Interview Coach")
                .intro("This coaching set is tailored for " + title + " at " + company + ". Start with the first question, answer out loud, then use the feedback tool to improve.")
                .questions(questions)
                .preparationTips(trimList(tips, 4))
                .build();
    }

    private AiInterviewFeedbackDTO buildInterviewFeedbackFallback(UserSnapshot snapshot, JobSnapshot job, String question, String answer) {
        String trimmed = answer == null ? "" : answer.trim();
        String lower = trimmed.toLowerCase();
        int wordCount = trimmed.isBlank() ? 0 : trimmed.split("\\s+").length;

        int score = 35;
        List<String> strengths = new ArrayList<>();
        List<String> improvements = new ArrayList<>();

        if (wordCount >= 60) {
            score += 18;
            strengths.add("Your answer has enough detail to sound substantive instead of rushed.");
        } else {
            improvements.add("Add more detail so your answer feels complete and convincing.");
        }

        if (NUMBER_PATTERN.matcher(trimmed).matches()) {
            score += 15;
            strengths.add("You used numbers or concrete evidence, which makes your answer more credible.");
        } else {
            improvements.add("Add a measurable result or concrete example to make your answer more persuasive.");
        }

        if (containsStarSignal(lower)) {
            score += 14;
            strengths.add("Your answer hints at a clear situation-action-result structure.");
        } else {
            improvements.add("Structure your answer more clearly using situation, action, and result.");
        }

        Set<String> candidateKeywords = extractCandidateKeywords(snapshot);
        Set<String> roleKeywords = extractJobKeywords(job);
        long roleOverlap = roleKeywords.stream().filter(lower::contains).count();
        if (roleOverlap > 0) {
            score += 10;
            strengths.add("Your answer connects back to role-relevant language, which improves fit.");
        } else {
            improvements.add("Tie your answer back to this role by mentioning a relevant skill, tool, or business need.");
        }

        if (lower.contains("learn") || lower.contains("improve") || lower.contains("feedback")) {
            score += 6;
            strengths.add("You show reflection and growth, which interviewers value.");
        }

        score = clamp(score, 20, 96);

        String summary = score >= 80
                ? "This is a strong answer. Tightening a few phrases would make it even more polished."
                : score >= 60
                ? "This answer has promise, but it needs clearer structure or proof points to land better."
                : "The core idea is there, but the answer still feels too general to be memorable.";

        String improvedTip = "Try answering in this order: context, your action, the result, then one sentence on why that matters for " +
                blankToFallback(job.getTitle(), "this role") + ".";

        if (strengths.isEmpty()) {
            strengths.add("You gave an answer to practice from, which is the hardest first step.");
        }
        if (improvements.isEmpty()) {
            improvements.add("Do one more practice run and tighten your opening sentence for even more impact.");
        }

        return AiInterviewFeedbackDTO.builder()
                .score(score)
                .summary(summary)
                .strengths(trimList(strengths, 4))
                .improvements(trimList(improvements, 4))
                .improvedAnswerTip(improvedTip)
                .build();
    }

    private int experienceAlignmentBonus(UserSnapshot snapshot, JobSnapshot job) {
        Integer years = snapshot.profile != null ? snapshot.profile.getYearsExperience() : null;
        if (years == null) years = estimateYears(snapshot.experiences);
        if (years == null) return 0;

        String level = blankToFallback(job.getExperienceLevel(), "").toUpperCase(Locale.ROOT);
        return switch (level) {
            case "ENTRY" -> years <= 2 ? 8 : 4;
            case "MID" -> years >= 2 && years <= 6 ? 10 : years > 6 ? 6 : 2;
            case "SENIOR" -> years >= 5 ? 12 : 3;
            case "LEAD", "MANAGER" -> years >= 7 ? 12 : 2;
            default -> 4;
        };
    }

    private Integer estimateYears(List<Experience> experiences) {
        if (experiences.isEmpty()) return null;
        int minYear = Year.now().getValue();
        int maxYear = Year.now().getValue();
        boolean found = false;
        for (Experience exp : experiences) {
            if (exp.getStartDate() != null) {
                found = true;
                minYear = Math.min(minYear, exp.getStartDate().getYear());
                int endYear = exp.getCurrent() != null && exp.getCurrent()
                        ? Year.now().getValue()
                        : exp.getEndDate() != null ? exp.getEndDate().getYear() : Year.now().getValue();
                maxYear = Math.max(maxYear, endYear);
            }
        }
        return found ? Math.max(0, maxYear - minYear) : null;
    }

    private Set<String> extractCandidateKeywords(UserSnapshot snapshot) {
        Set<String> keywords = new LinkedHashSet<>();
        snapshot.skills.forEach(skill -> keywords.add(skill.getName().toLowerCase(Locale.ROOT)));
        addMatchingKeywords(keywords, snapshot.user.getHeadline());
        if (snapshot.profile != null) {
            addMatchingKeywords(keywords, snapshot.profile.getBio());
            addMatchingKeywords(keywords, snapshot.profile.getEducationSummary());
        }
        snapshot.experiences.forEach(exp -> {
            addMatchingKeywords(keywords, exp.getTitle());
            addMatchingKeywords(keywords, exp.getDescription());
        });
        return keywords;
    }

    private Set<String> extractJobKeywords(JobSnapshot job) {
        Set<String> keywords = new LinkedHashSet<>();
        addMatchingKeywords(keywords, job.getTitle());
        addMatchingKeywords(keywords, job.getDescription());
        addMatchingKeywords(keywords, job.getCompanyIndustry());
        return keywords;
    }

    private void addMatchingKeywords(Set<String> target, String text) {
        if (!hasText(text)) return;
        String lower = text.toLowerCase(Locale.ROOT);
        for (String keyword : COMMON_KEYWORDS) {
            if (lower.contains(keyword)) target.add(keyword);
        }
    }

    private String buildSuggestedHeadline(UserSnapshot snapshot) {
        String latestTitle = snapshot.experiences.isEmpty() ? null : snapshot.experiences.get(0).getTitle();
        Integer years = snapshot.profile != null ? snapshot.profile.getYearsExperience() : estimateYears(snapshot.experiences);
        if (hasText(latestTitle) && years != null && years > 0) {
            return latestTitle + " with " + years + "+ years building measurable business impact";
        }
        if (hasText(latestTitle)) return latestTitle + " focused on delivering measurable results";
        return "Job seeker focused on delivering measurable results and continuous growth";
    }

    private boolean containsStarSignal(String lower) {
        return lower.contains("result") || lower.contains("outcome") || lower.contains("so that")
                || lower.contains("i led") || lower.contains("i built") || lower.contains("i improved")
                || lower.contains("i reduced") || lower.contains("i increased");
    }

    private boolean isAiAvailable() {
        return apiKey != null && !apiKey.isBlank()
                && ("openai".equalsIgnoreCase(aiProvider) || "groq".equalsIgnoreCase(aiProvider));
    }

    private <T> T tryAiJson(String prompt, Class<T> type) {
        try {
            String text = callAi(prompt);
            String json = extractJson(text);
            if (json == null) return null;
            return objectMapper.readValue(json, type);
        } catch (Exception e) {
            log.warn("AI feature fallback triggered: {}", e.getMessage());
            return null;
        }
    }

    private String callAi(String prompt) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("model", aiModel);
        requestBody.put("temperature", 0.3);
        requestBody.put("messages", List.of(
                Map.of("role", "system", "content", "Return valid JSON only. Do not wrap it in markdown."),
                Map.of("role", "user", "content", prompt)
        ));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(apiUrl(), entity, String.class);
        JsonNode root = objectMapper.readTree(response.getBody());
        JsonNode content = root.path("choices").path(0).path("message").path("content");
        if (content.isMissingNode() || content.asText().isBlank()) {
            throw new IllegalStateException("AI response was empty");
        }
        return content.asText();
    }

    private String apiUrl() {
        return "groq".equalsIgnoreCase(aiProvider)
                ? "https://api.groq.com/openai/v1/chat/completions"
                : "https://api.openai.com/v1/chat/completions";
    }

    private String extractJson(String text) {
        String trimmed = text.trim();
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;
        int start = trimmed.indexOf('{');
        int end = trimmed.lastIndexOf('}');
        if (start >= 0 && end > start) return trimmed.substring(start, end + 1);
        return null;
    }

    private String userSnapshotText(UserSnapshot snapshot) {
        String skills = snapshot.skills.stream().map(Skill::getName).collect(Collectors.joining(", "));
        String experience = snapshot.experiences.stream()
                .limit(4)
                .map(exp -> exp.getTitle() + " at " + exp.getCompanyName() +
                        (hasText(exp.getDescription()) ? " — " + exp.getDescription() : ""))
                .collect(Collectors.joining("\n- ", "- ", ""));
        String education = snapshot.educations.stream()
                .limit(3)
                .map(edu -> edu.getSchool() +
                        (hasText(edu.getDegree()) ? " — " + edu.getDegree() : ""))
                .collect(Collectors.joining("\n- ", "- ", ""));

        return """
                Name: %s
                Headline: %s
                Location: %s
                Bio: %s
                Years experience: %s
                Resume uploaded: %s
                Skills: %s
                Experience:
                %s
                Education:
                %s
                """.formatted(
                snapshot.user.getName(),
                blankToFallback(snapshot.user.getHeadline(), "None"),
                blankToFallback(snapshot.user.getLocation(), "None"),
                blankToFallback(snapshot.profile != null ? snapshot.profile.getBio() : null, "None"),
                snapshot.profile != null && snapshot.profile.getYearsExperience() != null ? snapshot.profile.getYearsExperience() : "Unknown",
                hasText(snapshot.profile != null ? snapshot.profile.getResumeUrl() : null) ? "Yes" : "No",
                blankToFallback(skills, "None"),
                blankToFallback(experience, "- None"),
                blankToFallback(education, "- None")
        );
    }

    private String jobSnapshotText(JobSnapshot job) {
        String salary = job.getSalaryMin() != null || job.getSalaryMax() != null
                ? "%s - %s".formatted(
                job.getSalaryMin() != null ? job.getSalaryMin().toPlainString() : "N/A",
                job.getSalaryMax() != null ? job.getSalaryMax().toPlainString() : "N/A"
        )
                : "Not specified";

        return """
                Title: %s
                Company: %s
                Industry: %s
                Location: %s
                Employment type: %s
                Experience level: %s
                Salary: %s
                Description: %s
                """.formatted(
                blankToFallback(job.getTitle(), "Unknown role"),
                blankToFallback(job.getCompanyName(), "Unknown company"),
                blankToFallback(job.getCompanyIndustry(), "Unknown"),
                blankToFallback(job.getLocation(), "Unknown"),
                blankToFallback(job.getEmploymentType(), "Unknown"),
                blankToFallback(job.getExperienceLevel(), "Unknown"),
                salary,
                blankToFallback(job.getDescription(), "No description provided")
        );
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            return "{}";
        }
    }

    private List<String> trimList(List<String> items, int max) {
        return items.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .distinct()
                .limit(max)
                .toList();
    }

    private int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String blankToFallback(String value, String fallback) {
        return hasText(value) ? value : fallback;
    }

    private String blankToNull(String value) {
        return hasText(value) ? value.trim() : null;
    }

    @lombok.Builder
    private static class UserSnapshot {
        private User user;
        private SeekerProfile profile;
        private List<Experience> experiences;
        private List<Education> educations;
        private List<Skill> skills;
    }

    @lombok.Builder
    @lombok.Data
    private static class JobSnapshot {
        private Long id;
        private String title;
        private String description;
        private String location;
        private String employmentType;
        private String experienceLevel;
        private BigDecimal salaryMin;
        private BigDecimal salaryMax;
        private String companyName;
        private String companyIndustry;
    }
}
