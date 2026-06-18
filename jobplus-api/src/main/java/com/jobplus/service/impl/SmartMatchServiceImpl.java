package com.jobplus.service.impl;

import com.jobplus.dto.response.*;
import com.jobplus.exception.ForbiddenException;
import com.jobplus.exception.ResourceNotFoundException;
import com.jobplus.mapper.*;
import com.jobplus.model.*;
import com.jobplus.service.SmartMatchService;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SmartMatchServiceImpl implements SmartMatchService {

    private static final String ALGORITHM_NAME = "JobPlus SmartMatch Algorithm";
    private static final String ALGORITHM_VERSION = "1.0";
    private static final String FORMULA =
            "FinalScore = (SkillMatch × 0.30) + (ExperienceMatch × 0.20) + (EducationMatch × 0.10) + " +
            "(LocationMatch × 0.10) + (KeywordRelevance × 0.15) + (ProfileCompleteness × 0.15)";

    private static final int WEIGHT_SKILL = 30;
    private static final int WEIGHT_EXPERIENCE = 20;
    private static final int WEIGHT_EDUCATION = 10;
    private static final int WEIGHT_LOCATION = 10;
    private static final int WEIGHT_KEYWORD = 15;
    private static final int WEIGHT_COMPLETENESS = 15;

    private static final Pattern NON_ALNUM = Pattern.compile("[^a-z0-9+#/. ]");
    private static final Pattern MULTI_SPACE = Pattern.compile("\\s+");

    private static final Set<String> STOP_WORDS = Set.of(
            "the", "and", "for", "with", "that", "this", "your", "will", "from", "into", "across", "over",
            "our", "you", "are", "who", "how", "what", "when", "where", "their", "them", "have", "has",
            "had", "been", "being", "were", "was", "but", "not", "too", "all", "any", "can", "could",
            "should", "would", "than", "then", "also", "using", "used", "use", "role", "team", "teams",
            "work", "works", "working", "job", "jobs", "build", "support", "within", "through", "while",
            "about", "real", "ideal", "strong", "good", "great", "high", "daily", "closely",
            "looking", "seeking", "hiring", "join", "help", "need", "needs", "plus", "required", "preferred"
    );

    private final JobMapper jobMapper;
    private final SkillMapper skillMapper;
    private final UserMapper userMapper;
    private final SeekerProfileMapper seekerProfileMapper;
    private final ExperienceMapper experienceMapper;
    private final EducationMapper educationMapper;
    private final CompanyMapper companyMapper;
    private final ApplicationMapper applicationMapper;

    @Override
    public SmartMatchResultDTO scoreJobForCandidate(Long candidateUserId, Long jobId) {
        UserSnapshot candidate = loadCandidate(candidateUserId);
        JobSnapshot job = loadJob(jobId);
        return computeMatch(candidate, job, null);
    }

    @Override
    public PaginatedResponseDTO<SmartMatchedJobDTO> rankJobsForCandidate(Long candidateUserId, JobFilterParams params) {
        UserSnapshot candidate = loadCandidate(candidateUserId);
        List<Job> jobs = jobMapper.findOpenForSmartMatch(params);

        List<SmartMatchedJobDTO> ranked = jobs.stream()
                .map(job -> {
                    JobSnapshot snapshot = loadJob(job);
                    SmartMatchResultDTO match = computeMatch(candidate, snapshot, null);
                    return SmartMatchedJobDTO.builder()
                            .job(toJobDTO(job, candidateUserId))
                            .match(match)
                            .build();
                })
                .sorted(Comparator
                        .comparingInt((SmartMatchedJobDTO dto) -> dto.getMatch().getFinalScore()).reversed()
                        .thenComparing((SmartMatchedJobDTO dto) -> dto.getJob().getPostedAt(), Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();

        return pageRankedJobs(ranked, params.getPage(), params.getSize());
    }

    @Override
    public PaginatedResponseDTO<SmartMatchedCandidateDTO> rankApplicantsForJob(Long jobId, Long employerUserId, int page, int size) {
        Job job = jobMapper.findById(jobId);
        if (job == null) throw new ResourceNotFoundException("Job not found: " + jobId);
        if (!Objects.equals(job.getPostedBy(), employerUserId)) throw new ForbiddenException("Not your job");

        JobSnapshot jobSnapshot = loadJob(job);
        List<Application> applications = applicationMapper.findAllByJobId(jobId);

        List<SmartMatchedCandidateDTO> ranked = applications.stream()
                .map(app -> {
                    UserSnapshot candidate = loadCandidate(app.getSeekerId());
                    SmartMatchResultDTO match = computeMatch(candidate, jobSnapshot, app);
                    return SmartMatchedCandidateDTO.builder()
                            .application(toApplicationDTO(app))
                            .match(match)
                            .build();
                })
                .sorted(Comparator
                        .comparingInt((SmartMatchedCandidateDTO dto) -> dto.getMatch().getFinalScore()).reversed()
                        .thenComparing(dto -> dto.getApplication().getAppliedAt(), Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();

        return pageRankedCandidates(ranked, page, size);
    }

    private SmartMatchResultDTO computeMatch(UserSnapshot candidate, JobSnapshot job, Application application) {
        Set<String> candidateSkillNames = candidate.skills.stream()
                .map(Skill::getName)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(TreeSet::new));
        Set<String> candidateSkillTokens = candidateSkillNames.stream()
                .map(this::normalize)
                .filter(s -> !s.isBlank())
                .collect(Collectors.toCollection(LinkedHashSet::new));

        List<String> jobSkillNames = job.skills.stream().map(Skill::getName).filter(Objects::nonNull).toList();
        Set<String> jobSkillTokens = jobSkillNames.stream()
                .map(this::normalize)
                .filter(s -> !s.isBlank())
                .collect(Collectors.toCollection(LinkedHashSet::new));

        List<String> matchedSkillNames = job.skills.stream()
                .map(Skill::getName)
                .filter(Objects::nonNull)
                .filter(name -> candidateSkillTokens.contains(normalize(name)))
                .toList();
        List<String> missingSkills = job.skills.stream()
                .map(Skill::getName)
                .filter(Objects::nonNull)
                .filter(name -> !candidateSkillTokens.contains(normalize(name)))
                .toList();

        int skillScore = scoreSkillMatch(jobSkillNames.size(), matchedSkillNames.size());
        int experienceScore = scoreExperienceMatch(candidate, job);
        int educationScore = scoreEducationMatch(candidate, job);
        int locationScore = scoreLocationMatch(candidate.user.getLocation(), job.job.getLocation(), job.job.getEmploymentType());
        KeywordResult keywordResult = scoreKeywordRelevance(candidate, job);
        int completenessScore = scoreCompleteness(candidate, application);

        int skillWeighted = weighted(skillScore, WEIGHT_SKILL);
        int experienceWeighted = weighted(experienceScore, WEIGHT_EXPERIENCE);
        int educationWeighted = weighted(educationScore, WEIGHT_EDUCATION);
        int locationWeighted = weighted(locationScore, WEIGHT_LOCATION);
        int keywordWeighted = weighted(keywordResult.score, WEIGHT_KEYWORD);
        int completenessWeighted = weighted(completenessScore, WEIGHT_COMPLETENESS);

        int finalScore = clamp(
                skillWeighted + experienceWeighted + educationWeighted +
                        locationWeighted + keywordWeighted + completenessWeighted,
                0, 100
        );

        List<String> strengths = new ArrayList<>();
        if (!matchedSkillNames.isEmpty()) {
            strengths.add("Matched " + matchedSkillNames.size() + " of " + Math.max(jobSkillNames.size(), 1) + " listed job skills: " +
                    joinLimited(matchedSkillNames, 4) + ".");
        }
        if (experienceScore >= 75) {
            strengths.add("Experience level aligns well with the role's " + formatExperienceLevel(job.job.getExperienceLevel()) + " requirement.");
        }
        if (locationScore >= 80) {
            strengths.add("Location fit is strong for this role.");
        }
        if (keywordResult.score >= 70 && !keywordResult.matched.isEmpty()) {
            strengths.add("Profile language overlaps with the role on keywords like " + joinLimited(keywordResult.matched, 5) + ".");
        }
        if (completenessScore >= 75) {
            strengths.add("Profile completeness is strong enough to support recruiter confidence.");
        }

        List<String> recommendations = new ArrayList<>();
        if (!missingSkills.isEmpty()) {
            recommendations.add("Add or strengthen these missing skills to improve fit: " + joinLimited(missingSkills, 5) + ".");
        }
        if (experienceScore < 60) {
            recommendations.add("Strengthen experience alignment by showing more directly relevant projects, tools, or achievements.");
        }
        if (educationScore < 55) {
            recommendations.add("Clarify education relevance by highlighting your degree, field of study, or recent coursework more explicitly.");
        }
        if (locationScore < 60) {
            recommendations.add("Improve location fit by stating remote flexibility, preferred city, or relocation openness.");
        }
        if (completenessScore < 70) {
            recommendations.add("Complete your profile further with a resume, stronger experience detail, and more role-relevant skills.");
        }
        if (recommendations.isEmpty()) {
            recommendations.add("Tailor your application language to this job and focus your strongest achievements near the top of your resume.");
        }

        String verdict = verdict(finalScore);
        String summary = buildSummary(finalScore, matchedSkillNames.size(), jobSkillNames.size(), missingSkills.size(), completenessScore);

        return SmartMatchResultDTO.builder()
                .algorithmName(ALGORITHM_NAME)
                .algorithmVersion(ALGORITHM_VERSION)
                .formula(FORMULA)
                .finalScore(finalScore)
                .verdict(verdict)
                .summary(summary)
                .weights(SmartMatchWeightsDTO.builder()
                        .skillMatch(WEIGHT_SKILL)
                        .experienceMatch(WEIGHT_EXPERIENCE)
                        .educationMatch(WEIGHT_EDUCATION)
                        .locationMatch(WEIGHT_LOCATION)
                        .keywordRelevance(WEIGHT_KEYWORD)
                        .profileCompleteness(WEIGHT_COMPLETENESS)
                        .build())
                .breakdown(SmartMatchBreakdownDTO.builder()
                        .skillMatchScore(skillScore)
                        .experienceMatchScore(experienceScore)
                        .educationMatchScore(educationScore)
                        .locationMatchScore(locationScore)
                        .keywordRelevanceScore(keywordResult.score)
                        .profileCompletenessScore(completenessScore)
                        .skillWeightedContribution(skillWeighted)
                        .experienceWeightedContribution(experienceWeighted)
                        .educationWeightedContribution(educationWeighted)
                        .locationWeightedContribution(locationWeighted)
                        .keywordWeightedContribution(keywordWeighted)
                        .completenessWeightedContribution(completenessWeighted)
                        .build())
                .strengths(trim(strengths, 4))
                .matchedKeywords(trim(keywordResult.matched, 6))
                .missingSkills(trim(missingSkills, 6))
                .recommendations(trim(recommendations, 4))
                .build();
    }

    private int scoreSkillMatch(int requiredCount, int matchedCount) {
        if (requiredCount == 0) return 70;
        double ratio = (double) matchedCount / requiredCount;
        return clamp((int) Math.round(ratio * 100), 0, 100);
    }

    private int scoreExperienceMatch(UserSnapshot candidate, JobSnapshot job) {
        double candidateYears = deriveYearsExperience(candidate);
        double requiredYears = requiredYears(job.job.getExperienceLevel());
        double yearsRatio = requiredYears <= 0 ? 1.0 : Math.min(1.15, candidateYears / requiredYears);
        int yearsScore = clamp((int) Math.round(yearsRatio * 100), 0, 100);

        Set<String> experienceTokens = tokenize(candidate.experiences.stream()
                .map(e -> String.join(" ", safe(e.getTitle()), safe(e.getCompanyName()), safe(e.getDescription())))
                .collect(Collectors.joining(" ")));
        Set<String> jobTokens = importantJobKeywords(job);
        int overlap = overlapCount(experienceTokens, jobTokens);
        int relevanceScore = jobTokens.isEmpty() ? 60 : clamp((int) Math.round((overlap * 100.0) / jobTokens.size()), 0, 100);

        return clamp((int) Math.round((yearsScore * 0.6) + (relevanceScore * 0.4)), 0, 100);
    }

    private int scoreEducationMatch(UserSnapshot candidate, JobSnapshot job) {
        boolean hasEducation = !candidate.educations.isEmpty() || hasText(candidate.profile != null ? candidate.profile.getEducationSummary() : null);
        if (!hasEducation) return 25;

        Set<String> educationTokens = tokenize(candidate.educations.stream()
                .map(e -> String.join(" ", safe(e.getSchool()), safe(e.getDegree()), safe(e.getFieldOfStudy())))
                .collect(Collectors.joining(" ")) + " " + safe(candidate.profile != null ? candidate.profile.getEducationSummary() : null));

        Set<String> targetTokens = new LinkedHashSet<>();
        String title = normalize(job.job.getTitle());
        if (title.contains("engineer") || title.contains("developer") || title.contains("software")) {
            targetTokens.addAll(Set.of("computer", "science", "software", "engineering", "technology", "data"));
        }
        if (title.contains("analyst") || title.contains("data")) {
            targetTokens.addAll(Set.of("data", "analysis", "analytics", "statistics", "mathematics", "finance"));
        }
        if (title.contains("marketing")) {
            targetTokens.addAll(Set.of("marketing", "business", "communications"));
        }
        if (title.contains("finance") || title.contains("risk")) {
            targetTokens.addAll(Set.of("finance", "economics", "accounting", "business"));
        }
        if (title.contains("product")) {
            targetTokens.addAll(Set.of("product", "business", "technology", "design"));
        }

        if (targetTokens.isEmpty()) return 65;
        int matches = overlapCount(educationTokens, targetTokens);
        return clamp(45 + (matches * 15), 0, 100);
    }

    private int scoreLocationMatch(String candidateLocation, String jobLocation, EmploymentType type) {
        if (type == EmploymentType.REMOTE || normalize(jobLocation).contains("remote")) return 100;
        if (!hasText(jobLocation)) return 55;
        if (!hasText(candidateLocation)) return 35;

        String candidateNorm = normalize(candidateLocation);
        String jobNorm = normalize(jobLocation);
        if (candidateNorm.equals(jobNorm) || candidateNorm.contains(jobNorm) || jobNorm.contains(candidateNorm)) return 100;

        Set<String> candidateTokens = tokenize(candidateLocation);
        Set<String> jobTokens = tokenize(jobLocation);
        int overlap = overlapCount(candidateTokens, jobTokens);
        if (overlap >= 2) return 85;
        if (overlap == 1) return 65;
        return 25;
    }

    private KeywordResult scoreKeywordRelevance(UserSnapshot candidate, JobSnapshot job) {
        Set<String> candidateTokens = tokenize(candidateText(candidate));
        Set<String> jobTokens = importantJobKeywords(job);
        if (jobTokens.isEmpty()) return new KeywordResult(60, List.of());

        List<String> matched = jobTokens.stream()
                .filter(candidateTokens::contains)
                .limit(8)
                .toList();
        int score = clamp((int) Math.round((matched.size() * 100.0) / jobTokens.size()), 0, 100);
        return new KeywordResult(score, matched);
    }

    private int scoreCompleteness(UserSnapshot candidate, Application application) {
        int score = 0;
        if (hasText(candidate.user.getHeadline())) score += 15;
        if (hasText(candidate.user.getLocation())) score += 10;
        if (candidate.profile != null && hasText(candidate.profile.getBio())) score += 15;
        if (hasText(candidate.profile != null ? candidate.profile.getResumeUrl() : null) || hasText(application != null ? application.getResumeUrl() : null)) score += 20;
        score += Math.min(15, candidate.skills.size() * 3);
        score += Math.min(15, candidate.experiences.size() * 7);
        score += Math.min(10, candidate.educations.size() * 5);
        return clamp(score, 0, 100);
    }

    private double deriveYearsExperience(UserSnapshot candidate) {
        if (candidate.profile != null && candidate.profile.getYearsExperience() != null && candidate.profile.getYearsExperience() > 0) {
            return candidate.profile.getYearsExperience();
        }
        double totalMonths = 0;
        for (Experience experience : candidate.experiences) {
            if (experience.getStartDate() != null) {
                LocalDate end = experience.getCurrent() != null && experience.getCurrent()
                        ? LocalDate.now()
                        : experience.getEndDate() != null ? experience.getEndDate() : LocalDate.now();
                totalMonths += Math.max(1, ChronoUnit.MONTHS.between(experience.getStartDate(), end));
            } else {
                totalMonths += 10;
            }
        }
        return totalMonths / 12.0;
    }

    private double requiredYears(ExperienceLevel level) {
        if (level == null) return 2;
        return switch (level) {
            case ENTRY -> 0.5;
            case MID -> 2.5;
            case SENIOR -> 4.5;
            case LEAD -> 6.0;
            case MANAGER -> 7.0;
        };
    }

    private Set<String> importantJobKeywords(JobSnapshot job) {
        LinkedHashSet<String> keywords = new LinkedHashSet<>();
        keywords.addAll(job.skills.stream()
                .map(Skill::getName)
                .filter(Objects::nonNull)
                .map(this::normalize)
                .filter(s -> !s.isBlank())
                .toList());

        List<String> titlePriority = tokenizeOrdered(job.job.getTitle());
        titlePriority.stream().limit(6).forEach(keywords::add);

        List<String> descPriority = tokenizeOrdered(job.job.getDescription()).stream()
                .filter(token -> token.length() > 2)
                .limit(18)
                .toList();
        descPriority.forEach(keywords::add);
        return keywords;
    }

    private UserSnapshot loadCandidate(Long userId) {
        User user = userMapper.findById(userId);
        if (user == null) throw new ResourceNotFoundException("User not found");

        return UserSnapshot.builder()
                .user(user)
                .profile(seekerProfileMapper.findByUserId(userId))
                .skills(defaultList(skillMapper.findByUserId(userId)))
                .experiences(defaultList(experienceMapper.findByUserId(userId)))
                .educations(defaultList(educationMapper.findByUserId(userId)))
                .build();
    }

    private JobSnapshot loadJob(Long jobId) {
        Job job = jobMapper.findById(jobId);
        if (job == null) throw new ResourceNotFoundException("Job not found");
        return loadJob(job);
    }

    private JobSnapshot loadJob(Job job) {
        return JobSnapshot.builder()
                .job(job)
                .skills(defaultList(skillMapper.findByJobId(job.getId())))
                .build();
    }

    private JobResponseDTO toJobDTO(Job job, Long currentUserId) {
        Company company = companyMapper.findById(job.getCompanyId());
        CompanyResponseDTO companyDTO = company != null ? CompanyResponseDTO.builder()
                .id(company.getId())
                .name(company.getName())
                .logoUrl(company.getLogoUrl())
                .industry(company.getIndustry())
                .size(company.getSize() != null ? company.getSize().name() : null)
                .location(company.getLocation())
                .website(company.getWebsite())
                .description(company.getDescription())
                .verified(company.getVerified())
                .createdAt(company.getCreatedAt() != null ? company.getCreatedAt().toString() : null)
                .jobCount(companyMapper.countJobsByCompanyId(company.getId()))
                .build() : null;

        return JobResponseDTO.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .location(job.getLocation())
                .employmentType(job.getEmploymentType() != null ? job.getEmploymentType().name() : null)
                .experienceLevel(job.getExperienceLevel() != null ? job.getExperienceLevel().name() : null)
                .salaryMin(job.getSalaryMin())
                .salaryMax(job.getSalaryMax())
                .status(job.getStatus() != null ? job.getStatus().name() : null)
                .postedAt(job.getPostedAt() != null ? job.getPostedAt().toString() : null)
                .deadline(job.getDeadline() != null ? job.getDeadline().toString() : null)
                .updatedAt(job.getUpdatedAt() != null ? job.getUpdatedAt().toString() : null)
                .postedBy(job.getPostedBy())
                .company(companyDTO)
                .savedByCurrentUser(currentUserId != null && jobMapper.isSaved(currentUserId, job.getId()))
                .appliedByCurrentUser(currentUserId != null && applicationMapper.existsByJobAndSeeker(job.getId(), currentUserId))
                .build();
    }

    private ApplicationResponseDTO toApplicationDTO(Application app) {
        JobResponseDTO jobDTO = toJobDTO(jobMapper.findById(app.getJobId()), app.getSeekerId());
        User seeker = userMapper.findById(app.getSeekerId());
        return ApplicationResponseDTO.builder()
                .id(app.getId())
                .jobId(app.getJobId())
                .seekerId(app.getSeekerId())
                .status(app.getStatus() != null ? app.getStatus().name() : null)
                .coverLetter(app.getCoverLetter())
                .resumeUrl(app.getResumeUrl())
                .appliedAt(app.getAppliedAt() != null ? app.getAppliedAt().toString() : null)
                .updatedAt(app.getUpdatedAt() != null ? app.getUpdatedAt().toString() : null)
                .job(jobDTO)
                .seeker(seeker != null ? UserResponseDTO.fromUser(seeker) : null)
                .build();
    }

    private PaginatedResponseDTO<SmartMatchedJobDTO> pageRankedJobs(List<SmartMatchedJobDTO> all, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = size <= 0 ? 20 : size;
        int total = all.size();
        int from = Math.min(safePage * safeSize, total);
        int to = Math.min(from + safeSize, total);
        List<SmartMatchedJobDTO> slice = all.subList(from, to);
        return PaginatedResponseDTO.<SmartMatchedJobDTO>builder()
                .content(slice)
                .totalElements(total)
                .totalPages((int) Math.ceil((double) total / safeSize))
                .currentPage(safePage)
                .pageSize(safeSize)
                .build();
    }

    private PaginatedResponseDTO<SmartMatchedCandidateDTO> pageRankedCandidates(List<SmartMatchedCandidateDTO> all, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = size <= 0 ? 20 : size;
        int total = all.size();
        int from = Math.min(safePage * safeSize, total);
        int to = Math.min(from + safeSize, total);
        List<SmartMatchedCandidateDTO> slice = all.subList(from, to);
        return PaginatedResponseDTO.<SmartMatchedCandidateDTO>builder()
                .content(slice)
                .totalElements(total)
                .totalPages((int) Math.ceil((double) total / safeSize))
                .currentPage(safePage)
                .pageSize(safeSize)
                .build();
    }

    private int weighted(int raw, int weight) {
        return (int) Math.round(raw * (weight / 100.0));
    }

    private int overlapCount(Set<String> left, Set<String> right) {
        int count = 0;
        for (String item : left) {
            if (right.contains(item)) count++;
        }
        return count;
    }

    private Set<String> tokenize(String text) {
        return new LinkedHashSet<>(tokenizeOrdered(text));
    }

    private List<String> tokenizeOrdered(String text) {
        String normalized = normalize(text);
        if (normalized.isBlank()) return List.of();
        return Arrays.stream(normalized.split(" "))
                .map(String::trim)
                .filter(token -> token.length() > 1)
                .filter(token -> !STOP_WORDS.contains(token))
                .toList();
    }

    private String candidateText(UserSnapshot candidate) {
        String skills = candidate.skills.stream().map(Skill::getName).filter(Objects::nonNull).collect(Collectors.joining(" "));
        String experiences = candidate.experiences.stream()
                .map(e -> String.join(" ", safe(e.getTitle()), safe(e.getDescription()), safe(e.getCompanyName())))
                .collect(Collectors.joining(" "));
        String educations = candidate.educations.stream()
                .map(e -> String.join(" ", safe(e.getDegree()), safe(e.getFieldOfStudy()), safe(e.getSchool())))
                .collect(Collectors.joining(" "));
        return String.join(" ",
                safe(candidate.user.getHeadline()),
                safe(candidate.user.getLocation()),
                safe(candidate.profile != null ? candidate.profile.getBio() : null),
                safe(candidate.profile != null ? candidate.profile.getEducationSummary() : null),
                skills,
                experiences,
                educations
        );
    }

    private String normalize(String text) {
        if (text == null) return "";
        String lowered = text.toLowerCase(Locale.ROOT)
                .replace("c++", "cplusplus")
                .replace("c#", "csharp");
        lowered = NON_ALNUM.matcher(lowered).replaceAll(" ");
        lowered = MULTI_SPACE.matcher(lowered).replaceAll(" ").trim();
        return lowered;
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private String joinLimited(List<String> items, int limit) {
        return items.stream().limit(limit).collect(Collectors.joining(", "));
    }

    private <T> List<T> trim(List<T> items, int limit) {
        return items.stream().limit(limit).toList();
    }

    private <T> List<T> defaultList(List<T> items) {
        return items != null ? items : List.of();
    }

    private String verdict(int score) {
        if (score >= 85) return "Excellent Match";
        if (score >= 70) return "Strong Match";
        if (score >= 55) return "Good Match";
        if (score >= 40) return "Developing Match";
        return "Low Match";
    }

    private String buildSummary(int score, int matchedSkills, int totalSkills, int missingSkills, int completeness) {
        if (score >= 85) {
            return "This candidate aligns strongly with the role across the core SmartMatch factors and should rank near the top.";
        }
        if (score >= 70) {
            return "This is a strong match with good alignment on role requirements, but there are still a few improvement opportunities.";
        }
        if (score >= 55) {
            return "There is real potential here, but the fit is uneven and should be strengthened before expecting consistently strong outcomes.";
        }
        if (matchedSkills == 0 && totalSkills > 0) {
            return "The match is currently weak because the profile does not yet show the core skills this role is asking for.";
        }
        if (completeness < 60) {
            return "The profile is missing enough core information that the ranking is being dragged down even before deeper role-fit checks.";
        }
        if (missingSkills >= 3) {
            return "The profile has some overlap, but too many important job requirements are still missing for a strong ranking.";
        }
        return "This candidate currently shows limited alignment with the role and needs stronger evidence in key matching areas.";
    }

    private String formatExperienceLevel(ExperienceLevel level) {
        return level == null ? "open" : level.name().replace('_', ' ').toLowerCase(Locale.ROOT);
    }

    private int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }

    @Value
    private static class KeywordResult {
        int score;
        List<String> matched;
    }

    @Value
    @Builder
    private static class UserSnapshot {
        User user;
        SeekerProfile profile;
        List<Skill> skills;
        List<Experience> experiences;
        List<Education> educations;
    }

    @Value
    @Builder
    private static class JobSnapshot {
        Job job;
        List<Skill> skills;
    }
}
